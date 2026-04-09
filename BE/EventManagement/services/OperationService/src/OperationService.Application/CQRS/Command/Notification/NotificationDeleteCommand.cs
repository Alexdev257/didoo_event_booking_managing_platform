using MediatR;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Command.Notification
{
    public class NotificationDeleteCommand : IRequest<NotificationDeleteResponse>
    {
        public Guid Id { get; set; }
    }
}
