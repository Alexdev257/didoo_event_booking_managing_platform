﻿using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Application.DTOs.Response.Booking
{
    public class GetAllBookingResponse : CommonResponse<List<BookingDTO>> { }

    public class BookingDTO
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int Amount { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public string BookingType { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string PaymentUrl { get; set; } = string.Empty;
        public List<BookingDetailSubDTO> BookingDetails { get; set; } = new List<BookingDetailSubDTO>();
    }

    public class BookingDetailSubDTO
    {
        public string Id { get; set; } = default!;
        public string? SeatId { get; set; }
        public string? TicketId { get; set; }
        /// <summary>For TradePurchase bookings: the TicketListing Id.</summary>
        public string? TicketListingId { get; set; }

        public string? TicketTypeId { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerTicket { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
