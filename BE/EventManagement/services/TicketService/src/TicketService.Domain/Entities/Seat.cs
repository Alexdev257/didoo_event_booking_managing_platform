using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Domain.Enum;

namespace TicketService.Domain.Entities
{
    public class Seat : AuditableEntity
    {
        public Guid TicketTypeId { get; set; }
        public Guid EventId { get; set; }
        public string? SeatCode { get; set; }
        public SeatStatusEnum Status { get; set; }
        public virtual TicketType TicketType { get; set; }
    }
}
