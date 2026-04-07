using System.ComponentModel.DataAnnotations;

namespace IntexApi.Models;

public sealed class AddCode
{
    [Key, Required, StringLength(64)]
    public string Code { get; set; } = "";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

