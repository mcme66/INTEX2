using IntexApi.Data;
using IntexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Services;

public sealed class DonorSupporterLinker(AppDbContext db)
{
    /// <summary>Links an existing Lighthouse supporter row (same email, no app user yet) after donor registration.</summary>
    public async Task TryLinkSupporterByEmailAsync(User user, CancellationToken ct)
    {
        if (!user.IsDonor) return;

        var email = user.Email.ToLowerInvariant();
        var match = await db.Supporters
            .FirstOrDefaultAsync(
                s => s.AppUserId == null
                     && s.Email != null
                     && s.Email.ToLower() == email,
                ct);

        if (match is null) return;

        match.AppUserId = user.Id;
        await db.SaveChangesAsync(ct);
    }

    public async Task<Supporter?> GetLinkedOrLinkByEmailAsync(User user, CancellationToken ct)
    {
        var byUser = await db.Supporters.FirstOrDefaultAsync(s => s.AppUserId == user.Id, ct);
        if (byUser is not null) return byUser;

        var email = user.Email.ToLowerInvariant();
        var unlinked = await db.Supporters.FirstOrDefaultAsync(
            s => s.AppUserId == null && s.Email != null && s.Email.ToLower() == email,
            ct);

        if (unlinked is null) return null;

        unlinked.AppUserId = user.Id;
        await db.SaveChangesAsync(ct);
        return unlinked;
    }

    /// <summary>Creates a new supporter row for a donor who is not in the Lighthouse CSV (or not yet linked).</summary>
    public async Task<Supporter> CreateSupporterForAppUserAsync(User user, CancellationToken ct)
    {
        var maxId = await db.Supporters.AnyAsync(ct)
            ? await db.Supporters.MaxAsync(s => s.SupporterId, ct)
            : 0;

        var now = DateTime.UtcNow;
        var dateOnly = DateOnly.FromDateTime(now);

        var supporter = new Supporter
        {
            SupporterId = maxId + 1,
            SupporterType = "MonetaryDonor",
            DisplayName = $"{user.FirstName.Trim()} (online)",
            OrganizationName = null,
            FirstName = user.FirstName.Trim(),
            LastName = "Supporter",
            RelationshipType = "International",
            Region = "International",
            Country = "USA",
            Email = user.Email,
            Phone = null,
            Status = "Active",
            CreatedAt = now,
            FirstDonationDate = null,
            AcquisitionChannel = "Website",
            AppUserId = user.Id,
        };

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync(ct);
        return supporter;
    }

    public async Task<Supporter> EnsureSupporterForDonorAsync(User user, CancellationToken ct)
    {
        var linked = await GetLinkedOrLinkByEmailAsync(user, ct);
        if (linked is not null) return linked;

        return await CreateSupporterForAppUserAsync(user, ct);
    }
}
