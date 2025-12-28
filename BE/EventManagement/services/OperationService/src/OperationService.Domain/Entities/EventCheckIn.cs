using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Domain.Entities
{
    public class EventCheckIn : AuditableEntity
    {
        public Guid UserId { get; set; }
        public Guid EventId { get; set; }
        public Guid BookingDetailId { get; set; }
        public Guid? SeatId { get; set; }
        public Guid? TicketId { get; set; }
        public DateTime? CheckInAt { get; set; }
        public Guid? CheckByUserId { get; set; }
    }
}
