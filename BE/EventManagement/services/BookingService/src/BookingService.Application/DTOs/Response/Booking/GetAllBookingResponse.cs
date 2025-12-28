using SharedContracts.Common.Wrappers;
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
        public string Id { get; set; }
        public string UserId { get; set; }
        public string EventId { get; set; }
        public string Fullname { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int Amount { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
