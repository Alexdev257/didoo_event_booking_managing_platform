using MediatR;
using Microsoft.EntityFrameworkCore;
using OperationService.Application.CQRS.Query.Notification;
using OperationService.Application.DTOs.Response;
using OperationService.Application.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Handler.Notification
{
    public class NotificationGetAllQueryHandler : IRequestHandler<NotificationGetAllQuery, GetAllNotificationResponse>
    {
        private readonly IOperationUnitOfWork _unitOfWork;
        public NotificationGetAllQueryHandler(IOperationUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<GetAllNotificationResponse> Handle(NotificationGetAllQuery request, CancellationToken cancellationToken)
        {
            var result = _unitOfWork.Notifications.GetAllAsync();
            var dto = await result.Select(d => new NotificationDTO
            {
                Id = d.Id.ToString(),
                UserId = d.UserId.ToString(),
                EventId = d.EventId.ToString(),
                Message = d.Message,
                Title = d.Title,
                IsRead = d.IsRead.Value,
            }).ToListAsync();

            return new GetAllNotificationResponse
            {
                IsSuccess = true,
                Message = "Notification Retrieve successfully",
                Data = dto
            };
        }
    }
}
