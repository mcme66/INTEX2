using System.ComponentModel.DataAnnotations;

namespace IntexApi.Contracts;

public sealed record DonationDto(
    int DonationId,
    DateTime DonationDate,
    string DonationType,
    decimal? Amount,
    decimal? EstimatedValue,
    string? ImpactUnit,
    string? CurrencyCode,
    string? Notes,
    string? ChannelSource);

public sealed record CreateDonationRequest(
    [Required, StringLength(30)] string DonationType,
    [Range(0, 10_000_000)] decimal? Amount,
    [Range(0, 10_000_000)] decimal? EstimatedValue,
    [StringLength(50)] string? ImpactUnit,
    [StringLength(1000)] string? Notes,
    [StringLength(8)] string? CurrencyCode);

public sealed record UpdateDonationRequest(
    [Required, StringLength(30)] string DonationType,
    [Range(0, 10_000_000)] decimal? Amount,
    [Range(0, 10_000_000)] decimal? EstimatedValue,
    [StringLength(50)] string? ImpactUnit,
    [StringLength(1000)] string? Notes,
    [StringLength(8)] string? CurrencyCode);
