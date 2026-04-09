using MassTransit;
using Microsoft.Extensions.Logging;
using OperationService.Application.Interfaces.SignalRServices;
using OperationService.Application.Interfaces.Repositories;
using OperationService.Domain.Entities;
using OperationService.Domain.Enum;
using SharedContracts.Events;
using System.Threading.Tasks;

namespace OperationService.Infrastructure.MessageConsumers
{
    public class OrganizerVerifiedEventConsumer : IConsumer<OrganizerVerifiedNotificationEvent>
    {
        private readonly IOperationUnitOfWork _unitOfWork;
        private readonly INotificationHubService _notificationHubService;
        private readonly ILogger<OrganizerVerifiedEventConsumer> _logger;

        public OrganizerVerifiedEventConsumer(
            IOperationUnitOfWork unitOfWork,
            INotificationHubService notificationHubService,
            ILogger<OrganizerVerifiedEventConsumer> logger)
        {
            _unitOfWork = unitOfWork;
            _notificationHubService = notificationHubService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<OrganizerVerifiedNotificationEvent> context)
        {
            var evt = context.Message;
            _logger.LogInformation("Consuming OrganizerVerifiedNotificationEvent for OrganizerId: {OrganizerId}", evt.OrganizerId);

            var title = "Tài khoản ban tổ chức đã được xác thực";
            var message = $"Xin chúc mừng! Tài khoản ban tổ chức \"{evt.OrganizerName}\" của bạn đã được quản trị viên duyệt thành công. Bạn có thể bắt đầu tạo sự kiện.";

            var notification = new Notification
            {
                UserId = evt.UserId,
                Title = title,
                Message = message,
                Type = NotificationTypeEnum.OrganizerVerify,
                RelatedId = evt.OrganizerId,
                IsRead = false
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            await _notificationHubService.SendNotificationAsync(evt.UserId, title, message, NotificationTypeEnum.OrganizerVerify.ToString(), evt.OrganizerId);
        }
    }
}
