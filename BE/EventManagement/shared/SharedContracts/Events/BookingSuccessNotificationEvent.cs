using System;

namespace SharedContracts.Events
{
    public record BookingSuccessNotificationEvent : IntegrationEvent
    {
        public Guid UserId { get; set; }
        public Guid BookingId { get; set; }
        public Guid EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
    }
}
