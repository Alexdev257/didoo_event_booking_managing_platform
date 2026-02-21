using BookingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookingService.Infrastructure.Persistence.Configurations
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
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.ResaleId)
                .HasColumnName("resale_id")
                .HasMaxLength(255)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.BuyerUserId)
                .HasColumnName("buyer_user_id")
                .HasMaxLength(255)
                .HasConversion<string>()
                .IsRequired();

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

            builder.HasIndex(x => x.ResaleId);
            builder.HasIndex(x => x.BuyerUserId);
            builder.HasIndex(x => x.Status);

            // Relationship
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
