using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.BookingDetail
{
    public class BookingDetailGetListResponse : CommonResponse<PaginationResponse<object>>
    {
    }

    public class BookingDetailDTO
    {
        public string Id { get; set; } = default!;
        public string BookingId { get; set; } = default!;
        public string? SeatId { get; set; }
        public string? TicketId { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerTicket { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
