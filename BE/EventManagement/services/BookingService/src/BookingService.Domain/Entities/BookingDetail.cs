﻿﻿using SharedKernel.Domain;
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
        /// <summary>
        /// For Normal bookings: references the TicketType purchased.
        /// </summary>
        public Guid? TicketTypeId { get; set; }
        public Guid? TicketId { get; set; }
        /// <summary>
        /// For TradePurchase bookings: the TicketListing Id being purchased.
        /// </summary>
        public Guid? ResaleId { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerTicket { get; set; }
        public decimal TotalPrice { get; set; }
        public virtual Booking Booking { get; set; }
    }
}
