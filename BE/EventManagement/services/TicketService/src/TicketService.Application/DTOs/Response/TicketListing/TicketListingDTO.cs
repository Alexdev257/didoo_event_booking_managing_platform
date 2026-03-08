using TicketService.Domain.Enum;

namespace TicketService.Application.DTOs.Response.TicketListing
{
    public class TicketListingDTO
    {
        public string Id { get; set; } = string.Empty;
        public string TicketId { get; set; } = string.Empty;
        public string SellerUserId { get; set; } = string.Empty;
        public decimal AskingPrice { get; set; }
        public string? Description { get; set; }
        public TicketListingStatusEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

