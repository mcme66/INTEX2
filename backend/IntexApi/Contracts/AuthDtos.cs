using System.ComponentModel.DataAnnotations;

namespace IntexApi.Contracts;

public sealed record RegisterRequest(
    [param: Required, StringLength(64, MinimumLength = 2)] string FirstName,
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(64, MinimumLength = 3)] string Username,
    // Password policy: min 14 chars, no complexity requirements (RequireDigit/Upper/Lower/NonAlpha all false)
    [param: Required, StringLength(128, MinimumLength = 14)] string Password,
    bool IsDonor,
    bool IsAdmin,
    string? AdminCode
);

public sealed record LoginRequest(
    [param: Required] string Username,
    [param: Required] string Password
);

public sealed record MfaLoginVerifyRequest(
    [param: Required] string MfaToken,
    [param: Required] string Code
);

public sealed record UpdateProfileRequest(
    [param: Required, StringLength(64, MinimumLength = 2)] string FirstName,
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(64, MinimumLength = 3)] string Username,
    string? CurrentPassword,
    // Same password policy applies when changing password
    [param: StringLength(128, MinimumLength = 14)] string? NewPassword
);

public sealed record AuthResponse(string Token, UserDto User);

public sealed record LoginResponse(bool RequiresMfa, string? MfaToken, AuthResponse? Auth);

public sealed record MfaSetupRequest([param: Required] string CurrentPassword);

public sealed record MfaSetupResponse(string ManualEntryKey, string OtpAuthUri);

public sealed record MfaEnableRequest(
    [param: Required] string CurrentPassword,
    [param: Required] string Code
);

public sealed record MfaDisableRequest(
    [param: Required] string CurrentPassword,
    [param: Required] string Code
);

public sealed record MfaRecoveryCodesRegenerateRequest(
    [param: Required] string CurrentPassword,
    [param: Required] string Code
);

public sealed record DeleteAccountRequest(
    [param: Required] string CurrentPassword,
    string? Code
);

public sealed record MfaRecoveryCodesResponse(string[] RecoveryCodes);

public sealed record UserDto(Guid Id, string FirstName, string Email, string Username, bool IsDonor, bool IsAdmin, bool MfaEnabled);
