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
    public class TicketResaleSuccessEventConsumer : IConsumer<TicketResaleSuccessNotificationEvent>
    {
        private readonly IOperationUnitOfWork _unitOfWork;
        private readonly INotificationHubService _notificationHubService;
        private readonly ILogger<TicketResaleSuccessEventConsumer> _logger;

        public TicketResaleSuccessEventConsumer(
            IOperationUnitOfWork unitOfWork,
            INotificationHubService notificationHubService,
            ILogger<TicketResaleSuccessEventConsumer> logger)
        {
            _unitOfWork = unitOfWork;
            _notificationHubService = notificationHubService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<TicketResaleSuccessNotificationEvent> context)
        {
            var evt = context.Message;
            _logger.LogInformation("Consuming TicketResaleSuccessNotificationEvent for ResaleId: {ResaleId}", evt.ResaleId);

            // Notify Seller
            var sellerTitle = "Vé nhượng lại của bạn đã được bán";
            var sellerMessage = $"Chúc mừng! Có người đã mua vé nhượng lại của bạn cho sự kiện \"{evt.EventName}\" với giá {evt.SoldPrice:N0}đ. Tiền sẽ được cộng vào ví của bạn trong vòng 24 giờ.";

            var sellerNotification = new Notification
            {
                UserId = evt.SellerUserId,
                EventId = evt.EventId,
                Title = sellerTitle,
                Message = sellerMessage,
                Type = NotificationTypeEnum.ResaleSuccess,
                RelatedId = evt.ResaleId,
                IsRead = false
            };

            await _unitOfWork.Notifications.AddAsync(sellerNotification);

            // Notify Buyer
            var buyerTitle = "Mua vé nhượng thành công";
            var buyerMessage = $"Bạn đã thanh toán thành công mua vé nhượng lại cho sự kiện \"{evt.EventName}\". Vui lòng kiểm tra email hoặc mục Vé Của Tôi.";

            var buyerNotification = new Notification
            {
                UserId = evt.BuyerUserId,
                EventId = evt.EventId,
                Title = buyerTitle,
                Message = buyerMessage,
                Type = NotificationTypeEnum.ResaleSuccess,
                RelatedId = evt.ResaleId,
                IsRead = false
            };

            await _unitOfWork.Notifications.AddAsync(buyerNotification);

            await _unitOfWork.SaveChangesAsync();

            await _notificationHubService.SendNotificationAsync(evt.SellerUserId, sellerTitle, sellerMessage, NotificationTypeEnum.ResaleSuccess.ToString(), evt.ResaleId);
            await _notificationHubService.SendNotificationAsync(evt.BuyerUserId, buyerTitle, buyerMessage, NotificationTypeEnum.ResaleSuccess.ToString(), evt.ResaleId);
        }
    }
}
