
using EventService.Application.DTOs.Response.EventReview;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.EventReview
{
    public class EventReviewGetListQuery : PaginationRequest, IRequest<EventReviewGetListResponse>
    {
        public Guid? EventId { get; set; }
        public Guid? UserId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        //public Guid? ParentReviewId { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? HasParent { get; set; } = false!;
        public bool? HasReplies { get; set; } = false!;
    }
}
