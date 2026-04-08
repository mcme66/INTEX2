using IntexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<AddCode> AddCodes => Set<AddCode>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("users");
            b.HasIndex(x => x.Username).IsUnique();
            b.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<AddCode>(b =>
        {
            b.ToTable("add_codes");
            b.HasKey(x => x.Code);
        });

        modelBuilder.Entity<Supporter>(b =>
        {
            b.ToTable("supporters");
            b.HasKey(x => x.SupporterId);
            b.Property(x => x.SupporterId).ValueGeneratedNever();
            b.HasIndex(x => x.AppUserId).IsUnique();
            b.HasOne(x => x.AppUser)
                .WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Donation>(b =>
        {
            b.ToTable("donations");
            b.HasKey(x => x.DonationId);
            b.Property(x => x.DonationId).ValueGeneratedNever();
            b.Property(x => x.Amount).HasPrecision(18, 2);
            b.Property(x => x.EstimatedValue).HasPrecision(18, 2);
            b.HasOne(x => x.Supporter)
                .WithMany(s => s.Donations)
                .HasForeignKey(x => x.SupporterId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DonationAllocation>(b =>
        {
            b.ToTable("donation_allocations");
            b.HasKey(x => x.AllocationId);
            b.Property(x => x.AllocationId).ValueGeneratedNever();
            b.Property(x => x.AmountAllocated).HasPrecision(18, 2);
            b.HasOne(x => x.Donation)
                .WithMany(d => d.Allocations)
                .HasForeignKey(x => x.DonationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
