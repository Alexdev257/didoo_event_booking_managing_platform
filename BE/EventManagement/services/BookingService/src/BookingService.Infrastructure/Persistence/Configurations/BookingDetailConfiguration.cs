using BookingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Infrastructure.Persistence.Configurations
{
    public class BookingDetailConfiguration : IEntityTypeConfiguration<BookingDetail>
    {
        public void Configure(EntityTypeBuilder<BookingDetail> builder)
        {
            builder.ToTable("BookingDetail");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.BookingId)
                .HasColumnName("booking_id")
                .HasConversion<string>();

            builder.Property(x => x.SeatId)
                .HasColumnName("seat_id")
                .HasConversion<string>();

            builder.Property(x => x.TicketId)
                .HasColumnName("ticket_id")
                .HasConversion<string>();

            builder.Property(x => x.Quantity)
                .HasColumnName("quantity");

            builder.Property(x => x.PricePerTicket)
                .HasColumnName("price_per_ticket")
                .HasPrecision(18, 2);

            builder.Property(x => x.TotalPrice)
                .HasColumnName("total_price")
                .HasPrecision(18, 2);

            // Relationship
            builder.HasOne(x => x.Booking)
                .WithMany(x => x.BookingDetails)
                .HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Restrict);

            // Auditable fields
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}
