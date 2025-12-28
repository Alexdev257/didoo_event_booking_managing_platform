using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Domain.Entities
{
    public class TicketType : AuditableEntity
    {
        public Guid EventId { get; set; } = default!;
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? TotalQuantity { get; set; }
        public int? AvailableQuantity { get; set; }
        public string? Description { get; set; }
        public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
        public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
