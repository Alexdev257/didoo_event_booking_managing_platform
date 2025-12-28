using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OperationService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Infrastructure.Persistence.Configurations
{
    public class EventCheckInConfiguration : IEntityTypeConfiguration<EventCheckIn>
    {
        public void Configure(EntityTypeBuilder<EventCheckIn> builder)
        {
            builder.ToTable("EventCheckIn");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.UserId)
                .HasColumnName("user_id")
                .HasConversion<string>();

            builder.Property(x => x.EventId)
                .HasColumnName("event_id")
                .HasConversion<string>();

            builder.Property(x => x.BookingDetailId)
                .HasColumnName("booking_detail_id")
                .HasConversion<string>();

            builder.Property(x => x.SeatId)
                .HasColumnName("seat_id")
                .HasConversion<string>();

            builder.Property(x => x.TicketId)
                .HasColumnName("ticket_id")
                .HasConversion<string>();

            builder.Property(x => x.CheckInAt)
                .HasColumnName("check_in_at");

            builder.Property(x => x.CheckByUserId)
                .HasColumnName("check_by_user_id")
                .HasConversion<string>();

            // Auditable Fields
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}
