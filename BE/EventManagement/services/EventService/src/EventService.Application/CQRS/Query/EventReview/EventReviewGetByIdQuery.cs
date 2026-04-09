using EventService.Application.DTOs.Response.EventReview;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.EventReview
{
    public class EventReviewGetByIdQuery : IRequest<EventReviewGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasParent { get; set; } = true!;
        public bool? HasReplies { get; set; } = true!;
    }
}
