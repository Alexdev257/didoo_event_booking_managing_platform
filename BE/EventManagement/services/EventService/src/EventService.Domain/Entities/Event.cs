using EventService.Domain.Enum;
using SharedKernel.Domain;

namespace EventService.Domain.Entities
{
	public class Event : AuditableEntity
	{
		public string? Name { get; set; } = string.Empty;
		public string? Slug { get; set; } = string.Empty;
		public string? Subtitle { get; set; } = string.Empty;
		public string? Description { get; set; } = string.Empty;
        public string? Tags { get; set; }
        public DateTime? StartTime { get; set; }
		public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        public EventStatusEnum Status { get; set; } = EventStatusEnum.Draft;
        public string? ThumbnailUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? TicketMapUrl { get; set; }
        public int AgeRestriction { get; set; } = 18;
        public Guid? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
        public Guid? OrganizerId { get; set; }
        public virtual Organizer? Organizer { get; set; }

        public virtual ICollection<EventLocaltion>  EventLocations { get; set; }
        public virtual ICollection<EventReview> EventReviews { get; set; }
        public virtual ICollection<UserEventInteraction> UserEventInteractions { get; set; }
        public virtual ICollection<FavoriteEvent> FavoriteEvents { get; set; }
    }
}