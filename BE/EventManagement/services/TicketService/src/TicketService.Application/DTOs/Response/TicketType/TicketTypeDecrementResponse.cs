using SharedContracts.Common.Wrappers;

namespace TicketService.Application.DTOs.Response.TicketType
{
    public class TicketTypeDecrementResponse : CommonResponse<TicketTypeDecrementDTO>
    {
    }

    public class TicketTypeDecrementDTO
    {
        public bool IsAvailable { get; set; }
        public string? Message { get; set; }
        public int RemainingQuantity { get; set; }
        public decimal PricePerTicket { get; set; }
    }
}
