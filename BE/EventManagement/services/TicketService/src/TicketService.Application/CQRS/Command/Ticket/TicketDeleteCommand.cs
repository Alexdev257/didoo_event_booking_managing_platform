using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.Ticket;

namespace TicketService.Application.CQRS.Command.Ticket
{
    public class TicketDeleteCommand : IRequest<TicketDeleteResponse>
    {
        public Guid Id { get; set; }
    }
}
