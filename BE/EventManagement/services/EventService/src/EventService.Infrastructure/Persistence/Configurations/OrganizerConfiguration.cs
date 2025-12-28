using EventService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventService.Infrastructure.Persistence.Configurations
{
    public class OrganizerConfiguration : IEntityTypeConfiguration<Organizer>
    {
        public void Configure(EntityTypeBuilder<Organizer> builder)
        {
            builder.ToTable("Organizer");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(255);
            builder.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(255);
            builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(255);
            builder.Property(x => x.LogoUrl).HasColumnName("logo_url").HasMaxLength(255);
            builder.Property(x => x.BannerUrl).HasColumnName("banner_url").HasMaxLength(255);
            builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(255);
            builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(50);
            builder.Property(x => x.WebsiteUrl).HasColumnName("website_url").HasMaxLength(255);
            builder.Property(x => x.FacebookUrl).HasColumnName("facebook_url").HasMaxLength(255);
            builder.Property(x => x.InstagramUrl).HasColumnName("instagram_url").HasMaxLength(255);
            builder.Property(x => x.TiktokUrl).HasColumnName("tiktok_url").HasMaxLength(255);
            builder.Property(x => x.Address).HasColumnName("address").HasMaxLength(255);

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.CreatedBy)
                .HasColumnName("created_by_user_id")
                .HasConversion<string>();

            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            builder.Ignore(x => x.DomainEvents);
        }
    }
}