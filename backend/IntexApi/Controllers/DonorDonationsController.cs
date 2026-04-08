using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using IntexApi.Contracts;
using IntexApi.Data;
using IntexApi.Models;
using IntexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

[ApiController]
[Authorize]
[Route("api/donor/donations")]
public sealed class DonorDonationsController(
    AppDbContext db,
    DonorSupporterLinker supporterLinker) : ControllerBase
{
    private const int DefaultSafehouseId = 1;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DonationDto>>> List(CancellationToken ct)
    {
        var (user, authError) = await RequireDonorAsync(ct);
        if (authError is not null) return authError;

        var supporter = await supporterLinker.GetLinkedOrLinkByEmailAsync(user!, ct);
        if (supporter is null) return Ok(Array.Empty<DonationDto>());

        var rows = await db.Donations
            .AsNoTracking()
            .Where(d => d.SupporterId == supporter.SupporterId)
            .OrderByDescending(d => d.DonationDate)
            .ThenByDescending(d => d.DonationId)
            .Select(d => new DonationDto(
                d.DonationId,
                d.DonationDate,
                d.DonationType,
                d.Amount ?? d.EstimatedValue,
                d.EstimatedValue,
                d.ImpactUnit,
                d.CurrencyCode,
                d.Notes,
                d.ChannelSource))
            .ToListAsync(ct);

        return Ok(rows);
    }

    private static readonly HashSet<string> ValidTypes = new(StringComparer.OrdinalIgnoreCase)
        { "Monetary", "Time", "InKind", "Skills", "SocialMedia" };

    [HttpPost]
    public async Task<ActionResult<DonationDto>> Create([FromBody] CreateDonationRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var donationType = req.DonationType?.Trim() ?? "Monetary";
        if (!ValidTypes.TryGetValue(donationType, out var canonicalType))
            return BadRequest(new { message = $"Invalid donation type: {donationType}" });

        var isMonetary = canonicalType == "Monetary";

        if (isMonetary && (req.Amount is null or <= 0))
            return BadRequest(new { message = "Amount is required for monetary donations." });

        if (!isMonetary && (req.EstimatedValue is null or <= 0))
            return BadRequest(new { message = "A value (hours, items, or campaigns) is required." });

        var (user, authError) = await RequireDonorAsync(ct);
        if (authError is not null) return authError;

        var supporter = await supporterLinker.EnsureSupporterForDonorAsync(user!, ct);

        var now = DateTime.UtcNow;

        decimal? amount = isMonetary ? decimal.Round(req.Amount!.Value, 2, MidpointRounding.AwayFromZero) : null;
        var estimatedValue = isMonetary ? amount!.Value : decimal.Round(req.EstimatedValue!.Value, 2, MidpointRounding.AwayFromZero);
        var currency = isMonetary
            ? (string.IsNullOrWhiteSpace(req.CurrencyCode) ? "USD" : req.CurrencyCode.Trim().ToUpperInvariant())
            : null;

        var impactUnit = canonicalType switch
        {
            "Monetary" => currency!.Equals("COP", StringComparison.OrdinalIgnoreCase) ? "pesos" : "dollars",
            "Time" or "Skills" => "hours",
            "InKind" => "items",
            "SocialMedia" => "campaigns",
            _ => null,
        };

        var nextDonationId = await db.Donations.AnyAsync(ct)
            ? await db.Donations.MaxAsync(d => d.DonationId, ct) + 1
            : 1;

        var donation = new Donation
        {
            DonationId = nextDonationId,
            SupporterId = supporter.SupporterId,
            DonationType = canonicalType,
            DonationDate = now,
            IsRecurring = false,
            CampaignName = null,
            ChannelSource = "Simulated",
            CurrencyCode = currency,
            Amount = amount,
            EstimatedValue = estimatedValue,
            ImpactUnit = impactUnit,
            Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
            ReferralPostId = null,
        };

        db.Donations.Add(donation);

        if (isMonetary)
        {
            var nextAllocId = await db.DonationAllocations.AnyAsync(ct)
                ? await db.DonationAllocations.MaxAsync(a => a.AllocationId, ct) + 1
                : 1;

            db.DonationAllocations.Add(new DonationAllocation
            {
                AllocationId = nextAllocId,
                DonationId = nextDonationId,
                SafehouseId = DefaultSafehouseId,
                ProgramArea = "Operations",
                AmountAllocated = amount!.Value,
                AllocationDate = now,
                AllocationNotes = "Simulated online gift (no payment processor)",
            });
        }

        if (supporter.FirstDonationDate is null)
        {
            supporter.FirstDonationDate = DateOnly.FromDateTime(now);
            db.Supporters.Update(supporter);
        }

        await db.SaveChangesAsync(ct);

        var dto = new DonationDto(
            donation.DonationId,
            donation.DonationDate,
            donation.DonationType,
            donation.Amount ?? donation.EstimatedValue,
            donation.EstimatedValue,
            donation.ImpactUnit,
            donation.CurrencyCode,
            donation.Notes,
            donation.ChannelSource);

        return CreatedAtAction(nameof(List), dto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DonationDto>> Update(int id, [FromBody] UpdateDonationRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var donationType = req.DonationType?.Trim() ?? "Monetary";
        if (!ValidTypes.TryGetValue(donationType, out var canonicalType))
            return BadRequest(new { message = $"Invalid donation type: {donationType}" });

        var isMonetary = canonicalType == "Monetary";

        if (isMonetary && (req.Amount is null or <= 0))
            return BadRequest(new { message = "Amount is required for monetary donations." });

        if (!isMonetary && canonicalType != "Skills" && (req.EstimatedValue is null or <= 0))
            return BadRequest(new { message = "A value (hours, items, or campaigns) is required." });

        var (user, authError) = await RequireDonorAsync(ct);
        if (authError is not null) return authError;

        var supporter = await supporterLinker.EnsureSupporterForDonorAsync(user!, ct);

        var donation = await db.Donations.FirstOrDefaultAsync(
            d => d.DonationId == id && d.SupporterId == supporter.SupporterId, ct);
        if (donation is null) return NotFound(new { message = "Donation not found." });

        decimal? amount = isMonetary ? decimal.Round(req.Amount!.Value, 2, MidpointRounding.AwayFromZero) : null;
        var estimatedValue = isMonetary ? amount!.Value
            : canonicalType == "Skills" ? (req.EstimatedValue ?? 1m)
            : decimal.Round(req.EstimatedValue!.Value, 2, MidpointRounding.AwayFromZero);
        var currency = isMonetary
            ? (string.IsNullOrWhiteSpace(req.CurrencyCode) ? "USD" : req.CurrencyCode.Trim().ToUpperInvariant())
            : null;

        donation.DonationType = canonicalType;
        donation.Amount = amount;
        donation.EstimatedValue = estimatedValue;
        donation.CurrencyCode = currency;
        donation.ImpactUnit = canonicalType switch
        {
            "Monetary" => currency!.Equals("COP", StringComparison.OrdinalIgnoreCase) ? "pesos" : "dollars",
            "Time" or "Skills" => "hours",
            "InKind" => "items",
            "SocialMedia" => "campaigns",
            _ => null,
        };
        donation.Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim();

        if (isMonetary)
        {
            var alloc = await db.DonationAllocations
                .FirstOrDefaultAsync(a => a.DonationId == id, ct);
            if (alloc is not null)
            {
                alloc.AmountAllocated = amount!.Value;
            }
        }

        await db.SaveChangesAsync(ct);

        return Ok(new DonationDto(
            donation.DonationId,
            donation.DonationDate,
            donation.DonationType,
            donation.Amount ?? donation.EstimatedValue,
            donation.EstimatedValue,
            donation.ImpactUnit,
            donation.CurrencyCode,
            donation.Notes,
            donation.ChannelSource));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var (user, authError) = await RequireDonorAsync(ct);
        if (authError is not null) return authError;

        var supporter = await supporterLinker.EnsureSupporterForDonorAsync(user!, ct);

        var donation = await db.Donations.FirstOrDefaultAsync(
            d => d.DonationId == id && d.SupporterId == supporter.SupporterId, ct);
        if (donation is null) return NotFound(new { message = "Donation not found." });

        var allocations = await db.DonationAllocations
            .Where(a => a.DonationId == id)
            .ToListAsync(ct);
        db.DonationAllocations.RemoveRange(allocations);
        db.Donations.Remove(donation);
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    private async Task<(User? user, ActionResult? error)> RequireDonorAsync(CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(sub, out var userId)) return (null, Unauthorized());

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return (null, Unauthorized());
        if (!user.IsDonor) return (null, Forbid());

        return (user, null);
    }
}
