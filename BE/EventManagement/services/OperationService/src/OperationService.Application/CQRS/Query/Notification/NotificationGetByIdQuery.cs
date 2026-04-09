using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Query.Notification
{
    public class NotificationGetByIdQuery : IRequest<NotificationGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasUser { get; set; } = false!;
        public bool? HasEvent { get; set; } = false!;
    }
}
