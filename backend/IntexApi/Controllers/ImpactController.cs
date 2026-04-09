using System.Text.Json;
using IntexApi.Data;
using IntexApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record SafehouseOccupancy(string Name, int Occupancy, int Capacity);
public sealed record YearlyAdmissions(int Year, int Count);
public sealed record ReintegrationBreakdown(string Status, int Count);
public sealed record DonationBreakdown(string Type, decimal TotalValue);
public sealed record YearlyDonations(int Year, decimal TotalValue);

public sealed record ImpactStatsDto(
    int ActiveResidents,
    int TotalResidents,
    int ReintegrationProgressCount,
    decimal TotalContributionsValue,
    int UniqueSuporters,
    List<SafehouseOccupancy> SafehouseOccupancy,
    List<YearlyAdmissions> ResidentsByYear,
    List<ReintegrationBreakdown> ReintegrationBreakdown,
    List<DonationBreakdown> DonationBreakdown,
    List<YearlyDonations> DonationsByYear,
    decimal TotalVolunteerHours,
    decimal AvgDonationPerIndividual,
    decimal AvgDonationPerOrganization
);

[ApiController]
[Route("api/[controller]")]
public sealed class ImpactController(AppDbContext db, ImpactCacheService cache) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<ImpactStatsDto>> GetStats([FromQuery] bool live = false, CancellationToken ct = default)
    {
        // ?live=true bypasses cache and queries DB directly (used by the refresh button)
        if (!live)
        {
            var row = await db.Database
                .SqlQueryRaw<string>("SELECT payload_json AS \"Value\" FROM impact_stats_cache WHERE id = 1")
                .FirstOrDefaultAsync(ct);

            if (row is not null)
            {
                var cached = JsonSerializer.Deserialize<ImpactStatsDto>(row);
                if (cached is not null) return Ok(cached);
            }
        }

        // Live query — also refreshes the cache so subsequent cached reads are up to date
        var stats = await ImpactQueryHelper.ComputeAsync(db, ct);
        _ = cache.RefreshAsync();
        return Ok(stats);
    }
}
