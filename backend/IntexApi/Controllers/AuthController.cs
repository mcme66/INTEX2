using System.Security.Claims;
using BCrypt.Net;
using IntexApi.Contracts;
using IntexApi.Data;
using IntexApi.Models;
using IntexApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(AppDbContext db, IJwtTokenService jwt, DonorSupporterLinker donorSupporterLinker) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req, CancellationToken ct)
    {
        var usernameTaken = await db.Users.AnyAsync(x => x.Username == req.Username, ct);
        if (usernameTaken) return Conflict(new { message = "Username already exists." });

        var emailTaken = await db.Users.AnyAsync(x => x.Email == req.Email, ct);
        if (emailTaken) return Conflict(new { message = "Email already exists." });

        if (!req.IsAdmin && !req.IsDonor)
            return BadRequest(new { message = "Select at least one role (Donor and/or Admin)." });

        if (req.IsAdmin)
        {
            var code = (req.AdminCode ?? "").Trim();
            if (code.Length == 0) return BadRequest(new { message = "Admin code is required to register as an admin." });

            var valid = await db.AddCodes.AnyAsync(x => x.Code == code, ct);
            if (!valid) return BadRequest(new { message = "Invalid admin code." });
        }

        var user = new User
        {
            FirstName = req.FirstName.Trim(),
            Email = req.Email.Trim().ToLowerInvariant(),
            Username = req.Username.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            IsDonor = req.IsDonor,
            IsAdmin = req.IsAdmin,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        if (req.IsDonor)
            await donorSupporterLinker.TryLinkSupporterByEmailAsync(user, ct);

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(
            token,
            new UserDto(user.Id, user.FirstName, user.Email, user.Username, user.IsDonor, user.IsAdmin)
        ));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req, CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Username == req.Username, ct);
        if (user is null) return Unauthorized(new { message = "Invalid username or password." });

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok) return Unauthorized(new { message = "Invalid username or password." });

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(
            token,
            new UserDto(user.Id, user.FirstName, user.Email, user.Username, user.IsDonor, user.IsAdmin)
        ));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        return Ok(new UserDto(user.Id, user.FirstName, user.Email, user.Username, user.IsDonor, user.IsAdmin));
    }
}

