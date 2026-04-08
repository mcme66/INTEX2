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
                d.Amount,
                d.CurrencyCode,
                d.Notes,
                d.ChannelSource))
            .ToListAsync(ct);

        return Ok(rows);
    }

    [HttpPost]
    public async Task<ActionResult<DonationDto>> Create([FromBody] CreateDonationRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var (user, authError) = await RequireDonorAsync(ct);
        if (authError is not null) return authError;

        var supporter = await supporterLinker.EnsureSupporterForDonorAsync(user!, ct);

        var currency = string.IsNullOrWhiteSpace(req.CurrencyCode) ? "PHP" : req.CurrencyCode.Trim().ToUpperInvariant();
        var impactUnit = currency.Equals("PHP", StringComparison.OrdinalIgnoreCase) ? "pesos" : currency.ToLowerInvariant();
        var now = DateTime.UtcNow;
        var amount = decimal.Round(req.Amount, 2, MidpointRounding.AwayFromZero);

        var nextDonationId = await db.Donations.AnyAsync(ct)
            ? await db.Donations.MaxAsync(d => d.DonationId, ct) + 1
            : 1;

        var donation = new Donation
        {
            DonationId = nextDonationId,
            SupporterId = supporter.SupporterId,
            DonationType = "Monetary",
            DonationDate = now,
            IsRecurring = false,
            CampaignName = null,
            ChannelSource = "Simulated",
            CurrencyCode = currency,
            Amount = amount,
            EstimatedValue = amount,
            ImpactUnit = impactUnit,
            Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
            ReferralPostId = null,
        };

        db.Donations.Add(donation);

        var nextAllocId = await db.DonationAllocations.AnyAsync(ct)
            ? await db.DonationAllocations.MaxAsync(a => a.AllocationId, ct) + 1
            : 1;

        db.DonationAllocations.Add(new DonationAllocation
        {
            AllocationId = nextAllocId,
            DonationId = nextDonationId,
            SafehouseId = DefaultSafehouseId,
            ProgramArea = "Operations",
            AmountAllocated = amount,
            AllocationDate = now,
            AllocationNotes = "Simulated online gift (no payment processor)",
        });

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
            donation.Amount,
            donation.CurrencyCode,
            donation.Notes,
            donation.ChannelSource);

        return CreatedAtAction(nameof(List), dto);
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
