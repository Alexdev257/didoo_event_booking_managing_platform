using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Query.TicketType
{
    public class TicketTypeGetByIdQuery : IRequest<TicketTypeGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
