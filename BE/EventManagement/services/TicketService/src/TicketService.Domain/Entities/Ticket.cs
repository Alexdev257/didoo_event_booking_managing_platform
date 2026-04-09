using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Domain.Enum;

namespace TicketService.Domain.Entities
{
    public class Ticket : AuditableEntity
    {
        public Guid TicketTypeId { get; set; }
        public Guid EventId { get; set; }
        public string? Zone { get; set; }
        public TicketStatusEnum Status { get; set; }
        public virtual TicketType TicketType { get; set; }
        public Guid? OwnerId { get; set; }
        public DateTime? LockExpiration { get; set; }
        public virtual ICollection<TicketListing> Listings { get; set; } = new List<TicketListing>();
    }
}
