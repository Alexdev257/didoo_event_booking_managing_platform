using MediatR;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Command.Notification
{
    public class NotificationCreateCommand : IRequest<NotificationCreateResponse>
    {
        public Guid UserId { get; set; }
        public Guid? EventId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
    }
}
