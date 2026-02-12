using EventService.Application.DTOs.Response.Organizer;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.Organizer
{
    public class OrganizerGetByIdQuery : IRequest<OrganizerGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasEvents { get; set; } = false!;

    }
}
