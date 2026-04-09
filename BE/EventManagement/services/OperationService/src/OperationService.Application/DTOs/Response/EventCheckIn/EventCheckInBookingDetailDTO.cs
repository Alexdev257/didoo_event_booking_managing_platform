using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response.EventCheckIn
{
    public class EventCheckInBookingDetailDTO
    {
        public string? Id { get; set; }
        public string? BookingId { get; set; }
        //public Guid? SeatId { get; set; }
        public string? TicketId { get; set; }
        public int? Quantity { get; set; }
        public decimal? PricePerTicket { get; set; }
        public decimal? TotalPrice { get; set; }
    }
}
