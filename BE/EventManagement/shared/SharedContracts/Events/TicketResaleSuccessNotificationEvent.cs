using System;

namespace SharedContracts.Events
{
    public record TicketResaleSuccessNotificationEvent : IntegrationEvent
    {
        public Guid SellerUserId { get; set; }
        public Guid BuyerUserId { get; set; }
        public Guid ResaleId { get; set; }
        public Guid EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public decimal SoldPrice { get; set; }
    }
}
