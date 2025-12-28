using EventService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventService.Infrastructure.Persistence.Configurations
{
    public class EventLocationConfiguration : IEntityTypeConfiguration<EventLocaltion>
    {
        public void Configure(EntityTypeBuilder<EventLocaltion> builder)
        {
            builder.ToTable("EventLocation");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.EventId)
                .HasColumnName("event_id")
                .HasConversion<string>();

            builder.HasOne(x => x.Event)
                .WithMany(e => e.EventLocations)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(255);
            builder.Property(x => x.Address).HasColumnName("address").HasMaxLength(255);
            builder.Property(x => x.Province).HasColumnName("province").HasMaxLength(255);
            builder.Property(x => x.District).HasColumnName("district").HasMaxLength(255);
            builder.Property(x => x.Ward).HasColumnName("ward").HasMaxLength(255);
            builder.Property(x => x.Zipcode).HasColumnName("zipcode").HasMaxLength(50);
            builder.Property(x => x.Latitude).HasColumnName("latitude").HasPrecision(10, 6);
            builder.Property(x => x.Longitude).HasColumnName("longitude").HasPrecision(10, 6);
            builder.Property(x => x.ContactEmail).HasColumnName("contact_email").HasMaxLength(255);
            builder.Property(x => x.ContactPhone).HasColumnName("contact_phone").HasMaxLength(50);
            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            builder.Ignore(x => x.DomainEvents);
        }
    }
}