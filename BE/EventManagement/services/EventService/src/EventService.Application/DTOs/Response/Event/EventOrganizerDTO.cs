using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Event
{
    public class EventOrganizerDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Email { get; set; } = string.Empty;
        public string? Phone { get; set; } = string.Empty;
    }
}
