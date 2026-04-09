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
    public class NotificationDeleteCommandHandler : IRequestHandler<NotificationDeleteCommand, NotificationDeleteResponse>
    {
        public Task<NotificationDeleteResponse> Handle(NotificationDeleteCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
