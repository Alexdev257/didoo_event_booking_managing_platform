namespace BookingService.Application.Interfaces.Services
{
    public class TicketDecrementResult
    {
        public bool IsAvailable { get; set; }
        public string? Message { get; set; }
        public int RemainingQuantity { get; set; }
        public decimal PricePerTicket { get; set; }
    }

    public interface ITicketServiceClient
    {
        Task<TicketDecrementResult> CheckAndDecrementAsync(Guid ticketTypeId, int quantity, CancellationToken cancellationToken = default);
    }
}
