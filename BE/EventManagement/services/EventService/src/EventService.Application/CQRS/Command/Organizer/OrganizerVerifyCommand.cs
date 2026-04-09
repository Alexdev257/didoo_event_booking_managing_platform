using EventService.Application.DTOs.Response.Organizer;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Organizer
{
    public class OrganizerVerifyCommand : IRequest<OrganizerVerifyResponse>
    {
        public Guid Id { get; set; }
    }
}
