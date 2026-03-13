using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Command.TicketType
{
    public class TicketTypeCreateCommand : IRequest<TicketTypeCreateResponse>
    {
        public Guid EventId { get; set; }
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? TotalQuantity { get; set; }
        public int? AvailableQuantity { get; set; }
        public string? Description { get; set; }
        public int? MaxTicketsPerUser { get; set; }
    }
}
