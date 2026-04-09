using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Event
{
    public class EventCategoryDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? IconUrl { get; set; } = string.Empty;
    }
}
