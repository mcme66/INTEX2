using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text.Json;
using IntexApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace IntexApi.Services;

public sealed class NotebookRunnerService(
    IServiceScopeFactory scopeFactory,
    IOptions<MlOptions> mlOptions,
    ILogger<NotebookRunnerService> logger) : BackgroundService
{
    // Explanatory runs before prediction so the summary is ready when prediction completes.
    public static readonly string[] AllNotebooks =
    [
        "donor-acquisition-explanatory",
        "donor-acquisition-prediction",
        "donor-churn-explanatory",
        "donor-churn-prediction",
        "incident-explanatory",
        "incident-prediction",
        "reintegration-explanatory",
        "reintegration-prediction",
        "social-media-explanatory",
        "social-media-prediction",
        "volunteer-explanatory",
        "volunteer-prediction",
    ];

    // Prediction-only notebooks (no full training — just score with existing model1.sav)
    public static readonly string[] PredictionNotebooks =
    [
        "donor-acquisition-prediction",
        "donor-churn-prediction",
        "incident-prediction",
        "reintegration-prediction",
        "social-media-prediction",
        "volunteer-prediction",
    ];

    private static readonly Dictionary<string, string> NotebookFileNames = new()
    {
        ["donor-acquisition-prediction"]  = "DonorAcquisitionPrediction.ipynb",
        ["donor-acquisition-explanatory"] = "DonorAcquisitionExplanatory.ipynb",
        ["donor-churn-prediction"]        = "DonorChurnPrediction.ipynb",
        ["donor-churn-explanatory"]       = "DonorChurnExplanatory.ipynb",
        ["incident-prediction"]           = "IncidentPrediction.ipynb",
        ["incident-explanatory"]          = "IncidentExplanatory.ipynb",
        ["reintegration-prediction"]      = "ReintegrationPrediction.ipynb",
        ["reintegration-explanatory"]     = "ReintegrationExplanatory.ipynb",
        ["social-media-prediction"]       = "SocialMediaPrediction.ipynb",
        ["social-media-explanatory"]      = "SocialMediaExplanatory.ipynb",
        ["volunteer-prediction"]          = "VolunteerPrediction.ipynb",
        ["volunteer-explanatory"]         = "VolunteerExplanatory.ipynb",
    };

    private readonly ConcurrentQueue<(string notebook, bool scoreOnly)> _queue = new();
    private readonly SemaphoreSlim _signal = new(0);
    private bool _running;

    public bool IsRefreshing => _running;

    /// <summary>
    /// Fast refresh: re-scores all prediction pipelines using saved model1.sav files.
    /// Explanatory notebooks are skipped. Completes in seconds instead of minutes.
    /// </summary>
    public void EnqueueRefresh()
    {
        if (_running) return;
        foreach (var nb in PredictionNotebooks)
            _queue.Enqueue((nb, scoreOnly: true));
        _signal.Release();
    }

    /// <summary>
    /// Full retrain: runs all notebooks (explanatory + prediction) from scratch.
    /// Called by the nightly cron job to retrain models with fresh data.
    /// </summary>
    public void EnqueueFullRetrain()
    {
        if (_running) return;
        foreach (var nb in AllNotebooks)
            _queue.Enqueue((nb, scoreOnly: false));
        _signal.Release();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // On startup: use fast score-only refresh if all model1.sav files exist;
        // only do a full retrain if any model is missing (first-ever run).
        var nbDir = Path.GetFullPath(mlOptions.Value.NotebooksDir);
        var outputDir = Path.GetFullPath(Path.Combine(nbDir, "..", "output"));
        var allModelsExist = PredictionNotebooks.All(nb =>
            File.Exists(Path.Combine(outputDir, nb, "model1.sav"))
            || File.Exists(Path.Combine(outputDir, nb, "models", "model1.sav")));

        if (allModelsExist)
        {
            logger.LogInformation("ML startup: all model1.sav files found — running fast score-only refresh");
            EnqueueRefresh();
        }
        else
        {
            logger.LogInformation("ML startup: missing model1.sav — running full retrain");
            EnqueueFullRetrain();
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            await _signal.WaitAsync(stoppingToken);
            _running = true;
            try
            {
                // Drain the queue into a batch
                var batch = new List<(string notebook, bool scoreOnly)>();
                while (_queue.TryDequeue(out var item))
                    batch.Add(item);

                if (batch.Count == 0) continue;

                // If all items in this batch are score-only, run them in parallel for speed.
                // Full retrains run sequentially to avoid memory pressure.
                if (batch.All(b => b.scoreOnly))
                {
                    logger.LogInformation("ML: running {count} score-only notebooks in parallel", batch.Count);
                    await Task.WhenAll(batch.Select(b => RunNotebookAsync(b.notebook, true, stoppingToken)));
                }
                else
                {
                    foreach (var item in batch)
                        await RunNotebookAsync(item.notebook, item.scoreOnly, stoppingToken);
                }
            }
            finally
            {
                _running = false;
            }
        }
    }

    private async Task RunNotebookAsync(string notebookKey, bool scoreOnly, CancellationToken ct)
    {
        var opts = mlOptions.Value;
        var nbDir = Path.GetFullPath(opts.NotebooksDir);
        var nbFile = NotebookFileNames[notebookKey];
        var nbPath = Path.Combine(nbDir, nbFile);

        var mode = scoreOnly ? "score-only" : "full";
        logger.LogInformation("ML: starting {notebook} ({mode})", notebookKey, mode);
        await SetStatusAsync(notebookKey, "running", null, null);

        var outputRoot = Path.GetFullPath(Path.Combine(nbDir, "..", "output"));

        try
        {
            // If score-only: verify model1.sav exists before attempting to run
            if (scoreOnly)
            {
                var outDir = Path.Combine(outputRoot, notebookKey);
                var modelPath = Path.Combine(outDir, "model1.sav");
                var modelPathAlt = Path.Combine(outDir, "models", "model1.sav");
                if (!File.Exists(modelPath) && !File.Exists(modelPathAlt))
                {
                    logger.LogWarning("ML: score-only skip {notebook} — model1.sav not found at {path}", notebookKey, modelPath);
                    await SetStatusAsync(notebookKey, "error", "model1.sav not found — run full retrain first", null);
                    return;
                }
            }

            var psi = new ProcessStartInfo
            {
                FileName = opts.PythonExecutable,
                Arguments = $"-m jupyter nbconvert --to notebook --execute --inplace \"{nbPath}\" --ExecutePreprocessor.timeout=600",
                WorkingDirectory = nbDir,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            psi.Environment["DATABASE_URL"] = opts.DatabaseUrl;
            if (scoreOnly)
                psi.Environment["SCORE_ONLY"] = "1";

            using var proc = Process.Start(psi)!;
            var stderr = await proc.StandardError.ReadToEndAsync(ct);
            await proc.WaitForExitAsync(ct);

            // nbconvert often exits 1 even on success (sys.exit(0) in SCORE_ONLY, or warnings in full mode).
            // Treat as success if the expected output file was written.
            if (proc.ExitCode != 0)
            {
                var outDir2 = Path.Combine(outputRoot, notebookKey);
                // For prediction notebooks: decision_rules.json
                // For explanatory notebooks: domain_summary.json
                var successFile = Path.Combine(outDir2, "decision_rules.json");
                if (!File.Exists(successFile)) successFile = Path.Combine(outDir2, "models", "decision_rules.json");
                if (!File.Exists(successFile)) successFile = Path.Combine(outDir2, "json", "decision_rules.json");
                if (!File.Exists(successFile)) successFile = Path.Combine(outDir2, "domain_summary.json");

                if (File.Exists(successFile))
                {
                    logger.LogInformation("ML: {notebook} completed with exit {code} (output present, treating as success)", notebookKey, proc.ExitCode);
                }
                else
                {
                    throw new Exception($"nbconvert exit {proc.ExitCode}: {stderr[..Math.Min(500, stderr.Length)]}");
                }
            }

            await IngestResultsAsync(notebookKey, outputRoot, ct);
            await SetStatusAsync(notebookKey, "complete", null, DateTime.UtcNow);
            logger.LogInformation("ML: completed {notebook} ({mode})", notebookKey, mode);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "ML: failed {notebook}", notebookKey);
            await SetStatusAsync(notebookKey, "error", ex.Message[..Math.Min(500, ex.Message.Length)], null);
        }
    }

    private async Task SetStatusAsync(string notebook, string status, string? error, DateTime? completedAt)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var started = status == "running" ? (DateTime?)DateTime.UtcNow : null;
        await db.Database.ExecuteSqlRawAsync(
            """
            INSERT INTO ml_notebook_status (notebook, status, started_at, completed_at, error_message)
            VALUES ({0}, {1}, {2}, {3}, {4})
            ON CONFLICT (notebook) DO UPDATE
              SET status        = EXCLUDED.status,
                  started_at    = COALESCE(EXCLUDED.started_at,    ml_notebook_status.started_at),
                  completed_at  = COALESCE(EXCLUDED.completed_at,  ml_notebook_status.completed_at),
                  error_message = EXCLUDED.error_message
            """,
            notebook, status, started, completedAt, error);
    }

    // ── Domain key mapping (explanatory notebooks → domain name stored in DB) ──
    private static readonly Dictionary<string, string> ExplanatoryDomainKeys = new()
    {
        ["donor-acquisition-explanatory"] = "donor",
        ["donor-churn-explanatory"]       = "donor-churn",
        ["incident-explanatory"]          = "incident",
        ["reintegration-explanatory"]     = "reintegration",
        ["social-media-explanatory"]      = "social-media",
        ["volunteer-explanatory"]         = "volunteer",
    };

    // ── Result ingestion ─────────────────────────────────────────────────────
    // After each notebook runs, read its decision_rules.json / model_summary.json
    // and write scored records into ml_predictions.
    // Explanatory notebooks also write domain_summary.json → ml_domain_summaries.

    private async Task IngestResultsAsync(string notebookKey, string outputRoot, CancellationToken ct)
    {
        var outDir = Path.Combine(outputRoot, notebookKey);
        var modelsDir = Path.Combine(outDir, "models");
        var jsonDir = Path.Combine(outDir, "json");

        // ── Domain summary ingestion (explanatory notebooks only) ────────────
        if (ExplanatoryDomainKeys.TryGetValue(notebookKey, out var domainKey))
        {
            var summaryFile = Path.Combine(outDir, "domain_summary.json");
            if (File.Exists(summaryFile))
            {
                try
                {
                    var summaryJson = await File.ReadAllTextAsync(summaryFile, ct);
                    var summaryDoc = JsonDocument.Parse(summaryJson);
                    if (summaryDoc.RootElement.TryGetProperty("summary", out var summaryProp))
                    {
                        var summaryText = summaryProp.GetString() ?? "";
                        using var summaryScope = scopeFactory.CreateScope();
                        var summaryDb = summaryScope.ServiceProvider.GetRequiredService<AppDbContext>();
                        await summaryDb.Database.ExecuteSqlRawAsync(
                            """
                            INSERT INTO ml_domain_summaries (domain, summary, refreshed_at)
                            VALUES ({0}, {1}, {2})
                            ON CONFLICT (domain) DO UPDATE
                              SET summary = EXCLUDED.summary, refreshed_at = EXCLUDED.refreshed_at
                            """,
                            domainKey, summaryText, DateTime.UtcNow);
                        logger.LogInformation("ML ingest: domain summary stored for {domain}", domainKey);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "ML ingest: failed to read domain_summary.json for {notebook}", notebookKey);
                }
            }
        }

        // Only prediction notebooks produce decision_rules.json — explanatory notebooks don't.
        // Never fall back to model_summary.json (it can contain NaN which is invalid JSON).
        var predictionsFile = Path.Combine(outDir, "decision_rules.json");
        if (!File.Exists(predictionsFile))
            predictionsFile = Path.Combine(modelsDir, "decision_rules.json");
        if (!File.Exists(predictionsFile))
            predictionsFile = Path.Combine(jsonDir, "decision_rules.json");

        if (!File.Exists(predictionsFile))
        {
            logger.LogInformation("ML ingest: no decision_rules.json for {notebook} (explanatory notebook — skipping predictions)", notebookKey);
            return;
        }

        var json = await File.ReadAllTextAsync(predictionsFile, ct);
        var doc = JsonDocument.Parse(json);

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Clear old predictions for this notebook
        await db.Database.ExecuteSqlRawAsync(
            "DELETE FROM ml_predictions WHERE notebook = {0}", notebookKey);

        var now = DateTime.UtcNow;
        var (recordType, labelKey) = notebookKey switch
        {
            var n when n.Contains("donor")      => ("donor", "supporter_id"),
            var n when n.Contains("volunteer")  => ("volunteer", "supporter_id"),
            var n when n.Contains("incident")   => ("incident", "incident_id"),
            var n when n.Contains("reintegr")   => ("resident", "resident_id"),
            var n when n.Contains("social")     => ("social_media", "post_id"),
            _                                   => ("record", "id"),
        };

        // Parse scored records from decision_rules — format varies by notebook
        // We look for arrays of objects with an id field and a score/probability/risk field
        var inserted = 0;
        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in doc.RootElement.EnumerateArray())
            {
                var recordId = TryGetId(item, labelKey);
                if (recordId is null) continue;
                var label = TryGetString(item, "display_name") ?? TryGetString(item, "name") ?? recordId;
                var score = TryGetDecimal(item, "probability") ?? TryGetDecimal(item, "score") ?? TryGetDecimal(item, "risk_score");
                var tier = TryGetString(item, "tier") ?? TryGetString(item, "risk_level") ?? TryGetString(item, "status");
                var meta = item.GetRawText();

                await db.Database.ExecuteSqlRawAsync(
                    """
                    INSERT INTO ml_predictions (notebook, record_id, record_type, label, score, tier, meta_json, refreshed_at)
                    VALUES ({0},{1},{2},{3},{4},{5},{6},{7})
                    ON CONFLICT (notebook, record_id) DO UPDATE
                      SET label=EXCLUDED.label, score=EXCLUDED.score, tier=EXCLUDED.tier,
                          meta_json=EXCLUDED.meta_json, refreshed_at=EXCLUDED.refreshed_at
                    """,
                    notebookKey, recordId, recordType, label, score, tier, meta, now);
                inserted++;
            }
        }
        else if (doc.RootElement.TryGetProperty("records", out var records) && records.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in records.EnumerateArray())
            {
                var recordId = TryGetId(item, labelKey);
                if (recordId is null) continue;
                var label = TryGetString(item, "display_name") ?? TryGetString(item, "name") ?? recordId;
                var score = TryGetDecimal(item, "probability") ?? TryGetDecimal(item, "score");
                var tier = TryGetString(item, "tier") ?? TryGetString(item, "risk_level");
                var meta = item.GetRawText();

                await db.Database.ExecuteSqlRawAsync(
                    """
                    INSERT INTO ml_predictions (notebook, record_id, record_type, label, score, tier, meta_json, refreshed_at)
                    VALUES ({0},{1},{2},{3},{4},{5},{6},{7})
                    ON CONFLICT (notebook, record_id) DO UPDATE
                      SET label=EXCLUDED.label, score=EXCLUDED.score, tier=EXCLUDED.tier,
                          meta_json=EXCLUDED.meta_json, refreshed_at=EXCLUDED.refreshed_at
                    """,
                    notebookKey, recordId, recordType, label, score, tier, meta, now);
                inserted++;
            }
        }

        logger.LogInformation("ML ingest: {notebook} → {count} records", notebookKey, inserted);
    }

    private static string? TryGetId(JsonElement el, string preferredKey)
    {
        if (el.TryGetProperty(preferredKey, out var v)) return v.ToString();
        foreach (var prop in el.EnumerateObject())
            if (prop.Name.EndsWith("_id", StringComparison.OrdinalIgnoreCase))
                return prop.Value.ToString();
        return null;
    }

    private static string? TryGetString(JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    private static decimal? TryGetDecimal(JsonElement el, string key)
    {
        if (!el.TryGetProperty(key, out var v)) return null;
        if (v.ValueKind == JsonValueKind.Number && v.TryGetDecimal(out var d)) return d;
        return null;
    }
}
