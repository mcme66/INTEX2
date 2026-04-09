using System.ComponentModel.DataAnnotations;
using IntexApi.Data;
using IntexApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record ResidentListItem(
    int ResidentId,
    string? CaseControlNo,
    string? InternalCode,
    int? SafehouseId,
    string? CaseStatus,
    string? Sex,
    DateOnly? DateOfBirth,
    string? CaseCategory,
    bool SubCatOrphaned,
    bool SubCatTrafficked,
    bool SubCatChildLabor,
    bool SubCatPhysicalAbuse,
    bool SubCatSexualAbuse,
    bool SubCatOsaec,
    bool SubCatCicl,
    bool SubCatAtRisk,
    bool SubCatStreetChild,
    bool SubCatChildWithHiv,
    bool IsPwd,
    string? PwdType,
    bool HasSpecialNeeds,
    string? SpecialNeedsDiagnosis,
    bool FamilyIs4Ps,
    bool FamilySoloParent,
    bool FamilyIndigenous,
    bool FamilyParentPwd,
    bool FamilyInformalSettler,
    DateOnly? DateOfAdmission,
    string? AgeUponAdmission,
    string? PresentAge,
    string? LengthOfStay,
    string? ReferralSource,
    string? ReferringAgencyPerson,
    string? AssignedSocialWorker,
    string? InitialCaseAssessment,
    string? ReintegrationType,
    string? ReintegrationStatus,
    string? InitialRiskLevel,
    string? CurrentRiskLevel,
    DateOnly? DateEnrolled,
    DateOnly? DateClosed
);

public sealed record ResidentUpsertRequest(
    [param: StringLength(50)] string? CaseControlNo,
    [param: StringLength(50)] string? InternalCode,
    int? SafehouseId,
    [param: StringLength(30)] string? CaseStatus,
    [param: StringLength(10)] string? Sex,
    DateOnly? DateOfBirth,
    [param: StringLength(30)] string? BirthStatus,
    [param: StringLength(200)] string? PlaceOfBirth,
    [param: StringLength(50)] string? Religion,
    [param: StringLength(50)] string? CaseCategory,
    bool SubCatOrphaned,
    bool SubCatTrafficked,
    bool SubCatChildLabor,
    bool SubCatPhysicalAbuse,
    bool SubCatSexualAbuse,
    bool SubCatOsaec,
    bool SubCatCicl,
    bool SubCatAtRisk,
    bool SubCatStreetChild,
    bool SubCatChildWithHiv,
    bool IsPwd,
    [param: StringLength(100)] string? PwdType,
    bool HasSpecialNeeds,
    [param: StringLength(500)] string? SpecialNeedsDiagnosis,
    bool FamilyIs4Ps,
    bool FamilySoloParent,
    bool FamilyIndigenous,
    bool FamilyParentPwd,
    bool FamilyInformalSettler,
    DateOnly? DateOfAdmission,
    [param: StringLength(20)] string? AgeUponAdmission,
    [param: StringLength(20)] string? PresentAge,
    [param: StringLength(30)] string? LengthOfStay,
    [param: StringLength(100)] string? ReferralSource,
    [param: StringLength(200)] string? ReferringAgencyPerson,
    DateOnly? DateColbRegistered,
    DateOnly? DateColbObtained,
    [param: StringLength(100)] string? AssignedSocialWorker,
    [param: StringLength(2000)] string? InitialCaseAssessment,
    DateOnly? DateCaseStudyPrepared,
    [param: StringLength(50)] string? ReintegrationType,
    [param: StringLength(30)] string? ReintegrationStatus,
    [param: StringLength(20)] string? InitialRiskLevel,
    [param: StringLength(20)] string? CurrentRiskLevel,
    DateOnly? DateEnrolled,
    DateOnly? DateClosed,
    [param: StringLength(2000)] string? NotesRestricted
);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class ResidentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] string? status,
        [FromQuery] int? safehouseId,
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] string? reintegrationStatus,
        [FromQuery] string? socialWorker,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var query = db.Residents.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.CaseStatus == status);

        if (safehouseId.HasValue)
            query = query.Where(r => r.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(r => r.CaseCategory == category);

        if (!string.IsNullOrWhiteSpace(reintegrationStatus))
            query = query.Where(r => r.ReintegrationStatus == reintegrationStatus);

        if (!string.IsNullOrWhiteSpace(socialWorker))
            query = query.Where(r => r.AssignedSocialWorker == socialWorker);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r =>
                (r.CaseControlNo != null && r.CaseControlNo.ToLower().Contains(s)) ||
                (r.InternalCode != null && r.InternalCode.ToLower().Contains(s)) ||
                (r.ReferringAgencyPerson != null && r.ReferringAgencyPerson.ToLower().Contains(s)) ||
                (r.AssignedSocialWorker != null && r.AssignedSocialWorker.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.DateOfAdmission)
            .ThenBy(r => r.ResidentId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ResidentListItem(
                r.ResidentId, r.CaseControlNo, r.InternalCode, r.SafehouseId,
                r.CaseStatus, r.Sex, r.DateOfBirth, r.CaseCategory,
                r.SubCatOrphaned, r.SubCatTrafficked, r.SubCatChildLabor,
                r.SubCatPhysicalAbuse, r.SubCatSexualAbuse, r.SubCatOsaec,
                r.SubCatCicl, r.SubCatAtRisk, r.SubCatStreetChild, r.SubCatChildWithHiv,
                r.IsPwd, r.PwdType, r.HasSpecialNeeds, r.SpecialNeedsDiagnosis,
                r.FamilyIs4Ps, r.FamilySoloParent, r.FamilyIndigenous,
                r.FamilyParentPwd, r.FamilyInformalSettler,
                r.DateOfAdmission, r.AgeUponAdmission, r.PresentAge, r.LengthOfStay,
                r.ReferralSource, r.ReferringAgencyPerson, r.AssignedSocialWorker,
                r.InitialCaseAssessment, r.ReintegrationType, r.ReintegrationStatus,
                r.InitialRiskLevel, r.CurrentRiskLevel, r.DateEnrolled, r.DateClosed
            ))
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Resident>> GetById(int id, CancellationToken ct)
    {
        var resident = await db.Residents.AsNoTracking().FirstOrDefaultAsync(r => r.ResidentId == id, ct);
        if (resident is null) return NotFound();
        return Ok(resident);
    }

    [HttpPost]
    public async Task<ActionResult<Resident>> Create(ResidentUpsertRequest req, CancellationToken ct)
    {
        var resident = MapFromRequest(new Resident(), req);
        resident.CreatedAt = DateTime.UtcNow;

        resident.ResidentId = await db.Residents.AnyAsync(ct)
            ? await db.Residents.MaxAsync(r => r.ResidentId, ct) + 1
            : 1;

        db.Residents.Add(resident);
        await db.SaveChangesAsync(ct);

        if (string.IsNullOrWhiteSpace(resident.CaseControlNo))
        {
            resident.CaseControlNo = $"C{resident.ResidentId:D4}";
        }

        if (string.IsNullOrWhiteSpace(resident.InternalCode))
        {
            resident.InternalCode = $"LS-{resident.ResidentId:D4}";
        }

        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = resident.ResidentId }, resident);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Resident>> Update(int id, ResidentUpsertRequest req, CancellationToken ct)
    {
        var resident = await db.Residents.FirstOrDefaultAsync(r => r.ResidentId == id, ct);
        if (resident is null) return NotFound();
        MapFromRequest(resident, req);
        await db.SaveChangesAsync(ct);
        return Ok(resident);
    }

    [HttpGet("filters")]
    public async Task<ActionResult<object>> GetFilterOptions(CancellationToken ct)
    {
        var statuses = await db.Residents.AsNoTracking()
            .Where(r => r.CaseStatus != null)
            .Select(r => r.CaseStatus!)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        var categories = await db.Residents.AsNoTracking()
            .Where(r => r.CaseCategory != null)
            .Select(r => r.CaseCategory!)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        var safehouseIds = await db.Residents.AsNoTracking()
            .Where(r => r.SafehouseId != null)
            .Select(r => r.SafehouseId!.Value)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        var reintegrationStatuses = await db.Residents.AsNoTracking()
            .Where(r => r.ReintegrationStatus != null)
            .Select(r => r.ReintegrationStatus!)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        var socialWorkers = await db.Residents.AsNoTracking()
            .Where(r => r.AssignedSocialWorker != null)
            .Select(r => r.AssignedSocialWorker!)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        return Ok(new { statuses, categories, safehouseIds, reintegrationStatuses, socialWorkers });
    }

    private static Resident MapFromRequest(Resident r, ResidentUpsertRequest req)
    {
        r.CaseControlNo = req.CaseControlNo;
        r.InternalCode = req.InternalCode;
        r.SafehouseId = req.SafehouseId;
        r.CaseStatus = req.CaseStatus;
        r.Sex = req.Sex;
        r.DateOfBirth = req.DateOfBirth;
        r.BirthStatus = req.BirthStatus;
        r.PlaceOfBirth = req.PlaceOfBirth;
        r.Religion = req.Religion;
        r.CaseCategory = req.CaseCategory;
        r.SubCatOrphaned = req.SubCatOrphaned;
        r.SubCatTrafficked = req.SubCatTrafficked;
        r.SubCatChildLabor = req.SubCatChildLabor;
        r.SubCatPhysicalAbuse = req.SubCatPhysicalAbuse;
        r.SubCatSexualAbuse = req.SubCatSexualAbuse;
        r.SubCatOsaec = req.SubCatOsaec;
        r.SubCatCicl = req.SubCatCicl;
        r.SubCatAtRisk = req.SubCatAtRisk;
        r.SubCatStreetChild = req.SubCatStreetChild;
        r.SubCatChildWithHiv = req.SubCatChildWithHiv;
        r.IsPwd = req.IsPwd;
        r.PwdType = req.PwdType;
        r.HasSpecialNeeds = req.HasSpecialNeeds;
        r.SpecialNeedsDiagnosis = req.SpecialNeedsDiagnosis;
        r.FamilyIs4Ps = req.FamilyIs4Ps;
        r.FamilySoloParent = req.FamilySoloParent;
        r.FamilyIndigenous = req.FamilyIndigenous;
        r.FamilyParentPwd = req.FamilyParentPwd;
        r.FamilyInformalSettler = req.FamilyInformalSettler;
        r.DateOfAdmission = req.DateOfAdmission;
        r.AgeUponAdmission = req.AgeUponAdmission;
        r.PresentAge = req.PresentAge;
        r.LengthOfStay = req.LengthOfStay;
        r.ReferralSource = req.ReferralSource;
        r.ReferringAgencyPerson = req.ReferringAgencyPerson;
        r.DateColbRegistered = req.DateColbRegistered;
        r.DateColbObtained = req.DateColbObtained;
        r.AssignedSocialWorker = req.AssignedSocialWorker;
        r.InitialCaseAssessment = req.InitialCaseAssessment;
        r.DateCaseStudyPrepared = req.DateCaseStudyPrepared;
        r.ReintegrationType = req.ReintegrationType;
        r.ReintegrationStatus = req.ReintegrationStatus;
        r.InitialRiskLevel = req.InitialRiskLevel;
        r.CurrentRiskLevel = req.CurrentRiskLevel;
        r.DateEnrolled = req.DateEnrolled;
        r.DateClosed = req.DateClosed;
        r.NotesRestricted = req.NotesRestricted;
        return r;
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var resident = await db.Residents.FindAsync([id], ct);
        if (resident is null) return NotFound();
        db.Residents.Remove(resident);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
