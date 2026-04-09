using MediatR;
using OperationService.Application.CQRS.Command.Notification;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Handler.Notification
{
    public class NotificationCreateCommandHandler : IRequestHandler<NotificationCreateCommand, NotificationCreateResponse>
    {
        public Task<NotificationCreateResponse> Handle(NotificationCreateCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
