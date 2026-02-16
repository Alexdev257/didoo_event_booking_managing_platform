using MediatR;
using OperationService.Application.CQRS.Query.Notification;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Handler.Notification
{
    public class NotificationGetByIdQueryHandler : IRequestHandler<NotificationGetByIdQuery, NotificationGetByIdResponse>
    {
        public Task<NotificationGetByIdResponse> Handle(NotificationGetByIdQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
