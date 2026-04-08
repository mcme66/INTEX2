namespace IntexApi.Services;

/// <summary>
/// Nightly cron: re-trains all ML models by running the full notebooks (explanatory + prediction).
/// Fires once per day at 11:00 UTC (5:00 AM Mountain Daylight Time / MDT, UTC-6).
/// On startup it also schedules the next run so the service is resilient to backend restarts.
/// </summary>
public sealed class MlRetrainCronService(
    NotebookRunnerService runner,
    ILogger<MlRetrainCronService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("ML cron: nightly retrain service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = TimeUntilNext11AmUtc();
            logger.LogInformation("ML cron: next full retrain in {delay:hh\\:mm\\:ss}", delay);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            if (stoppingToken.IsCancellationRequested) break;

            logger.LogInformation("ML cron: triggering nightly full retrain");
            runner.EnqueueFullRetrain();

            // Wait a bit so we don't fire twice in the same midnight minute
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        }
    }

    private static TimeSpan TimeUntilNext11AmUtc()
    {
        // 11:00 UTC = 5:00 AM Mountain Daylight Time (MDT, UTC-6)
        var now = DateTime.UtcNow;
        var todayTarget = now.Date.AddHours(11);
        var next = now < todayTarget ? todayTarget : todayTarget.AddDays(1);
        return next - now;
    }
}
