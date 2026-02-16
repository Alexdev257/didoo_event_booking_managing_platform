using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using OperationService.Application.DTOs.Response.EventCheckIn;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Query.EventCheckIn
{
    public class CheckInGetByIdQuery : IRequest<CheckInGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasUser { get; set; } = false!;
        public bool? HasEvent { get; set; } = false!;
        public bool? HasBooking { get; set; } = false!;
        public bool? HasTicket { get; set; } = false!;

    }
}
