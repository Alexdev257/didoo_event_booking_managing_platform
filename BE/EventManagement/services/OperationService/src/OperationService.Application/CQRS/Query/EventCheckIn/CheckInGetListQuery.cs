using MediatR;
using OperationService.Application.DTOs.Response.EventCheckIn;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Query.EventCheckIn
{
    public class CheckInGetListQuery : IRequest<CheckInGetListResponse>
    {
        public Guid? UserId { get; set; }
        public Guid? EventId { get; set; }
        public Guid? BookingDetailId { get; set; }
        //public Guid? SeatId { get; set; }
        public Guid? TicketId { get; set; }
        public DateTime? CheckInAt { get; set; }
        public Guid? CheckByUserId { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? HasUser { get; set; } = false!;
        public bool? HasEvent { get; set; } = false!;
        public bool? HasBooking { get; set; } = false!;
        public bool? HasTicket { get; set; } = false!;
    }
}
