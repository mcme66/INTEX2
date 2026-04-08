using System.ComponentModel.DataAnnotations;
using IntexApi.Data;
using IntexApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record InterventionPlanDto(
    int PlanId,
    int ResidentId,
    string? ResidentCode,
    string? PlanCategory,
    string? PlanDescription,
    string? ServicesProvided,
    decimal? TargetValue,
    DateOnly? TargetDate,
    string? Status,
    DateOnly? CaseConferenceDate,
    DateTime? CreatedAt,
    DateTime? UpdatedAt
);

public sealed record InterventionPlanUpsertRequest(
    [param: Required] int ResidentId,
    [param: StringLength(50)] string? PlanCategory,
    [param: StringLength(2000)] string? PlanDescription,
    [param: StringLength(500)] string? ServicesProvided,
    [param: Range(0, 1_000_000)] decimal? TargetValue,
    DateOnly? TargetDate,
    [param: StringLength(30)] string? Status,
    DateOnly? CaseConferenceDate
);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class InterventionPlansController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] int? residentId,
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] bool? upcoming,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var query = db.InterventionPlans.AsNoTracking()
            .Join(db.Residents.AsNoTracking(),
                p => p.ResidentId,
                r => r.ResidentId,
                (p, r) => new { p, r.CaseControlNo, r.InternalCode });

        if (residentId.HasValue)
            query = query.Where(x => x.p.ResidentId == residentId.Value);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.p.Status == status);
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(x => x.p.PlanCategory == category);
        if (upcoming == true)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            query = query.Where(x => x.p.CaseConferenceDate != null && x.p.CaseConferenceDate >= today);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                (x.p.PlanDescription != null && x.p.PlanDescription.ToLower().Contains(s)) ||
                (x.p.ServicesProvided != null && x.p.ServicesProvided.ToLower().Contains(s)) ||
                (x.p.PlanCategory != null && x.p.PlanCategory.ToLower().Contains(s)) ||
                (x.CaseControlNo != null && x.CaseControlNo.ToLower().Contains(s)) ||
                (x.InternalCode != null && x.InternalCode.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.p.CaseConferenceDate)
            .ThenByDescending(x => x.p.PlanId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new InterventionPlanDto(
                x.p.PlanId,
                x.p.ResidentId,
                x.CaseControlNo ?? x.InternalCode,
                x.p.PlanCategory,
                x.p.PlanDescription,
                x.p.ServicesProvided,
                x.p.TargetValue,
                x.p.TargetDate,
                x.p.Status,
                x.p.CaseConferenceDate,
                x.p.CreatedAt,
                x.p.UpdatedAt
            ))
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("filters")]
    public async Task<ActionResult<object>> GetFilterOptions(CancellationToken ct)
    {
        var statuses = await db.InterventionPlans.AsNoTracking()
            .Where(p => p.Status != null)
            .Select(p => p.Status!).Distinct().OrderBy(x => x).ToListAsync(ct);

        var categories = await db.InterventionPlans.AsNoTracking()
            .Where(p => p.PlanCategory != null)
            .Select(p => p.PlanCategory!).Distinct().OrderBy(x => x).ToListAsync(ct);

        var residents = await db.Residents.AsNoTracking()
            .OrderBy(r => r.CaseControlNo)
            .Select(r => new { r.ResidentId, Label = r.CaseControlNo ?? r.InternalCode ?? r.ResidentId.ToString() })
            .ToListAsync(ct);

        return Ok(new { statuses, categories, residents });
    }

    [HttpPost]
    public async Task<ActionResult<InterventionPlan>> Create(InterventionPlanUpsertRequest req, CancellationToken ct)
    {
        var plan = Map(new InterventionPlan(), req);
        plan.CreatedAt = DateTime.UtcNow;
        plan.UpdatedAt = DateTime.UtcNow;
        db.InterventionPlans.Add(plan);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = plan.PlanId }, plan);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<InterventionPlan>> Update(int id, InterventionPlanUpsertRequest req, CancellationToken ct)
    {
        var plan = await db.InterventionPlans.FirstOrDefaultAsync(p => p.PlanId == id, ct);
        if (plan is null) return NotFound();
        Map(plan, req);
        plan.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(plan);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var plan = await db.InterventionPlans.FindAsync([id], ct);
        if (plan is null) return NotFound();
        db.InterventionPlans.Remove(plan);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static InterventionPlan Map(InterventionPlan p, InterventionPlanUpsertRequest req)
    {
        p.ResidentId = req.ResidentId;
        p.PlanCategory = req.PlanCategory;
        p.PlanDescription = req.PlanDescription;
        p.ServicesProvided = req.ServicesProvided;
        p.TargetValue = req.TargetValue;
        p.TargetDate = req.TargetDate;
        p.Status = req.Status;
        p.CaseConferenceDate = req.CaseConferenceDate;
        return p;
    }
}
