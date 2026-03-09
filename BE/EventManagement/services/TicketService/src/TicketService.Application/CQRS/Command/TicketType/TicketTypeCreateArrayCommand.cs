using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Command.TicketType
{
    public class TicketTypeCreateArrayCommand : IRequest<TicketTypeCreateArrayResponse>
    {
        public List<TicketTypeCreateRequest> TicketTypes { get; set; }
    }

    public class TicketTypeCreateRequest
    {
        public Guid EventId { get; set; }
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? TotalQuantity { get; set; }
        public int? AvailableQuantity { get; set; }
        public string? Description { get; set; }
    }
}
