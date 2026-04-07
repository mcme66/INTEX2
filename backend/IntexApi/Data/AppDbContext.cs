using IntexApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IntexApi.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<AddCode> AddCodes => Set<AddCode>();

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
    }
}

