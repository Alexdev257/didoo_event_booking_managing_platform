using EventService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventService.Infrastructure.Persistence.Configurations
{
    public class EventReviewConfiguration : IEntityTypeConfiguration<EventReview>
    {
        public void Configure(EntityTypeBuilder<EventReview> builder)
        {
            builder.ToTable("EventReview");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.UserId)
                .HasColumnName("user_id")
                .HasConversion<string>();

            //builder.HasOne(x => x.UserId)
            //    .WithMany(u => u.EventReviews)
            //    .HasForeignKey(x => x.UserId)
            //    .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.EventId)
                .HasColumnName("event_id")
                .HasConversion<string>();

            builder.HasOne(x => x.Event)
                .WithMany(e => e.EventReviews)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.ParentReviewId)
                .HasColumnName("parent_review_id")
                .HasConversion<string>();

            builder.HasOne(x => x.ParentReview)
                .WithMany(r => r.Replies)
                .HasForeignKey(x => x.ParentReviewId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Rating).HasColumnName("rating");
            builder.Property(x => x.Comment).HasColumnName("comment");

            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.ReasonDeleted).HasColumnName("reason_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}