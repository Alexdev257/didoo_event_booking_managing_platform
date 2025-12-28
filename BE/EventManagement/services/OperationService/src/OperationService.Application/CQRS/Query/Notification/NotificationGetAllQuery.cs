using MediatR;
using OperationService.Application.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Query.Notification
{
    public class NotificationGetAllQuery : IRequest<GetAllNotificationResponse>
    {
    }
}
