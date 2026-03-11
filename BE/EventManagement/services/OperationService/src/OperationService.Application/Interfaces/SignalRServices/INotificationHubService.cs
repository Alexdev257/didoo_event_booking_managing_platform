using System;
using System.Threading.Tasks;

namespace OperationService.Application.Interfaces.SignalRServices
{
    public interface INotificationHubService
    {
        Task SendNotificationAsync(Guid userId, string title, string message, string type, Guid? relatedId);
    }
}
