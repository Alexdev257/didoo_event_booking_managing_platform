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
    public class BookingSuccessEventConsumer : IConsumer<BookingSuccessNotificationEvent>
    {
        private readonly IOperationUnitOfWork _unitOfWork;
        private readonly INotificationHubService _notificationHubService;
        private readonly ILogger<BookingSuccessEventConsumer> _logger;

        public BookingSuccessEventConsumer(
            IOperationUnitOfWork unitOfWork,
            INotificationHubService notificationHubService,
            ILogger<BookingSuccessEventConsumer> logger)
        {
            _unitOfWork = unitOfWork;
            _notificationHubService = notificationHubService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<BookingSuccessNotificationEvent> context)
        {
            var evt = context.Message;
            _logger.LogInformation("Consuming BookingSuccessNotificationEvent for BookingId: {BookingId}", evt.BookingId);

            var title = "Thanh toán vé thành công";
            var message = $"Bạn đã thanh toán thành công cho sự kiện \"{evt.EventName}\". Mã giao dịch: {evt.BookingId}. Vui lòng kiểm tra email hoặc mục Vé Của Tôi.";

            var notification = new Notification
            {
                UserId = evt.UserId,
                EventId = evt.EventId,
                Title = title,
                Message = message,
                Type = NotificationTypeEnum.BookingSuccess,
                RelatedId = evt.BookingId,
                IsRead = false
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            await _notificationHubService.SendNotificationAsync(evt.UserId, title, message, NotificationTypeEnum.BookingSuccess.ToString(), evt.BookingId);
        }
    }
}
