using System.ComponentModel.DataAnnotations;

namespace IntexApi.Models;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(64, MinimumLength = 2)]
    public string FirstName { get; set; } = "";

    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = "";

    [Required, StringLength(64, MinimumLength = 3)]
    public string Username { get; set; } = "";

    [Required]
    public string PasswordHash { get; set; } = "";

    public bool IsDonor { get; set; } = false;

    public bool IsAdmin { get; set; } = false;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

