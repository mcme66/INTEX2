using System.ComponentModel.DataAnnotations;

namespace IntexApi.Contracts;

public sealed record RegisterRequest(
    [param: Required, StringLength(64, MinimumLength = 2)] string FirstName,
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(64, MinimumLength = 3)] string Username,
    [param: Required, StringLength(128, MinimumLength = 6)] string Password,
    bool IsDonor,
    bool IsAdmin,
    string? AdminCode
);

public sealed record LoginRequest(
    [param: Required] string Username,
    [param: Required] string Password
);

public sealed record AuthResponse(string Token, UserDto User);

public sealed record UserDto(Guid Id, string FirstName, string Email, string Username, bool IsDonor, bool IsAdmin);

