using EventService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace EventService.Infrastructure.Persistence.Configurations
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.ToTable("Event");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.Slug)
                .HasColumnName("slug")
                .HasMaxLength(255);

            builder.Property(x => x.Subtitle)
                .HasColumnName("subtitle")
                .HasMaxLength(255);

            builder.Property(x => x.Description)
                .HasColumnName("description");

            builder.Property(x => x.Tags)
                .HasColumnName("tags");

            builder.Property(x => x.StartTime)
                .HasColumnName("start_time");

            builder.Property(x => x.EndTime)
                .HasColumnName("end_time");

            builder.Property(x => x.OpenTime)
                .HasColumnName("open_time");

            builder.Property(x => x.ClosedTime)
                .HasColumnName("close_time");

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.ThumbnailUrl)
                .HasColumnName("thumbnail_url");

            builder.Property(x => x.BannerUrl)
                .HasColumnName("banner_url");

            builder.Property(x => x.BannerUrl)
                .HasColumnName("ticket_map_url");

            builder.Property(x => x.AgeRestriction)
                .HasColumnName("age_restriction");

            builder.Property(x => x.CategoryId)
                .HasColumnName("category_id")
                .HasConversion<string>();

            builder.HasOne(x => x.Category)
                .WithMany(c => c.Events)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Property(x => x.OrganizerId)
                .HasColumnName("organizer_id")
                .HasConversion<string>();

            builder.HasOne(x => x.Organizer)
                .WithMany(o => o.Events)
                .HasForeignKey(x => x.OrganizerId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Property(x => x.BannerUrl).HasColumnName("banner_url");
            builder.Property(x => x.TicketMapUrl).HasColumnName("ticket_map_url");
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            builder.Ignore(x => x.DomainEvents);
        }
    }
}