using EventService.Application.DTOs.Response.EventReview;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.EventReview
{
    public class EventReviewUpdateCommand : IRequest<EventReviewUpdateResponse>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
    }
}
