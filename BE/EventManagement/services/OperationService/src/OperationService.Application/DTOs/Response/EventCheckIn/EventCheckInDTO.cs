using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response.EventCheckIn
{
    public class EventCheckInDTO
    {
        public EventCheckInUserDTO? User { get; set; }
        public EventCheckInEventDTO? Event { get; set; }
        public EventCheckInBookingDetailDTO? BookingDetail { get; set; }
        //public Guid? SeatId { get; set; }
        public EventCheckInTicketDTO? Ticket { get; set; }
        public DateTime? CheckInAt { get; set; }
        public EventCheckInUserDTO? CheckByUser { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
