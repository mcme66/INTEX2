using System.ComponentModel.DataAnnotations;
using IntexApi.Data;
using IntexApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record HomeVisitationDto(
    int VisitationId,
    int ResidentId,
    string? ResidentCode,
    DateOnly? VisitDate,
    string? SocialWorker,
    string? VisitType,
    string? LocationVisited,
    string? FamilyMembersPresent,
    string? Purpose,
    string? Observations,
    string? FamilyCooperationLevel,
    bool SafetyConcernsNoted,
    bool FollowUpNeeded,
    string? FollowUpNotes,
    string? VisitOutcome
);

public sealed record HomeVisitationUpsertRequest(
    [param: Required] int ResidentId,
    DateOnly? VisitDate,
    [param: StringLength(100)] string? SocialWorker,
    [param: StringLength(50)] string? VisitType,
    [param: StringLength(200)] string? LocationVisited,
    [param: StringLength(500)] string? FamilyMembersPresent,
    [param: StringLength(500)] string? Purpose,
    [param: StringLength(2000)] string? Observations,
    [param: StringLength(30)] string? FamilyCooperationLevel,
    bool SafetyConcernsNoted,
    bool FollowUpNeeded,
    [param: StringLength(2000)] string? FollowUpNotes,
    [param: StringLength(200)] string? VisitOutcome
);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class HomeVisitationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] int? residentId,
        [FromQuery] string? visitType,
        [FromQuery] string? socialWorker,
        [FromQuery] bool? safetyConcerns,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var query = db.HomeVisitations.AsNoTracking()
            .Join(db.Residents.AsNoTracking(),
                v => v.ResidentId,
                r => r.ResidentId,
                (v, r) => new { v, r.CaseControlNo, r.InternalCode });

        if (residentId.HasValue)
            query = query.Where(x => x.v.ResidentId == residentId.Value);
        if (!string.IsNullOrWhiteSpace(visitType))
            query = query.Where(x => x.v.VisitType == visitType);
        if (!string.IsNullOrWhiteSpace(socialWorker))
            query = query.Where(x => x.v.SocialWorker == socialWorker);
        if (safetyConcerns.HasValue)
            query = query.Where(x => x.v.SafetyConcernsNoted == safetyConcerns.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                (x.v.SocialWorker != null && x.v.SocialWorker.ToLower().Contains(s)) ||
                (x.v.LocationVisited != null && x.v.LocationVisited.ToLower().Contains(s)) ||
                (x.v.Observations != null && x.v.Observations.ToLower().Contains(s)) ||
                (x.CaseControlNo != null && x.CaseControlNo.ToLower().Contains(s)) ||
                (x.InternalCode != null && x.InternalCode.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.v.VisitDate)
            .ThenByDescending(x => x.v.VisitationId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new HomeVisitationDto(
                x.v.VisitationId,
                x.v.ResidentId,
                x.CaseControlNo ?? x.InternalCode,
                x.v.VisitDate,
                x.v.SocialWorker,
                x.v.VisitType,
                x.v.LocationVisited,
                x.v.FamilyMembersPresent,
                x.v.Purpose,
                x.v.Observations,
                x.v.FamilyCooperationLevel,
                x.v.SafetyConcernsNoted,
                x.v.FollowUpNeeded,
                x.v.FollowUpNotes,
                x.v.VisitOutcome
            ))
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<HomeVisitationDto>> GetById(int id, CancellationToken ct)
    {
        var item = await db.HomeVisitations.AsNoTracking()
            .Where(v => v.VisitationId == id)
            .Join(db.Residents.AsNoTracking(),
                v => v.ResidentId,
                r => r.ResidentId,
                (v, r) => new HomeVisitationDto(
                    v.VisitationId, v.ResidentId, r.CaseControlNo ?? r.InternalCode,
                    v.VisitDate, v.SocialWorker, v.VisitType, v.LocationVisited,
                    v.FamilyMembersPresent, v.Purpose, v.Observations,
                    v.FamilyCooperationLevel, v.SafetyConcernsNoted,
                    v.FollowUpNeeded, v.FollowUpNotes, v.VisitOutcome))
            .FirstOrDefaultAsync(ct);

        if (item is null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<HomeVisitation>> Create(HomeVisitationUpsertRequest req, CancellationToken ct)
    {
        var visit = Map(new HomeVisitation(), req);
        db.HomeVisitations.Add(visit);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = visit.VisitationId }, visit);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<HomeVisitation>> Update(int id, HomeVisitationUpsertRequest req, CancellationToken ct)
    {
        var visit = await db.HomeVisitations.FirstOrDefaultAsync(v => v.VisitationId == id, ct);
        if (visit is null) return NotFound();
        Map(visit, req);
        await db.SaveChangesAsync(ct);
        return Ok(visit);
    }

    [HttpGet("filters")]
    public async Task<ActionResult<object>> GetFilterOptions(CancellationToken ct)
    {
        var visitTypes = await db.HomeVisitations.AsNoTracking()
            .Where(v => v.VisitType != null)
            .Select(v => v.VisitType!).Distinct().OrderBy(x => x).ToListAsync(ct);

        var socialWorkers = await db.HomeVisitations.AsNoTracking()
            .Where(v => v.SocialWorker != null)
            .Select(v => v.SocialWorker!).Distinct().OrderBy(x => x).ToListAsync(ct);

        var outcomes = await db.HomeVisitations.AsNoTracking()
            .Where(v => v.VisitOutcome != null)
            .Select(v => v.VisitOutcome!).Distinct().OrderBy(x => x).ToListAsync(ct);

        var cooperationLevels = await db.HomeVisitations.AsNoTracking()
            .Where(v => v.FamilyCooperationLevel != null)
            .Select(v => v.FamilyCooperationLevel!).Distinct().OrderBy(x => x).ToListAsync(ct);

        var residents = await db.Residents.AsNoTracking()
            .OrderBy(r => r.CaseControlNo)
            .Select(r => new { r.ResidentId, Label = r.CaseControlNo ?? r.InternalCode ?? r.ResidentId.ToString() })
            .ToListAsync(ct);

        return Ok(new { visitTypes, socialWorkers, outcomes, cooperationLevels, residents });
    }

    private static HomeVisitation Map(HomeVisitation v, HomeVisitationUpsertRequest req)
    {
        v.ResidentId = req.ResidentId;
        v.VisitDate = req.VisitDate;
        v.SocialWorker = req.SocialWorker;
        v.VisitType = req.VisitType;
        v.LocationVisited = req.LocationVisited;
        v.FamilyMembersPresent = req.FamilyMembersPresent;
        v.Purpose = req.Purpose;
        v.Observations = req.Observations;
        v.FamilyCooperationLevel = req.FamilyCooperationLevel;
        v.SafetyConcernsNoted = req.SafetyConcernsNoted;
        v.FollowUpNeeded = req.FollowUpNeeded;
        v.FollowUpNotes = req.FollowUpNotes;
        v.VisitOutcome = req.VisitOutcome;
        return v;
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var visit = await db.HomeVisitations.FindAsync([id], ct);
        if (visit is null) return NotFound();
        db.HomeVisitations.Remove(visit);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
