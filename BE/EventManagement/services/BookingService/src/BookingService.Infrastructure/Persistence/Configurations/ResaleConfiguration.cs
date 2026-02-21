using BookingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookingService.Infrastructure.Persistence.Configurations
{
    public class ResaleConfiguration : IEntityTypeConfiguration<Resale>
    {
        public void Configure(EntityTypeBuilder<Resale> builder)
        {
            builder.ToTable("Resales");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.SalerUserId)
                .IsRequired();

            builder.Property(x => x.BookingDetailId)
                .HasColumnName("booking_detail_id")
                .HasMaxLength(255)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.Description)
                .HasColumnName("description")
                .HasMaxLength(2000);

            builder.Property(x => x.Price)
                .HasColumnName("price")
                .HasPrecision(18, 2);

            builder.Property(x => x.Status)
                .HasConversion<string>()
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            // Unique: 1 BookingDetail chỉ được resale 1 lần
            builder.HasIndex(x => x.BookingDetailId).IsUnique();
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.SalerUserId);

            // Relationship
            builder.HasMany(x => x.Transactions)
                .WithOne(x => x.Resale)
                .HasForeignKey(x => x.ResaleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}
