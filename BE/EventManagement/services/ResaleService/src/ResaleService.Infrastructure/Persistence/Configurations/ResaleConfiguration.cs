using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResaleService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResaleService.Infrastructure.Persistence.Configurations
{
    public class ResaleConfiguration : IEntityTypeConfiguration<Resale>
    {
        public void Configure(EntityTypeBuilder<Resale> builder)
        {
            builder.ToTable("Resales");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .IsRequired();

            builder.Property(x => x.Id)
                    .HasColumnName("id")
                    .HasMaxLength(255)
                    .HasConversion<string>();

            builder.Property(x => x.SalerUserId)
                .IsRequired();

            builder.Property(x => x.BookingDetailId)
                .HasColumnName("booking_detail_id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.BookingDetailId)
                .IsRequired();

            builder.Property(x => x.Description)
                .HasColumnName("description")
                .HasMaxLength(2000);

            builder.Property(x => x.Price)
                .HasColumnName("price")
                .HasPrecision(18, 2);

            builder.Property(x => x.Status)
                .HasConversion<string>() // lưu string thay vì int
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            // Auditable fields
            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt);

            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(x => x.DeletedAt);

            // 🔥 Unique: 1 BookingDetail chỉ được resale 1 lần
            builder.HasIndex(x => x.BookingDetailId)
                .IsUnique();

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
