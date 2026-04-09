using MediatR;
using OperationService.Application.CQRS.Command.Notification;
using OperationService.Application.DTOs.Response.Notification;
using OperationService.Application.Interfaces.Repositories;

namespace OperationService.Application.CQRS.Handler.Notification
{
    public class NotificationMarkAsReadCommandHandler : IRequestHandler<NotificationMarkAsReadCommand, NotificationMarkAsReadResponse>
    {
        private readonly IOperationUnitOfWork _unitOfWork;

        public NotificationMarkAsReadCommandHandler(IOperationUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<NotificationMarkAsReadResponse> Handle(NotificationMarkAsReadCommand request, CancellationToken cancellationToken)
        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(request.Id);
            if (notification == null || notification.IsDeleted)
            {
                return new NotificationMarkAsReadResponse
                {
                    IsSuccess = false,
                    Message = "Notification not found"
                };
            }

            notification.IsRead = true;
            _unitOfWork.Notifications.UpdateAsync(notification);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new NotificationMarkAsReadResponse
            {
                IsSuccess = true,
                Message = "Notification marked as read",
                Data = new NotificationDTO
                {
                    Id = notification.Id.ToString(),
                    Title = notification.Title,
                    Message = notification.Message,
                    IsRead = notification.IsRead ?? false,
                }
            };
        }
    }
}
