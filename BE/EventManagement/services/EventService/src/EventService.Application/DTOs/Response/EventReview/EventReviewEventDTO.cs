using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.EventReview
{
    public class EventReviewEventDTO
    {
        public string Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Subtitle { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
    }
}
