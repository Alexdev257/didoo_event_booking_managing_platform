using EventService.Domain.Enum;
using SharedKernel.Domain;

namespace EventService.Domain.Entities
{
    public class EventReview : AuditableEntity
    {
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public string? ReasonDeleted { get; set; } = string.Empty;
        public Guid? ParentReviewId { get; set; }
        public virtual Event? Event { get; set; }
        public EventReview? ParentReview { get; set; }
        public ICollection<EventReview> Replies { get; set; } = new List<EventReview>();
    }
}