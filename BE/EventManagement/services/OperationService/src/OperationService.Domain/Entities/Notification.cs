using OperationService.Domain.Enum;
using SharedKernel.Domain;
using System;

namespace OperationService.Domain.Entities
{
    public class Notification : AuditableEntity
    {
        public Guid UserId { get; set; }
        public Guid? EventId { get; set; }
        public Guid? RelatedId { get; set; } // BookingId, ResaleId, OrganizerId
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool? IsRead { get; set; } = false;
        public NotificationTypeEnum Type { get; set; } = NotificationTypeEnum.System;
    }
}
