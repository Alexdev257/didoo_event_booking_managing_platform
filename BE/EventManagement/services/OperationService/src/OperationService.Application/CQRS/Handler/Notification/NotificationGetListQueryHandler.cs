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
    public class NotificationGetListQueryHandler : IRequestHandler<NotificationGetListQuery, NotificationGetListResponse>
    {
        public Task<NotificationGetListResponse> Handle(NotificationGetListQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
