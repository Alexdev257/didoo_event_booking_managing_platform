namespace BookingService.Application.Interfaces.Services
{
    public class TicketDecrementResult
    {
        public bool IsAvailable { get; set; }
        public string? Message { get; set; }
        public int RemainingQuantity { get; set; }
        public decimal PricePerTicket { get; set; }
    }

    public class TicketListingValidateResult
    {
        public bool IsAvailable { get; set; }
        public string? Message { get; set; }
        public string? TicketId { get; set; }
        public string? EventId { get; set; }
        public decimal AskingPrice { get; set; }
    }

    public class BulkCreateTicketsRequest
    {
        public Guid TicketTypeId { get; set; }
        public Guid EventId { get; set; }
        public Guid OwnerId { get; set; }
        public int Quantity { get; set; }
        public string? Zone { get; set; }
    }

    public class BulkCreateTicketsResult
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        public List<string> CreatedTicketIds { get; set; } = new();
    }

    public interface ITicketServiceClient
    {
        Task<TicketDecrementResult> CheckAndDecrementAsync(Guid ticketTypeId, int quantity, CancellationToken cancellationToken = default);
        Task<TicketListingValidateResult> ValidateListingAsync(Guid listingId, CancellationToken cancellationToken = default);
        Task<bool> MarkListingSoldAsync(Guid listingId, Guid newOwnerUserId, CancellationToken cancellationToken = default);
        Task<BulkCreateTicketsResult> BulkCreateTicketsAsync(BulkCreateTicketsRequest bulkRequest, CancellationToken cancellationToken = default);
    }
}
