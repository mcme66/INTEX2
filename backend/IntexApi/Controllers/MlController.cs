using System.Text.Json;
using IntexApi.Data;
using IntexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace IntexApi.Controllers;

public sealed record NotebookStatusDto(
    string Notebook,
    string Status,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    string? ErrorMessage);

public sealed record MlStatusResponse(
    bool IsRefreshing,
    List<NotebookStatusDto> Notebooks);

public sealed record MlDomainSummaryDto(
    string Domain,
    string Summary,
    DateTime RefreshedAt);

public sealed record MlPredictionDto(
    int Id,
    string Notebook,
    string RecordId,
    string RecordType,
    string Label,
    decimal? Score,
    string? Tier,
    string? MetaJson,
    DateTime RefreshedAt);

public sealed record MlPredictionsResponse(
    string Notebook,
    int TotalCount,
    int Page,
    int PageSize,
    List<MlPredictionDto> Records);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class MlController(AppDbContext db, NotebookRunnerService runner, IOptions<MlOptions> mlOpts) : ControllerBase
{
    [HttpGet("artifacts/{domain}/{*filename}")]
    public IActionResult GetArtifact(string domain, string filename)
    {
        var allowedExtensions = new[] { ".json", ".txt" };
        var ext = Path.GetExtension(filename).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = "Only .json and .txt artifacts are served." });

        var outputDir = Path.GetFullPath(
            Path.Combine(mlOpts.Value.NotebooksDir, "..", "output"));
        var filePath = Path.GetFullPath(Path.Combine(outputDir, domain, filename));

        if (!filePath.StartsWith(outputDir))
            return BadRequest(new { message = "Invalid path." });

        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = $"Artifact not found: {domain}/{filename}" });

        var content = System.IO.File.ReadAllText(filePath);

        if (ext == ".json")
        {
            var cleaned = content.Replace(": NaN", ": null").Replace(":NaN", ":null");
            return Content(cleaned, "application/json");
        }
        return Content(content, "text/plain");
    }

    [HttpGet("status")]
    public async Task<ActionResult<MlStatusResponse>> GetStatus(CancellationToken ct)
    {
        var rows = await db.Database
            .SqlQueryRaw<NotebookStatusDto>(
                """
                SELECT notebook AS "Notebook", status AS "Status",
                       started_at AS "StartedAt", completed_at AS "CompletedAt",
                       error_message AS "ErrorMessage"
                FROM ml_notebook_status
                ORDER BY notebook
                """)
            .ToListAsync(ct);

        return Ok(new MlStatusResponse(runner.IsRefreshing, rows));
    }

    /// <summary>
    /// Fast refresh: re-scores all prediction pipelines using saved model1.sav files.
    /// Completes in seconds. Does NOT retrain models.
    /// </summary>
    [HttpPost("refresh")]
    public ActionResult Refresh()
    {
        if (runner.IsRefreshing)
            return Conflict(new { message = "Refresh already in progress." });
        runner.EnqueueRefresh();
        return Accepted(new { message = "Refresh started." });
    }

    /// <summary>
    /// Full retrain: re-runs all notebooks (explanatory + prediction) from scratch.
    /// This retrains models and may take several minutes. Normally handled by the nightly cron.
    /// </summary>
    [HttpPost("retrain")]
    public ActionResult Retrain()
    {
        if (runner.IsRefreshing)
            return Conflict(new { message = "Retrain already in progress." });
        runner.EnqueueFullRetrain();
        return Accepted(new { message = "Full retrain started." });
    }

    [HttpGet("summaries")]
    public async Task<ActionResult<List<MlDomainSummaryDto>>> GetSummaries(CancellationToken ct)
    {
        var rows = await db.Database
            .SqlQueryRaw<MlDomainSummaryDto>(
                """
                SELECT domain AS "Domain", summary AS "Summary", refreshed_at AS "RefreshedAt"
                FROM ml_domain_summaries
                ORDER BY domain
                """)
            .ToListAsync(ct);
        return Ok(rows);
    }

    [HttpGet("predictions/{notebook}")]
    public async Task<ActionResult<MlPredictionsResponse>> GetPredictions(
        string notebook,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool all = false,
        [FromQuery] string sort = "score_desc",
        CancellationToken ct = default)
    {
        if (pageSize > 200) pageSize = 200;
        var offset = (page - 1) * pageSize;

        var orderClause = sort switch
        {
            "score_asc"  => "score ASC NULLS LAST",
            "label_asc"  => "label ASC",
            "label_desc" => "label DESC",
            _            => "score DESC NULLS LAST",
        };

        var total = await db.Database
            .SqlQueryRaw<int>("SELECT COUNT(*)::int AS \"Value\" FROM ml_predictions WHERE notebook = {0}", notebook)
            .FirstAsync(ct);

        const string selectCols =
            """
            SELECT id AS "Id", notebook AS "Notebook", record_id AS "RecordId",
                   record_type AS "RecordType", label AS "Label", score AS "Score",
                   tier AS "Tier", meta_json AS "MetaJson", refreshed_at AS "RefreshedAt"
            FROM ml_predictions
            WHERE notebook = {0}
            ORDER BY
            """;

        List<MlPredictionDto> records;
        if (all)
        {
            records = await db.Database
                .SqlQueryRaw<MlPredictionDto>(selectCols + " " + orderClause, notebook)
                .ToListAsync(ct);
        }
        else
        {
            records = await db.Database
                .SqlQueryRaw<MlPredictionDto>(
                    selectCols + $" {orderClause} LIMIT {{1}} OFFSET {{2}}", notebook, pageSize, offset)
                .ToListAsync(ct);
        }

        return Ok(new MlPredictionsResponse(notebook, total, page, pageSize, records));
    }
}
