using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Application.DTOs.Response.Ticket
{
    public class TicketTicketTypeDTO
    {
        public string Id { get; set; }
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? TotalQuantity { get; set; }
        public int? AvailableQuantity { get; set; }
        public string? Description { get; set; }
    }
}
