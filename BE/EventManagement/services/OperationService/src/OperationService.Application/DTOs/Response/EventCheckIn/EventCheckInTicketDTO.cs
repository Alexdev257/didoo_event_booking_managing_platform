using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response.EventCheckIn
{
    public class EventCheckInTicketDTO
    {
        public string? Id { get; set; }
        public string? EventId { get; set; }
        public string? Zone { get; set; }
        public string? Status { get; set; }
        public string? OwnerId { get; set; }
        
    }

    public class EventCheckInTicketTypeDTO
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public double? Price { get; set; }
        public string? Description { get; set; }

    }
}
