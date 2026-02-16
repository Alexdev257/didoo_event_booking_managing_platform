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
    public class NotificationUpdateCommandHandler : IRequestHandler<NotificationUpdateCommand, NotificationUpdateResponse>
    {
        public Task<NotificationUpdateResponse> Handle(NotificationUpdateCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
