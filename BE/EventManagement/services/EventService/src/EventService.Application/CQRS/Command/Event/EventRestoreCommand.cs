using EventService.Application.DTOs.Response.Event;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Event
{
    public class EventRestoreCommand : IRequest<EventRestoreResponse>
    {
        public Guid Id { get; set; }
    }
}
