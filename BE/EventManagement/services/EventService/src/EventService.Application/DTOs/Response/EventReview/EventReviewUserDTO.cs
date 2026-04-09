using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.EventReview
{
    public class EventReviewUserDTO 
    {
        public string Id { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public int? Gender { get; set; }
    }
}
