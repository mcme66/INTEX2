using System.Security.Claims;
using System.Text.Json;
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
public sealed class AuthController(
    AppDbContext db,
    IJwtTokenService jwt,
    DonorSupporterLinker donorSupporterLinker,
    IMfaTotpService mfaTotp,
    IMfaSecretProtector mfaSecretProtector,
    IMfaChallengeService mfaChallengeService,
    IMfaRecoveryCodeService mfaRecoveryCodeService) : ControllerBase
{
    private static UserDto ToUserDto(User user) =>
        new(user.Id, user.FirstName, user.Email, user.Username, user.IsDonor, user.IsAdmin, user.MfaEnabled);

    private static bool VerifyPassword(User user, string password) =>
        BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

    private bool VerifyTotp(User user, string code)
    {
        if (!user.MfaEnabled || string.IsNullOrWhiteSpace(user.MfaSecretProtected)) return false;

        var secret = mfaSecretProtector.Unprotect(user.MfaSecretProtected);
        return secret is not null && mfaTotp.VerifyCode(secret, code);
    }

    private bool TryUseRecoveryCode(User user, string code)
    {
        if (string.IsNullOrWhiteSpace(user.MfaRecoveryCodesJson)) return false;

        List<string>? hashes;
        try
        {
            hashes = JsonSerializer.Deserialize<List<string>>(user.MfaRecoveryCodesJson);
        }
        catch
        {
            hashes = null;
        }

        if (hashes is null || hashes.Count == 0) return false;

        for (var i = 0; i < hashes.Count; i++)
        {
            if (!mfaRecoveryCodeService.Verify(code, hashes[i])) continue;

            hashes.RemoveAt(i);
            user.MfaRecoveryCodesJson = hashes.Count == 0 ? null : JsonSerializer.Serialize(hashes);
            return true;
        }

        return false;
    }

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
            ToUserDto(user)
        ));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest req, CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Username == req.Username, ct);
        if (user is null) return Unauthorized(new { message = "Invalid username or password." });

        var ok = VerifyPassword(user, req.Password);
        if (!ok) return Unauthorized(new { message = "Invalid username or password." });

        if (user.MfaEnabled)
        {
            var challengeToken = mfaChallengeService.Create(user.Id);
            return Ok(new LoginResponse(true, challengeToken, null));
        }

        var token = jwt.CreateToken(user);
        return Ok(new LoginResponse(false, null, new AuthResponse(token, ToUserDto(user))));
    }

    [HttpPost("login/mfa")]
    public async Task<ActionResult<AuthResponse>> VerifyMfaLogin(MfaLoginVerifyRequest req, CancellationToken ct)
    {
        var userId = mfaChallengeService.Validate(req.MfaToken);
        if (userId is null) return Unauthorized(new { message = "The MFA challenge has expired. Sign in again." });

        var user = await db.Users.FindAsync([userId.Value], ct);
        if (user is null || !user.MfaEnabled) return Unauthorized(new { message = "MFA verification is no longer valid. Sign in again." });

        if (!VerifyTotp(user, req.Code) && !TryUseRecoveryCode(user, req.Code))
            return Unauthorized(new { message = "Invalid authentication code." });

        await db.SaveChangesAsync(ct);

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(token, ToUserDto(user)));
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

        return Ok(ToUserDto(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<AuthResponse>> UpdateProfile(UpdateProfileRequest req, CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        var trimmedEmail = req.Email.Trim().ToLowerInvariant();
        var trimmedUsername = req.Username.Trim();

        if (trimmedUsername != user.Username &&
            await db.Users.AnyAsync(u => u.Username == trimmedUsername && u.Id != userId, ct))
            return Conflict(new { message = "Username already taken." });

        if (trimmedEmail != user.Email &&
            await db.Users.AnyAsync(u => u.Email == trimmedEmail && u.Id != userId, ct))
            return Conflict(new { message = "Email already taken." });

        if (!string.IsNullOrEmpty(req.NewPassword))
        {
            if (string.IsNullOrEmpty(req.CurrentPassword))
                return BadRequest(new { message = "Current password is required to set a new password." });

            if (!VerifyPassword(user, req.CurrentPassword))
                return BadRequest(new { message = "Current password is incorrect." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        }

        user.FirstName = req.FirstName.Trim();
        user.Email = trimmedEmail;
        user.Username = trimmedUsername;

        await db.SaveChangesAsync(ct);

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(
            token,
            ToUserDto(user)
        ));
    }

    [Authorize]
    [HttpPost("mfa/setup")]
    public async Task<ActionResult<MfaSetupResponse>> SetupMfa(MfaSetupRequest req, CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        if (!VerifyPassword(user, req.CurrentPassword))
            return BadRequest(new { message = "Current password is incorrect." });

        var secret = mfaTotp.GenerateSecret();
        user.MfaPendingSecretProtected = mfaSecretProtector.Protect(secret);
        await db.SaveChangesAsync(ct);

        return Ok(new MfaSetupResponse(
            secret,
            mfaTotp.BuildOtpAuthUri("North Star Refuge", user.Email, secret)
        ));
    }

    [Authorize]
    [HttpPost("mfa/enable")]
    public async Task<ActionResult<MfaRecoveryCodesResponse>> EnableMfa(MfaEnableRequest req, CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        if (!VerifyPassword(user, req.CurrentPassword))
            return BadRequest(new { message = "Current password is incorrect." });

        if (string.IsNullOrWhiteSpace(user.MfaPendingSecretProtected))
            return BadRequest(new { message = "Start MFA setup before confirming it." });

        var secret = mfaSecretProtector.Unprotect(user.MfaPendingSecretProtected);
        if (secret is null || !mfaTotp.VerifyCode(secret, req.Code))
            return BadRequest(new { message = "Invalid authentication code." });

        var recoveryCodes = mfaRecoveryCodeService.GenerateCodes();
        user.MfaEnabled = true;
        user.MfaSecretProtected = mfaSecretProtector.Protect(secret);
        user.MfaPendingSecretProtected = null;
        user.MfaRecoveryCodesJson = JsonSerializer.Serialize(
            recoveryCodes.Select(mfaRecoveryCodeService.Hash).ToList());

        await db.SaveChangesAsync(ct);
        return Ok(new MfaRecoveryCodesResponse(recoveryCodes));
    }

    [Authorize]
    [HttpPost("mfa/disable")]
    public async Task<ActionResult<AuthResponse>> DisableMfa(MfaDisableRequest req, CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        if (!VerifyPassword(user, req.CurrentPassword))
            return BadRequest(new { message = "Current password is incorrect." });

        if (!VerifyTotp(user, req.Code) && !TryUseRecoveryCode(user, req.Code))
            return BadRequest(new { message = "Invalid authentication code." });

        user.MfaEnabled = false;
        user.MfaSecretProtected = null;
        user.MfaPendingSecretProtected = null;
        user.MfaRecoveryCodesJson = null;

        await db.SaveChangesAsync(ct);

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(token, ToUserDto(user)));
    }

    [Authorize]
    [HttpPost("mfa/recovery-codes")]
    public async Task<ActionResult<MfaRecoveryCodesResponse>> RegenerateRecoveryCodes(
        MfaRecoveryCodesRegenerateRequest req,
        CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        if (!VerifyPassword(user, req.CurrentPassword))
            return BadRequest(new { message = "Current password is incorrect." });

        if (!VerifyTotp(user, req.Code) && !TryUseRecoveryCode(user, req.Code))
            return BadRequest(new { message = "Invalid authentication code." });

        var recoveryCodes = mfaRecoveryCodeService.GenerateCodes();
        user.MfaRecoveryCodesJson = JsonSerializer.Serialize(
            recoveryCodes.Select(mfaRecoveryCodeService.Hash).ToList());

        await db.SaveChangesAsync(ct);
        return Ok(new MfaRecoveryCodesResponse(recoveryCodes));
    }

    [Authorize]
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest req, CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId)) return Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user is null) return Unauthorized();

        if (!VerifyPassword(user, req.CurrentPassword))
            return BadRequest(new { message = "Current password is incorrect." });

        if (user.MfaEnabled)
        {
            if (string.IsNullOrWhiteSpace(req.Code))
                return BadRequest(new { message = "Authentication code is required to delete an MFA-protected account." });

            if (!VerifyTotp(user, req.Code) && !TryUseRecoveryCode(user, req.Code))
                return BadRequest(new { message = "Invalid authentication code." });
        }

        var linkedSupporters = await db.Supporters
            .Where(s => s.AppUserId == userId)
            .ToListAsync(ct);

        foreach (var supporter in linkedSupporters)
            supporter.AppUserId = null;

        db.Users.Remove(user);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
