using IntexApi.Data;
using IntexApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record ProcessRecordingDto(
    int RecordingId,
    int ResidentId,
    string? ResidentCode,
    DateOnly? SessionDate,
    string? SocialWorker,
    string? SessionType,
    int? SessionDurationMinutes,
    string? EmotionalStateObserved,
    string? EmotionalStateEnd,
    string? SessionNarrative,
    string? InterventionsApplied,
    string? FollowUpActions,
    bool ProgressNoted,
    bool ConcernsFlagged,
    bool ReferralMade
);

public sealed record ProcessRecordingUpsertRequest(
    int ResidentId,
    DateOnly? SessionDate,
    string? SocialWorker,
    string? SessionType,
    int? SessionDurationMinutes,
    string? EmotionalStateObserved,
    string? EmotionalStateEnd,
    string? SessionNarrative,
    string? InterventionsApplied,
    string? FollowUpActions,
    bool ProgressNoted,
    bool ConcernsFlagged,
    bool ReferralMade,
    string? NotesRestricted
);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ProcessRecordingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] int? residentId,
        [FromQuery] string? socialWorker,
        [FromQuery] string? sessionType,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var query = db.ProcessRecordings.AsNoTracking()
            .Join(db.Residents.AsNoTracking(),
                pr => pr.ResidentId,
                r => r.ResidentId,
                (pr, r) => new { pr, r.CaseControlNo, r.InternalCode });

        if (residentId.HasValue)
            query = query.Where(x => x.pr.ResidentId == residentId.Value);

        if (!string.IsNullOrWhiteSpace(socialWorker))
            query = query.Where(x => x.pr.SocialWorker == socialWorker);

        if (!string.IsNullOrWhiteSpace(sessionType))
            query = query.Where(x => x.pr.SessionType == sessionType);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                (x.pr.SocialWorker != null && x.pr.SocialWorker.ToLower().Contains(s)) ||
                (x.pr.SessionNarrative != null && x.pr.SessionNarrative.ToLower().Contains(s)) ||
                (x.CaseControlNo != null && x.CaseControlNo.ToLower().Contains(s)) ||
                (x.InternalCode != null && x.InternalCode.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.pr.SessionDate)
            .ThenByDescending(x => x.pr.RecordingId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProcessRecordingDto(
                x.pr.RecordingId,
                x.pr.ResidentId,
                x.CaseControlNo ?? x.InternalCode,
                x.pr.SessionDate,
                x.pr.SocialWorker,
                x.pr.SessionType,
                x.pr.SessionDurationMinutes,
                x.pr.EmotionalStateObserved,
                x.pr.EmotionalStateEnd,
                x.pr.SessionNarrative,
                x.pr.InterventionsApplied,
                x.pr.FollowUpActions,
                x.pr.ProgressNoted,
                x.pr.ConcernsFlagged,
                x.pr.ReferralMade
            ))
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProcessRecordingDto>> GetById(int id, CancellationToken ct)
    {
        var item = await db.ProcessRecordings.AsNoTracking()
            .Where(pr => pr.RecordingId == id)
            .Join(db.Residents.AsNoTracking(),
                pr => pr.ResidentId,
                r => r.ResidentId,
                (pr, r) => new ProcessRecordingDto(
                    pr.RecordingId, pr.ResidentId,
                    r.CaseControlNo ?? r.InternalCode,
                    pr.SessionDate, pr.SocialWorker, pr.SessionType,
                    pr.SessionDurationMinutes, pr.EmotionalStateObserved,
                    pr.EmotionalStateEnd, pr.SessionNarrative,
                    pr.InterventionsApplied, pr.FollowUpActions,
                    pr.ProgressNoted, pr.ConcernsFlagged, pr.ReferralMade))
            .FirstOrDefaultAsync(ct);

        if (item is null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ProcessRecording>> Create(ProcessRecordingUpsertRequest req, CancellationToken ct)
    {
        var recording = Map(new ProcessRecording(), req);
        db.ProcessRecordings.Add(recording);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = recording.RecordingId }, recording);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProcessRecording>> Update(int id, ProcessRecordingUpsertRequest req, CancellationToken ct)
    {
        var recording = await db.ProcessRecordings.FirstOrDefaultAsync(pr => pr.RecordingId == id, ct);
        if (recording is null) return NotFound();
        Map(recording, req);
        await db.SaveChangesAsync(ct);
        return Ok(recording);
    }

    [HttpGet("filters")]
    public async Task<ActionResult<object>> GetFilterOptions(CancellationToken ct)
    {
        var socialWorkers = await db.ProcessRecordings.AsNoTracking()
            .Where(pr => pr.SocialWorker != null)
            .Select(pr => pr.SocialWorker!)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        var sessionTypes = await db.ProcessRecordings.AsNoTracking()
            .Where(pr => pr.SessionType != null)
            .Select(pr => pr.SessionType!)
            .Distinct().OrderBy(x => x).ToListAsync(ct);

        var residents = await db.Residents.AsNoTracking()
            .OrderBy(r => r.CaseControlNo)
            .Select(r => new { r.ResidentId, Label = r.CaseControlNo ?? r.InternalCode ?? r.ResidentId.ToString() })
            .ToListAsync(ct);

        return Ok(new { socialWorkers, sessionTypes, residents });
    }

    private static ProcessRecording Map(ProcessRecording r, ProcessRecordingUpsertRequest req)
    {
        r.ResidentId = req.ResidentId;
        r.SessionDate = req.SessionDate;
        r.SocialWorker = req.SocialWorker;
        r.SessionType = req.SessionType;
        r.SessionDurationMinutes = req.SessionDurationMinutes;
        r.EmotionalStateObserved = req.EmotionalStateObserved;
        r.EmotionalStateEnd = req.EmotionalStateEnd;
        r.SessionNarrative = req.SessionNarrative;
        r.InterventionsApplied = req.InterventionsApplied;
        r.FollowUpActions = req.FollowUpActions;
        r.ProgressNoted = req.ProgressNoted;
        r.ConcernsFlagged = req.ConcernsFlagged;
        r.ReferralMade = req.ReferralMade;
        r.NotesRestricted = req.NotesRestricted;
        return r;
    }
}
