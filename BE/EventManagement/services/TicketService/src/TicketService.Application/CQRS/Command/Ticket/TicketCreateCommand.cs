using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.Ticket;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Command.Ticket
{
    public class TicketCreateCommand : IRequest<TicketCreateResponse>
    {
        public Guid TicketTypeId { get; set; }
        public Guid EventId { get; set; }
        public string? Zone { get; set; }
        public TicketStatusEnum Status { get; set; }
    }
}
