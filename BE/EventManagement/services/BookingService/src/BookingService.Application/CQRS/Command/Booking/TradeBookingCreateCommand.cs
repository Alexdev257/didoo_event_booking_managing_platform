using BookingService.Application.DTOs.Response.Booking;
using MediatR;

namespace BookingService.Application.CQRS.Command.Booking
{
    public class TradeBookingCreateCommand : IRequest<CreateBookingResponse>
    {
        public Guid ListingId { get; set; }
        public Guid BuyerUserId { get; set; }
        public string? Fullname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}

