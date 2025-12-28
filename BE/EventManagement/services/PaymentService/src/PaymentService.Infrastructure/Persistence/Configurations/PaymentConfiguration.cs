using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaymentService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PaymentService.Infrastructure.Persistence.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payment");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.UserId)
                .HasColumnName("user_id")
                .HasConversion<string>();

            builder.Property(x => x.BookingId)
                .HasColumnName("booking_id")
                .HasConversion<string>();

            builder.Property(x => x.ResaleTransactionId)
                .HasColumnName("resale_transaction_id")
                .HasConversion<string>();

            builder.Property(x => x.PaymentMethodId)
                .HasColumnName("payment_method_id")
                .HasConversion<string>();

            builder.Property(x => x.Cost)
                .HasColumnName("cost");

            builder.Property(x => x.Currency)
                .HasColumnName("currency")
                .HasMaxLength(255);

            builder.Property(x => x.TransactionCode)
                .HasColumnName("transaction_code")
                .HasMaxLength(255);

            builder.Property(x => x.ProviderResponse)
                .HasColumnName("provider_response");

            builder.Property(x => x.PaidAt)
                .HasColumnName("paid_at");

            // Relationship: PaymentMethod (1 - n Payments)
            builder.HasOne(x => x.PaymentMethod)
                .WithMany(pm => pm.Payments)
                .HasForeignKey(x => x.PaymentMethodId)
                .OnDelete(DeleteBehavior.Restrict);

            // Audit fields
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}
