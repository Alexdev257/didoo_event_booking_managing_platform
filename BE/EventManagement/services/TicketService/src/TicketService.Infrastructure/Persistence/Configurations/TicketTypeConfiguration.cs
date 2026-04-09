using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Domain.Entities;

namespace TicketService.Infrastructure.Persistence.Configurations
{
    public class TicketTypeConfiguration : IEntityTypeConfiguration<TicketType>
    {
        public void Configure(EntityTypeBuilder<TicketType> builder)
        {
            builder.ToTable("TicketType");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.EventId)
                .HasColumnName("event_id")
                .HasConversion<string>();

            builder.Property(x => x.Name)
                .HasColumnName("name")
                .HasMaxLength(255);

            builder.Property(x => x.Price)
                .HasColumnName("price");

            builder.Property(x => x.TotalQuantity)
                .HasColumnName("total_quantity");

            builder.Property(x => x.AvailableQuantity)
                .HasColumnName("available_quantity");

            builder.Property(x => x.Description)
                .HasColumnName("description")
                .HasMaxLength(500);

            builder.Property(x => x.MaxTicketsPerUser)
                .HasColumnName("max_tickets_per_user");

            // Relationships
            builder.HasMany(x => x.Seats)
                .WithOne(s => s.TicketType)
                .HasForeignKey(s => s.TicketTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Tickets)
                .WithOne(t => t.TicketType)
                .HasForeignKey(t => t.TicketTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Auditable
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}
