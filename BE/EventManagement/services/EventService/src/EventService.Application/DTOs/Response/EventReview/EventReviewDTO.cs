using EventService.Application.DTOs.Response.Event;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.EventReview
{
    public class EventReviewDTO
    {
        public string Id { get; set; }
        public EventReviewEventDTO Event { get; set; }
        public EventReviewUserDTO User { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public string? ReasonDeleted { get; set; } = string.Empty;
        public EventReviewDTO? ParentReview { get; set; }
        public List<EventReviewDTO>? Replies { get; set; }
        //public virtual Event? Event { get; set; }
        //public EventReview? ParentReview { get; set; }
        //public ICollection<EventReview> Replies { get; set; } = new List<EventReview>();
    }
}
