using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Application.DTOs.Response.SignalR
{
    public class ZoneUpdateDTO
    {
        public string Zone { get; set; }
        public Guid TicketTypeId { get; set; }
        public int RemainingCount { get; set; }
    }
}
