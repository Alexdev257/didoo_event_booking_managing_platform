using EventService.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Organizer
{
    public class OrganizerEventDTO
    {
        public string Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Subtitle { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? Tags { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        public EventStatusEnum Status { get; set; } = EventStatusEnum.Draft;
        public string? ThumbnailUrl { get; set; }
        public string? BannerUrl { get; set; }
        public int AgeRestriction { get; set; } = 18;
    }
}
