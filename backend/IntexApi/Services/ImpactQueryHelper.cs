using IntexApi.Controllers;
using IntexApi.Data;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Services;

public static class ImpactQueryHelper
{
    public static async Task<ImpactStatsDto> ComputeAsync(AppDbContext db, CancellationToken ct)
    {
        var activeResidents = await db.Database
            .SqlQueryRaw<int>("SELECT COALESCE(SUM(current_occupancy),0)::int AS \"Value\" FROM safehouses")
            .FirstAsync(ct);

        var totalResidents = await db.Database
            .SqlQueryRaw<int>("SELECT COUNT(*)::int AS \"Value\" FROM residents")
            .FirstAsync(ct);

        var reintegrationProgress = await db.Database
            .SqlQueryRaw<int>(
                "SELECT COUNT(*)::int AS \"Value\" FROM residents WHERE reintegration_status IN ('Completed','In Progress')")
            .FirstAsync(ct);

        var totalContributions = await db.Database
            .SqlQueryRaw<decimal>("SELECT COALESCE(SUM(estimated_value),0) AS \"Value\" FROM donations")
            .FirstAsync(ct);

        var uniqueSupporters = await db.Database
            .SqlQueryRaw<int>("SELECT COUNT(DISTINCT supporter_id)::int AS \"Value\" FROM donations")
            .FirstAsync(ct);

        var occupancy = await db.Database
            .SqlQueryRaw<SafehouseOccupancy>(
                "SELECT name AS \"Name\", current_occupancy AS \"Occupancy\", capacity_girls AS \"Capacity\" FROM safehouses ORDER BY name")
            .ToListAsync(ct);

        var byYear = await db.Database
            .SqlQueryRaw<YearlyAdmissions>(
                "SELECT EXTRACT(YEAR FROM date_of_admission)::int AS \"Year\", COUNT(*)::int AS \"Count\" FROM residents WHERE date_of_admission IS NOT NULL GROUP BY \"Year\" ORDER BY \"Year\"")
            .ToListAsync(ct);

        var reintegrationBreakdown = await db.Database
            .SqlQueryRaw<ReintegrationBreakdown>(
                "SELECT reintegration_status AS \"Status\", COUNT(*)::int AS \"Count\" FROM residents GROUP BY reintegration_status ORDER BY \"Count\" DESC")
            .ToListAsync(ct);

        var donationBreakdown = await db.Database
            .SqlQueryRaw<DonationBreakdown>(
                "SELECT donation_type AS \"Type\", COALESCE(SUM(estimated_value),0) AS \"TotalValue\" FROM donations GROUP BY donation_type ORDER BY \"TotalValue\" DESC")
            .ToListAsync(ct);

        var donationsByYear = await db.Database
            .SqlQueryRaw<YearlyDonations>(
                "SELECT EXTRACT(YEAR FROM donation_date)::int AS \"Year\", COALESCE(SUM(estimated_value),0) AS \"TotalValue\" FROM donations WHERE donation_date IS NOT NULL GROUP BY \"Year\" ORDER BY \"Year\"")
            .ToListAsync(ct);

        var totalVolunteerHours = await db.Database
            .SqlQueryRaw<decimal>(
                "SELECT COALESCE(SUM(estimated_value),0) AS \"Value\" FROM donations WHERE donation_type IN ('Time','Skills') AND impact_unit = 'hours'")
            .FirstAsync(ct);

        var avgDonationPerIndividual = await db.Database
            .SqlQueryRaw<decimal>(
                "SELECT COALESCE(AVG(total),0) AS \"Value\" FROM (SELECT SUM(d.estimated_value) AS total FROM donations d JOIN supporters s ON d.supporter_id = s.supporter_id WHERE s.supporter_type <> 'PartnerOrganization' GROUP BY d.supporter_id) sub")
            .FirstAsync(ct);

        var avgDonationPerOrganization = await db.Database
            .SqlQueryRaw<decimal>(
                "SELECT COALESCE(AVG(total),0) AS \"Value\" FROM (SELECT SUM(d.estimated_value) AS total FROM donations d JOIN supporters s ON d.supporter_id = s.supporter_id WHERE s.supporter_type = 'PartnerOrganization' GROUP BY d.supporter_id) sub")
            .FirstAsync(ct);

        return new ImpactStatsDto(
            activeResidents,
            totalResidents,
            reintegrationProgress,
            totalContributions,
            uniqueSupporters,
            occupancy,
            byYear,
            reintegrationBreakdown,
            donationBreakdown,
            donationsByYear,
            totalVolunteerHours,
            avgDonationPerIndividual,
            avgDonationPerOrganization
        );
    }
}
