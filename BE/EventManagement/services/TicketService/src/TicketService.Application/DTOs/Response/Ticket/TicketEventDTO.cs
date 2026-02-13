using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.DTOs.Response.Ticket
{
    public class TicketEventDTO
    {
        public string Id { get; set; }
        public string? Name { get; set; }
        public string? Slug { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public List<TagRequest>? Tags { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        public int? Status { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? BannerUrl { get; set; }
        public int? AgeRestriction { get; set; }
    }
}
