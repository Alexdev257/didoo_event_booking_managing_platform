using EventService.Application.DTOs.Response.EventUserInteraction;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.UserEventInteraction
{
    public class InteractionGetByIdQuery : IRequest<InteractionGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
