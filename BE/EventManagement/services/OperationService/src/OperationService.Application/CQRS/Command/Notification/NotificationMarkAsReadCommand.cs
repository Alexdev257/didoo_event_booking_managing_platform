using MediatR;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Text.Json.Serialization;

namespace OperationService.Application.CQRS.Command.Notification
{
    public class NotificationMarkAsReadCommand : IRequest<NotificationMarkAsReadResponse>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
    }
}
