using System;

namespace SharedContracts.Events
{
    public record OrganizerVerifiedNotificationEvent : IntegrationEvent
    {
        public Guid OrganizerId { get; set; }
        public Guid UserId { get; set; }
        public string OrganizerName { get; set; } = string.Empty;
    }
}
