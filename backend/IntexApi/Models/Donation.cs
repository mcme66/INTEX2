using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntexApi.Models;

[Table("donations")]
public sealed class Donation
{
    [Key]
    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    public Supporter Supporter { get; set; } = null!;

    [Required, Column("donation_type")]
    public string DonationType { get; set; } = "";

    [Column("donation_date")]
    public DateTime DonationDate { get; set; }

    [Column("is_recurring")]
    public bool IsRecurring { get; set; }

    [Column("campaign_name")]
    public string? CampaignName { get; set; }

    [Column("channel_source")]
    public string? ChannelSource { get; set; }

    [Column("currency_code")]
    public string? CurrencyCode { get; set; }

    [Column("amount", TypeName = "numeric")]
    public decimal? Amount { get; set; }

    [Column("estimated_value", TypeName = "numeric")]
    public decimal? EstimatedValue { get; set; }

    [Column("impact_unit")]
    public string? ImpactUnit { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("referral_post_id")]
    public int? ReferralPostId { get; set; }

    public ICollection<DonationAllocation> Allocations { get; set; } = new List<DonationAllocation>();
}
