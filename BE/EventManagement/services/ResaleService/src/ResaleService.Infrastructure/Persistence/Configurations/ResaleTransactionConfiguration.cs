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
    public class ResaleTransactionConfiguration : IEntityTypeConfiguration<ResaleTransaction>
    {
        public void Configure(EntityTypeBuilder<ResaleTransaction> builder)
        {
            builder.ToTable("ResaleTransactions");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                    .HasColumnName("id")
                    .HasMaxLength(255)
                    .HasConversion<string>();

            builder.Property(x => x.Id)
                .IsRequired();

            builder.Property(x => x.ResaleId)
                .IsRequired();
            builder.Property(x => x.ResaleId)
                    .HasColumnName("resale_id")
                    .HasMaxLength(255)
                    .HasConversion<string>();

            builder.Property(x => x.BuyerUserId)
                .IsRequired();
            builder.Property(x => x.BuyerUserId)
                   .HasColumnName("buyer_user_id")
                   .HasMaxLength(255)
                   .HasConversion<string>();

            builder.Property(x => x.Cost)
                .HasColumnName("cost")
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.FeeCost)
                .HasColumnName("fee_cost")
                .HasPrecision(18, 2);

            builder.Property(x => x.Status)
                .HasConversion<string>()
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.TransactionDate)
                .HasColumnName("transaction_date")
                .IsRequired();

            // Index tối ưu query
            builder.HasIndex(x => x.ResaleId);
            builder.HasIndex(x => x.BuyerUserId);
            builder.HasIndex(x => x.Status);

            // Relationship (đã cấu hình ở Resale side nhưng define lại cho rõ)
            builder.HasOne(x => x.Resale)
                .WithMany(x => x.Transactions)
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
