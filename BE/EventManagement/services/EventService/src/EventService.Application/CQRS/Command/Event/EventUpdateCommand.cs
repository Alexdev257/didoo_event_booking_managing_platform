using EventService.Application.DTOs.Response.Event;
using EventService.Domain.Enum;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Event
{
    public class EventUpdateCommand : IRequest<EventUpdateResponse>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Subtitle { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public List<TagRequest>? Tags { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        public EventStatusEnum Status { get; set; } = EventStatusEnum.Draft;
        public string? ThumbnailUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? TicketMapUrl { get; set; }
        public int AgeRestriction { get; set; } = 18;
        public Guid? CategoryId { get; set; }
        //public virtual Category? Category { get; set; }
        public Guid? OrganizerId { get; set; }
    }
}
