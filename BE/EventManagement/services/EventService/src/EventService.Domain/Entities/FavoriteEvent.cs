using SharedKernel.Domain;

namespace EventService.Domain.Entities
{
    public class FavoriteEvent : AuditableEntity, IHardDelete
    {
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public virtual Event Event { get; set; }
    }
}