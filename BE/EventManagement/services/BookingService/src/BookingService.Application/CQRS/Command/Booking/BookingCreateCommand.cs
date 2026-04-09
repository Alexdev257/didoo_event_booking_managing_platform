using BookingService.Application.DTOs.Response.Booking;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Application.CQRS.Command.Booking
{
    public class BookingCreateCommand : IRequest<CreateBookingResponse>
    {
        public Guid TicketTypeId { get; set; }
        public int Quantity { get; set; }
        public Guid UserId { get; set; }
        public Guid EventId { get; set; }
        public string? Fullname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}
