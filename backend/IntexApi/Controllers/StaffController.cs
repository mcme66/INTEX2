using IntexApi.Data;
using IntexApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

public sealed record StaffUserDto(
    Guid Id,
    string FirstName,
    string Email,
    string Username,
    bool IsDonor,
    bool IsAdmin,
    DateTime CreatedAtUtc,
    int DonationCount,
    decimal TotalDonations
);

public sealed record UpdateStaffUserRequest(
    string FirstName,
    string Email,
    string Username,
    bool IsDonor,
    bool IsAdmin
);

public sealed record ResetPasswordRequest(
    string AdminCode,
    string NewPassword
);

public sealed record VerifyAdminCodeRequest(
    string AdminCode
);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class StaffController(AppDbContext db) : ControllerBase
{
    private bool CallerIsAdmin()
    {
        var sub = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(sub, out var id)) return false;
        return db.Users.AsNoTracking().Any(u => u.Id == id && u.IsAdmin);
    }

    [HttpGet]
    public async Task<ActionResult<List<StaffUserDto>>> GetAll(CancellationToken ct)
    {
        if (!CallerIsAdmin()) return Forbid();
        var users = await db.Users
            .AsNoTracking()
            .OrderBy(u => u.FirstName)
            .Select(u => new StaffUserDto(
                u.Id,
                u.FirstName,
                u.Email,
                u.Username,
                u.IsDonor,
                u.IsAdmin,
                u.CreatedAtUtc,
                db.Set<IntexApi.Models.Supporter>()
                    .Where(s => s.AppUserId == u.Id || s.Email.ToLower() == u.Email.ToLower())
                    .SelectMany(s => s.Donations)
                    .Count(),
                db.Set<IntexApi.Models.Supporter>()
                    .Where(s => s.AppUserId == u.Id || s.Email.ToLower() == u.Email.ToLower())
                    .SelectMany(s => s.Donations)
                    .Sum(d => (decimal?)(d.Amount ?? d.EstimatedValue ?? 0)) ?? 0
            ))
            .ToListAsync(ct);
        return Ok(users);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<StaffUserDto>> Update(Guid id, UpdateStaffUserRequest req, CancellationToken ct)
    {
        if (!CallerIsAdmin()) return Forbid();

        var user = await db.Users.FindAsync([id], ct);
        if (user is null) return NotFound();

        var trimmedEmail = req.Email.Trim().ToLowerInvariant();
        var trimmedUsername = req.Username.Trim();

        if (trimmedUsername != user.Username &&
            await db.Users.AnyAsync(u => u.Username == trimmedUsername && u.Id != id, ct))
            return Conflict(new { message = "Username already taken." });

        if (trimmedEmail != user.Email &&
            await db.Users.AnyAsync(u => u.Email == trimmedEmail && u.Id != id, ct))
            return Conflict(new { message = "Email already taken." });

        user.FirstName = req.FirstName.Trim();
        user.Email = trimmedEmail;
        user.Username = trimmedUsername;
        user.IsDonor = req.IsDonor;
        user.IsAdmin = req.IsAdmin;

        await db.SaveChangesAsync(ct);
        var donationCount = await db.Set<IntexApi.Models.Supporter>()
            .Where(s => s.AppUserId == user.Id || s.Email.ToLower() == user.Email.ToLower())
            .SelectMany(s => s.Donations)
            .CountAsync(ct);
        var totalDonations = await db.Set<IntexApi.Models.Supporter>()
            .Where(s => s.AppUserId == user.Id || s.Email.ToLower() == user.Email.ToLower())
            .SelectMany(s => s.Donations)
            .SumAsync(d => (decimal?)(d.Amount ?? d.EstimatedValue ?? 0), ct) ?? 0;
        return Ok(new StaffUserDto(user.Id, user.FirstName, user.Email, user.Username, user.IsDonor, user.IsAdmin, user.CreatedAtUtc, donationCount, totalDonations));
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id, ResetPasswordRequest req, CancellationToken ct)
    {
        if (!CallerIsAdmin()) return Forbid();

        var code = (req.AdminCode ?? "").Trim();
        if (code.Length == 0) return BadRequest(new { message = "Admin code is required." });

        var validCode = await db.AddCodes.AnyAsync(x => x.Code == code, ct);
        if (!validCode) return BadRequest(new { message = "Invalid admin code." });

        if (req.NewPassword.Length < 14)
            return BadRequest(new { message = "Password must be at least 14 characters." });

        var user = await db.Users.FindAsync([id], ct);
        if (user is null) return NotFound();

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("verify-admin-code")]
    public async Task<IActionResult> VerifyAdminCode(VerifyAdminCodeRequest req, CancellationToken ct)
    {
        if (!CallerIsAdmin()) return Forbid();
        var code = (req.AdminCode ?? "").Trim();
        if (code.Length == 0) return BadRequest(new { message = "Admin code is required." });
        var valid = await db.AddCodes.AnyAsync(x => x.Code == code, ct);
        if (!valid) return BadRequest(new { message = "Invalid admin code." });
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (!CallerIsAdmin()) return Forbid();

        // Prevent self-deletion
        var sub = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;
        if (Guid.TryParse(sub, out var callerId) && callerId == id)
            return BadRequest(new { message = "You cannot delete your own account." });

        var user = await db.Users.FindAsync([id], ct);
        if (user is null) return NotFound();

        db.Users.Remove(user);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
