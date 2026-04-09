using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TicketService.Domain.Entities;

namespace TicketService.Infrastructure.Persistence.Configurations
{
    public class TicketListingConfiguration : IEntityTypeConfiguration<TicketListing>
    {
        public void Configure(EntityTypeBuilder<TicketListing> builder)
        {
            builder.ToTable("TicketListing");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.TicketId)
                .HasColumnName("ticket_id")
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.SellerUserId)
                .HasColumnName("seller_user_id")
                .HasConversion<string>()
                .IsRequired();

            builder.Property(x => x.AskingPrice)
                .HasColumnName("asking_price")
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(x => x.Description)
                .HasColumnName("description")
                .HasMaxLength(2000);

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            // One Ticket can have many Listings (only one Active at a time enforced at app level)
            builder.HasOne(x => x.Ticket)
                .WithMany(t => t.Listings)
                .HasForeignKey(x => x.TicketId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.SellerUserId);
            builder.HasIndex(x => x.TicketId);

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

