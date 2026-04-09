using EventService.Application.DTOs.Response.EventUserInteraction;
using EventService.Domain.Enum;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.EventInteraction
{
    public class InteractionSoftDeleteCommand : IRequest<InteractionSoftDeleteResponse>
    {
        public InteractionTypeEnum Type { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
    }
}
