using EventService.Application.DTOs.Response.Event;
using EventService.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Event
{
    public class EventVerifyCommand : IRequest<EventVerfiyResponse>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public EventStatusEnum Status { get; set; }
    }
}
