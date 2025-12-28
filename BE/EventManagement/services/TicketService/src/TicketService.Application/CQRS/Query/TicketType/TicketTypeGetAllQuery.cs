using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Query.TicketType
{
    public class TicketTypeGetAllQuery : IRequest<GetAllTicketTypeResponse>
    {
    }
}
