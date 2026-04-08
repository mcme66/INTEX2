using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntexApi.Models;

[Table("supporters")]
public sealed class Supporter
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Required, Column("supporter_type")]
    public string SupporterType { get; set; } = "";

    [Required, Column("display_name")]
    public string DisplayName { get; set; } = "";

    [Column("organization_name")]
    public string? OrganizationName { get; set; }

    [Required, Column("first_name")]
    public string FirstName { get; set; } = "";

    [Required, Column("last_name")]
    public string LastName { get; set; } = "";

    [Required, Column("relationship_type")]
    public string RelationshipType { get; set; } = "";

    [Required, Column("region")]
    public string Region { get; set; } = "";

    [Required, Column("country")]
    public string Country { get; set; } = "";

    [Required, Column("email")]
    public string Email { get; set; } = "";

    [Column("phone")]
    public string? Phone { get; set; }

    [Required, Column("status")]
    public string Status { get; set; } = "";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("first_donation_date")]
    public DateOnly? FirstDonationDate { get; set; }

    [Required, Column("acquisition_channel")]
    public string AcquisitionChannel { get; set; } = "";

    [Column("app_user_id")]
    public Guid? AppUserId { get; set; }

    public User? AppUser { get; set; }

    public ICollection<Donation> Donations { get; set; } = new List<Donation>();
}
