using Microsoft.AspNetCore.SignalR;
using OperationService.Api.Hubs;
using OperationService.Application.Interfaces.SignalRServices;
using System;
using System.Threading.Tasks;

namespace OperationService.Api.SignalRServices
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationHubService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(Guid userId, string title, string message, string type, Guid? relatedId)
        {
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                Title = title,
                Message = message,
                Type = type,
                RelatedId = relatedId,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
