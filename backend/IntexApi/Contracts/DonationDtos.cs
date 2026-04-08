using System.ComponentModel.DataAnnotations;

namespace IntexApi.Contracts;

public sealed record DonationDto(
    int DonationId,
    DateTime DonationDate,
    string DonationType,
    decimal? Amount,
    string? CurrencyCode,
    string? Notes,
    string? ChannelSource);

public sealed record CreateDonationRequest(
    [Range(0.01, 1_000_000)] decimal Amount,
    string? Notes,
    [StringLength(8)] string? CurrencyCode);
