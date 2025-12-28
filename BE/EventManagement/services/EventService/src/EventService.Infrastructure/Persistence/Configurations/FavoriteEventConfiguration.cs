namespace EventService.Infrastructure.Persistence.Configurations
{
    using EventService.Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    public class FavoriteEventConfiguration : IEntityTypeConfiguration<FavoriteEvent>
    {
        public void Configure(EntityTypeBuilder<FavoriteEvent> builder)
        {
            builder.ToTable("FavoriteEvent");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.UserId)
                .HasColumnName("user_id")
                .HasConversion<string>();

            //builder.HasOne(x => x.User)
            //    .WithMany(u => u.FavoriteEvents)
            //    .HasForeignKey(x => x.UserId)
            //    .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.EventId)
                .HasColumnName("event_id")
                .HasConversion<string>();

            builder.HasOne(x => x.Event)
                .WithMany(e => e.FavoriteEvents)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}