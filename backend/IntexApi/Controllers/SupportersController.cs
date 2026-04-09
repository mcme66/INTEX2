using IntexApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntexApi.Controllers;

public sealed record SupporterDto(
    int supporterId,
    string firstName,
    string lastName,
    string email,
    string? phone,
    string supporterType,
    string status,
    decimal totalGiven
)
{
    [NotMapped]
    public List<ContributionDto> contributions { get; set; } = new();
}

public sealed record ContributionDto(
    int donationId,
    int supporterId,
    string donationDate,
    string donationType,
    decimal amount,
    decimal estimatedValue,
    string notes,
    string programArea
);

public sealed record CreateSupporterRequest(
    string? firstName,
    string? lastName,
    string? email,
    string? phone,
    string? supporterType,
    string? status
);

public sealed record CreateContributionRequest(
    string? donationDate,
    string? donationType,
    decimal? amount,
    string? notes,
    string? programArea
);

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class SupportersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var supporters = await db.Database.SqlQueryRaw<SupporterDto>(@"
            SELECT
                supporter_id AS ""supporterId"",
                COALESCE(first_name, display_name, organization_name, '') AS ""firstName"",
                COALESCE(last_name, '') AS ""lastName"",
                COALESCE(email, '') AS ""email"",
                phone AS ""phone"",
                COALESCE(supporter_type, '') AS ""supporterType"",
                COALESCE(status, '') AS ""status"",
                COALESCE((SELECT SUM(amount) FROM donations WHERE supporter_id = s.supporter_id), 0) AS ""totalGiven""
            FROM supporters s
            ORDER BY COALESCE(last_name, ''), COALESCE(first_name, display_name, organization_name, '')
        ").ToListAsync(ct);

        var contributions = await db.Database.SqlQueryRaw<ContributionDto>(@"
            SELECT
                d.donation_id AS ""donationId"",
                d.supporter_id AS ""supporterId"",
                d.donation_date::text AS ""donationDate"",
                d.donation_type AS ""donationType"",
                COALESCE(d.amount, 0) AS ""amount"",
                COALESCE(d.estimated_value, 0) AS ""estimatedValue"",
                COALESCE(d.notes, '') AS ""notes"",
                COALESCE(a.program_area, 'General') AS ""programArea""
            FROM donations d
            LEFT JOIN donation_allocations a ON d.donation_id = a.donation_id
            ORDER BY d.donation_date DESC
        ").ToListAsync(ct);

        var lookup = contributions
            .GroupBy(c => c.supporterId)
            .ToDictionary(g => g.Key, g => g.ToList());

        foreach (var supporter in supporters)
        {
            if (lookup.TryGetValue(supporter.supporterId, out var logs))
            {
                supporter.contributions = logs;
            }
        }

        return Ok(supporters);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupporterRequest dto)
    {
        await db.Database.ExecuteSqlRawAsync(@"
            INSERT INTO supporters (first_name, last_name, email, phone, supporter_type, status, created_at)
            VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
            dto.firstName ?? "",
            dto.lastName ?? "",
            dto.email ?? "",
            dto.phone ?? "",
            dto.supporterType ?? "",
            dto.status ?? "Active",
            DateTime.UtcNow);

        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SupporterDto dto)
    {
        await db.Database.ExecuteSqlRawAsync(@"
            UPDATE supporters SET first_name={0}, last_name={1}, email={2}, phone={3}, supporter_type={4}, status={5}
            WHERE supporter_id={6}",
            dto.firstName, dto.lastName, dto.email ?? "", dto.phone ?? "", dto.supporterType, dto.status, id);

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await db.Database.ExecuteSqlRawAsync(
            "DELETE FROM donation_allocations WHERE donation_id IN (SELECT donation_id FROM donations WHERE supporter_id = {0})",
            id);
        await db.Database.ExecuteSqlRawAsync("DELETE FROM donations WHERE supporter_id = {0}", id);
        await db.Database.ExecuteSqlRawAsync("DELETE FROM supporters WHERE supporter_id = {0}", id);

        return Ok();
    }

    [HttpPost("{id}/donations")]
    public async Task<IActionResult> AddDonation(int id, [FromBody] CreateContributionRequest dto, CancellationToken ct)
    {
        var donationType = string.IsNullOrWhiteSpace(dto.donationType) ? "Monetary" : dto.donationType.Trim();
        if (dto.amount is null || dto.amount <= 0)
            return BadRequest(new { message = "Amount is required." });

        var donationDate = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.donationDate))
        {
            if (!DateTime.TryParse(dto.donationDate, out donationDate))
                return BadRequest(new { message = "Invalid donation date." });
        }

        var newDonationId = await db.Database.SqlQueryRaw<int>(@"
            INSERT INTO donations (supporter_id, donation_type, donation_date, amount, notes)
            VALUES ({0}, {1}, {2}, {3}, {4})
            RETURNING donation_id AS ""Value""",
            id, donationType, donationDate, dto.amount.Value, dto.notes ?? "")
            .FirstAsync(ct);

        if (!string.IsNullOrWhiteSpace(dto.programArea))
        {
            await db.Database.ExecuteSqlRawAsync(@"
                INSERT INTO donation_allocations (donation_id, program_area, amount_allocated, allocation_date)
                VALUES ({0}, {1}, {2}, {3})",
                newDonationId, dto.programArea.Trim(), dto.amount.Value, DateTime.UtcNow);
        }

        return Ok();
    }
}
