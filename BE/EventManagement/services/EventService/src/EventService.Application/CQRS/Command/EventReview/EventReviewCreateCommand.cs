using EventService.Application.DTOs.Response.EventReview;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.EventReview
{
    public class EventReviewCreateCommand : IRequest<EventReviewCreateResponse>
    {
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public string? ReasonDeleted { get; set; } = string.Empty;
        public Guid? ParentReviewId { get; set; }
        //public virtual Event? Event { get; set; }
        //public EventReview? ParentReview { get; set; }
        //public ICollection<EventReview> Replies { get; set; } = new List<EventReview>();
    }
}
