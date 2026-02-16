using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Domain.Entities
{
    public class BookingDetail : AuditableEntity
    {
        public Guid BookingId { get; set; }
        public Guid? SeatId { get; set; }
        public Guid? TicketId { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerTicket { get; set; }
        public decimal TotalPrice { get; set; }
        public virtual Booking Booking { get; set; }
    }
}
