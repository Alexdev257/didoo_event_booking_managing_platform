using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Domain.Enum;

namespace TicketService.Application.DTOs.Response.Ticket
{
    public class TicketDTO
    {
        public string Id { get; set; }
        public TicketTicketTypeDTO? TicketType { get; set; }
        public TicketEventDTO? Event { get; set; }
        public string? Zone { get; set; }
        public TicketStatusEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
