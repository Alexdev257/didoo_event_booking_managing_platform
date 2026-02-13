using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Application.DTOs.Response.TicketType
{
    public class TicketTypeDTO
    {
        public string Id { get; set; }
        public TicketTypeEventDTO Event { get; set; }
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? TotalQuantity { get; set; }
        public int? AvailableQuantity { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
