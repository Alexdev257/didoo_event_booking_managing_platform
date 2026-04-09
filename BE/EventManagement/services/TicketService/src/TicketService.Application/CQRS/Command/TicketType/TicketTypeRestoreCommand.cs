using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Command.TicketType
{
    public class TicketTypeRestoreCommand : IRequest<TicketTypeRestoreResponse>
    {
        public Guid Id { get; set; }
    }
}
