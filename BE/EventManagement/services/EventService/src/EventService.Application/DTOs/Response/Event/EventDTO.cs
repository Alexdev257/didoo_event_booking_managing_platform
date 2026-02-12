using EventService.Application.CQRS.Command.Event;
using EventService.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Event
{
    public class EventDTO
    {
        public string Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Subtitle { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public List<TagRequest>? Tags { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        public EventStatusEnum Status { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? BannerUrl { get; set; }
        public int AgeRestriction { get; set; } = 18;
        public EventCategoryDTO? Category { get; set; }
        public EventOrganizerDTO? Organizer { get; set; }
        public List<EventEventLocationDTO>? Locations  { get; set; }
    }
}
