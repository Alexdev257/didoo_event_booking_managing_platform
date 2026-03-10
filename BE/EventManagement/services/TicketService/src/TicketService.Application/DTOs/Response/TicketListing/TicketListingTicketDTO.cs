using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Domain.Enum;

namespace TicketService.Application.DTOs.Response.TicketListing
{
    public class TicketListingTicketDTO
    {
        public string? Id { get; set; }
        public string? TicketTypeId { get; set; }
        //public string? EventId { get; set; }
        public string? Zone { get; set; }
        public TicketStatusEnum Status { get; set; }
        public string? OwnerId { get; set; }
    }
}
