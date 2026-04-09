using EventService.Application.DTOs.Response.Event;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.Event
{
    public class EventGetByIdQuery : IRequest<EventGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasCategory { get; set; } = true!;
        public bool? HasOrganizer { get; set; } = true!;
        public bool? HasLocations { get; set; } = true!;
    }
}
