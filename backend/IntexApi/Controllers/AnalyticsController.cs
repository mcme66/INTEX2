using IntexApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record MonthlyDonation(string Month, string DonationType, decimal TotalValue);
public sealed record SafehousePerformance(
    int SafehouseId, string Name, int Capacity, int Occupancy,
    int ActiveResidents, int ClosedCases, int ReintegratedCount,
    int IncidentCount, decimal ReintegrationRate);
public sealed record MonthlyResident(string Month, int Admissions, int Closures);

public sealed record MonthlyService(string Month, int Caring, int Healing, int Teaching);
public sealed record ServiceTotals(int TotalCaring, int TotalHealing, int TotalTeaching);
public sealed record ServicesProvidedResponse(ServiceTotals Totals, List<MonthlyService> Monthly);

public sealed record BeneficiarySummary(
    int TotalServed, int CurrentlyActive, int ClosedCases, int Reintegrated,
    List<SafehouseBeneficiaryCount> BySafehouse, List<CategoryCount> ByCategory);
public sealed record SafehouseBeneficiaryCount(string Name, int Count);
public sealed record CategoryCount(string Category, int Count);

public sealed record MonthlyEducation(string Month, decimal AvgAttendance, decimal AvgProgress);
public sealed record EnrollmentCount(string Status, int Count);
public sealed record EducationOutcomesResponse(
    List<MonthlyEducation> Monthly, List<EnrollmentCount> Enrollment,
    decimal OverallAvgAttendance, decimal OverallAvgProgress);

public sealed record MonthlyHealth(string Month, decimal AvgHealth, decimal AvgNutrition, decimal AvgSleep);
public sealed record HealthOutcomesResponse(
    List<MonthlyHealth> Monthly,
    decimal OverallAvgHealth, decimal OverallAvgNutrition, decimal OverallAvgSleep,
    decimal MedicalCheckupPct, decimal DentalCheckupPct, decimal PsychCheckupPct);

internal sealed record CheckupPcts(decimal Medical, decimal Dental, decimal Psych);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class AnalyticsController(AppDbContext db) : ControllerBase
{
    [HttpGet("monthly-donations")]
    public async Task<ActionResult<List<MonthlyDonation>>> GetMonthlyDonations(CancellationToken ct)
    {
        var rows = await db.Database
            .SqlQueryRaw<MonthlyDonation>("""
                SELECT TO_CHAR(donation_date, 'YYYY-MM') AS "Month",
                       donation_type AS "DonationType",
                       COALESCE(SUM(estimated_value), 0) AS "TotalValue"
                FROM donations
                WHERE donation_date IS NOT NULL
                GROUP BY "Month", "DonationType"
                ORDER BY "Month"
                """)
            .ToListAsync(ct);
        return Ok(rows);
    }

    [HttpGet("safehouse-performance")]
    public async Task<ActionResult<List<SafehousePerformance>>> GetSafehousePerformance(CancellationToken ct)
    {
        var rows = await db.Database
            .SqlQueryRaw<SafehousePerformance>("""
                SELECT s.safehouse_id AS "SafehouseId",
                       s.name AS "Name",
                       s.capacity_girls AS "Capacity",
                       s.current_occupancy AS "Occupancy",
                       COALESCE(SUM(CASE WHEN r.case_status = 'Active' THEN 1 ELSE 0 END), 0)::int AS "ActiveResidents",
                       COALESCE(SUM(CASE WHEN r.case_status = 'Closed' THEN 1 ELSE 0 END), 0)::int AS "ClosedCases",
                       COALESCE(SUM(CASE WHEN r.reintegration_status = 'Completed' THEN 1 ELSE 0 END), 0)::int AS "ReintegratedCount",
                       COALESCE(inc.cnt, 0)::int AS "IncidentCount",
                       CASE WHEN COUNT(r.resident_id) > 0
                            THEN ROUND(SUM(CASE WHEN r.reintegration_status = 'Completed' THEN 1 ELSE 0 END)::decimal / COUNT(r.resident_id) * 100, 1)
                            ELSE 0 END AS "ReintegrationRate"
                FROM safehouses s
                LEFT JOIN residents r ON r.safehouse_id = s.safehouse_id
                LEFT JOIN (
                    SELECT safehouse_id, COUNT(*)::int AS cnt
                    FROM incident_reports
                    GROUP BY safehouse_id
                ) inc ON inc.safehouse_id = s.safehouse_id
                GROUP BY s.safehouse_id, s.name, s.capacity_girls, s.current_occupancy, inc.cnt
                ORDER BY s.name
                """)
            .ToListAsync(ct);
        return Ok(rows);
    }

    [HttpGet("monthly-residents")]
    public async Task<ActionResult<List<MonthlyResident>>> GetMonthlyResidents(CancellationToken ct)
    {
        var rows = await db.Database
            .SqlQueryRaw<MonthlyResident>("""
                SELECT m."Month",
                       COALESCE(adm.cnt, 0)::int AS "Admissions",
                       COALESCE(cls.cnt, 0)::int AS "Closures"
                FROM (
                    SELECT DISTINCT TO_CHAR(dt, 'YYYY-MM') AS "Month"
                    FROM (
                        SELECT date_of_admission AS dt FROM residents WHERE date_of_admission IS NOT NULL
                        UNION
                        SELECT date_closed AS dt FROM residents WHERE date_closed IS NOT NULL
                    ) sub
                ) m
                LEFT JOIN (
                    SELECT TO_CHAR(date_of_admission, 'YYYY-MM') AS mo, COUNT(*)::int AS cnt
                    FROM residents WHERE date_of_admission IS NOT NULL
                    GROUP BY mo
                ) adm ON adm.mo = m."Month"
                LEFT JOIN (
                    SELECT TO_CHAR(date_closed, 'YYYY-MM') AS mo, COUNT(*)::int AS cnt
                    FROM residents WHERE date_closed IS NOT NULL
                    GROUP BY mo
                ) cls ON cls.mo = m."Month"
                ORDER BY m."Month"
                """)
            .ToListAsync(ct);
        return Ok(rows);
    }

    // ── Services Provided (caring / healing / teaching) ──────────────────────

    [HttpGet("services-provided")]
    public async Task<ActionResult<ServicesProvidedResponse>> GetServicesProvided(CancellationToken ct)
    {
        var monthly = await db.Database
            .SqlQueryRaw<MonthlyService>("""
                WITH months AS (
                    SELECT DISTINCT m AS "Month" FROM (
                        SELECT TO_CHAR(visit_date, 'YYYY-MM') AS m FROM home_visitations WHERE visit_date IS NOT NULL
                        UNION
                        SELECT TO_CHAR(session_date, 'YYYY-MM') AS m FROM process_recordings WHERE session_date IS NOT NULL
                        UNION
                        SELECT TO_CHAR(record_date, 'YYYY-MM') AS m FROM education_records WHERE record_date IS NOT NULL
                    ) sub
                ),
                caring AS (
                    SELECT TO_CHAR(visit_date, 'YYYY-MM') AS m, COUNT(*)::int AS cnt
                    FROM home_visitations WHERE visit_date IS NOT NULL GROUP BY m
                ),
                healing AS (
                    SELECT TO_CHAR(session_date, 'YYYY-MM') AS m, COUNT(*)::int AS cnt
                    FROM process_recordings WHERE session_date IS NOT NULL GROUP BY m
                ),
                teaching AS (
                    SELECT TO_CHAR(record_date, 'YYYY-MM') AS m, COUNT(*)::int AS cnt
                    FROM education_records WHERE record_date IS NOT NULL AND enrollment_status = 'Enrolled' GROUP BY m
                )
                SELECT months."Month",
                       COALESCE(caring.cnt, 0)::int AS "Caring",
                       COALESCE(healing.cnt, 0)::int AS "Healing",
                       COALESCE(teaching.cnt, 0)::int AS "Teaching"
                FROM months
                LEFT JOIN caring ON caring.m = months."Month"
                LEFT JOIN healing ON healing.m = months."Month"
                LEFT JOIN teaching ON teaching.m = months."Month"
                ORDER BY months."Month"
                """)
            .ToListAsync(ct);

        var totals = new ServiceTotals(
            monthly.Sum(m => m.Caring),
            monthly.Sum(m => m.Healing),
            monthly.Sum(m => m.Teaching));

        return Ok(new ServicesProvidedResponse(totals, monthly));
    }

    // ── Beneficiary Summary ──────────────────────────────────────────────────

    [HttpGet("beneficiary-summary")]
    public async Task<ActionResult<BeneficiarySummary>> GetBeneficiarySummary(CancellationToken ct)
    {
        var total = await db.Database
            .SqlQueryRaw<int>("""SELECT COUNT(*)::int AS "Value" FROM residents""")
            .FirstAsync(ct);

        var active = await db.Database
            .SqlQueryRaw<int>("""SELECT COUNT(*)::int AS "Value" FROM residents WHERE case_status = 'Active'""")
            .FirstAsync(ct);

        var closed = await db.Database
            .SqlQueryRaw<int>("""SELECT COUNT(*)::int AS "Value" FROM residents WHERE case_status = 'Closed'""")
            .FirstAsync(ct);

        var reintegrated = await db.Database
            .SqlQueryRaw<int>("""SELECT COUNT(*)::int AS "Value" FROM residents WHERE reintegration_status = 'Completed'""")
            .FirstAsync(ct);

        var bySafehouse = await db.Database
            .SqlQueryRaw<SafehouseBeneficiaryCount>("""
                SELECT s.name AS "Name", COUNT(r.resident_id)::int AS "Count"
                FROM safehouses s
                LEFT JOIN residents r ON r.safehouse_id = s.safehouse_id
                GROUP BY s.name
                ORDER BY "Count" DESC
                """)
            .ToListAsync(ct);

        var byCategory = await db.Database
            .SqlQueryRaw<CategoryCount>("""
                SELECT COALESCE(case_category, 'Unknown') AS "Category", COUNT(*)::int AS "Count"
                FROM residents
                GROUP BY case_category
                ORDER BY "Count" DESC
                """)
            .ToListAsync(ct);

        return Ok(new BeneficiarySummary(total, active, closed, reintegrated, bySafehouse, byCategory));
    }

    // ── Education Outcomes ───────────────────────────────────────────────────

    [HttpGet("education-outcomes")]
    public async Task<ActionResult<EducationOutcomesResponse>> GetEducationOutcomes(CancellationToken ct)
    {
        var monthly = await db.Database
            .SqlQueryRaw<MonthlyEducation>("""
                SELECT TO_CHAR(record_date, 'YYYY-MM') AS "Month",
                       ROUND(AVG(attendance_rate) * 100, 1) AS "AvgAttendance",
                       ROUND(AVG(progress_percent), 1) AS "AvgProgress"
                FROM education_records
                WHERE record_date IS NOT NULL
                GROUP BY "Month"
                ORDER BY "Month"
                """)
            .ToListAsync(ct);

        var enrollment = await db.Database
            .SqlQueryRaw<EnrollmentCount>("""
                SELECT COALESCE(enrollment_status, 'Unknown') AS "Status", COUNT(*)::int AS "Count"
                FROM education_records
                GROUP BY enrollment_status
                ORDER BY "Count" DESC
                """)
            .ToListAsync(ct);

        var overallAttendance = monthly.Count > 0 ? Math.Round(monthly.Average(m => m.AvgAttendance), 1) : 0;
        var overallProgress = monthly.Count > 0 ? Math.Round(monthly.Average(m => m.AvgProgress), 1) : 0;

        return Ok(new EducationOutcomesResponse(monthly, enrollment,
            (decimal)overallAttendance, (decimal)overallProgress));
    }

    // ── Health Outcomes ──────────────────────────────────────────────────────

    [HttpGet("health-outcomes")]
    public async Task<ActionResult<HealthOutcomesResponse>> GetHealthOutcomes(CancellationToken ct)
    {
        var monthly = await db.Database
            .SqlQueryRaw<MonthlyHealth>("""
                SELECT TO_CHAR(record_date, 'YYYY-MM') AS "Month",
                       ROUND(AVG(general_health_score), 1) AS "AvgHealth",
                       ROUND(AVG(nutrition_score), 1) AS "AvgNutrition",
                       ROUND(AVG(sleep_quality_score), 1) AS "AvgSleep"
                FROM health_wellbeing_records
                WHERE record_date IS NOT NULL
                GROUP BY "Month"
                ORDER BY "Month"
                """)
            .ToListAsync(ct);

        var overallHealth = monthly.Count > 0 ? Math.Round(monthly.Average(m => m.AvgHealth), 1) : 0;
        var overallNutrition = monthly.Count > 0 ? Math.Round(monthly.Average(m => m.AvgNutrition), 1) : 0;
        var overallSleep = monthly.Count > 0 ? Math.Round(monthly.Average(m => m.AvgSleep), 1) : 0;

        var checkupPcts = await db.Database
            .SqlQueryRaw<CheckupPcts>("""
                SELECT
                    ROUND(AVG(CASE WHEN medical_checkup_done THEN 100.0 ELSE 0 END), 1) AS "Medical",
                    ROUND(AVG(CASE WHEN dental_checkup_done THEN 100.0 ELSE 0 END), 1) AS "Dental",
                    ROUND(AVG(CASE WHEN psychological_checkup_done THEN 100.0 ELSE 0 END), 1) AS "Psych"
                FROM health_wellbeing_records
                """)
            .FirstAsync(ct);

        return Ok(new HealthOutcomesResponse(monthly,
            (decimal)overallHealth, (decimal)overallNutrition, (decimal)overallSleep,
            checkupPcts.Medical, checkupPcts.Dental, checkupPcts.Psych));
    }
}
