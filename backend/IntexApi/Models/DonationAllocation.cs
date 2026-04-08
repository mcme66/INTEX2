using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntexApi.Models;

[Table("donation_allocations")]
public sealed class DonationAllocation
{
    [Key]
    [Column("allocation_id")]
    public int AllocationId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    public Donation Donation { get; set; } = null!;

    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Required, Column("program_area")]
    public string ProgramArea { get; set; } = "";

    [Column("amount_allocated", TypeName = "numeric")]
    public decimal AmountAllocated { get; set; }

    [Column("allocation_date")]
    public DateTime AllocationDate { get; set; }

    [Column("allocation_notes")]
    public string? AllocationNotes { get; set; }
}
