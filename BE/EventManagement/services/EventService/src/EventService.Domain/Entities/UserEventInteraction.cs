using EventService.Domain.Enum;
using SharedKernel.Domain;

namespace EventService.Domain.Entities
{
    public class UserEventInteraction : AuditableEntity, IHardDelete
    {
        public InteractionTypeEnum Type { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public virtual Event Event { get; set; }
    }
}