using EventService.Application.DTOs.Response.EventReview;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.EventReview
{
    public class EventReviewDeleteCommand : IRequest<EventReviewDeleteResponse>
    {
        public Guid Id { get; set; }
    }
}
