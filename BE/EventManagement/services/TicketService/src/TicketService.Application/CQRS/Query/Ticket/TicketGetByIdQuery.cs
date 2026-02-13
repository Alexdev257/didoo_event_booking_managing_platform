using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.Ticket;

namespace TicketService.Application.CQRS.Query.Ticket
{
    public class TicketGetByIdQuery : IRequest<TicketGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasEvent { get; set; } = false!;
        public bool? HasType { get; set; } = false!;
    }
}
