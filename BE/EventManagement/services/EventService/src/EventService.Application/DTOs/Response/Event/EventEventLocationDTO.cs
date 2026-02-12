using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Event
{
    public class EventEventLocationDTO
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public decimal? Latitude { get; set; } = 0;
        public decimal? Longitude { get; set; } = 0;
    }
}
