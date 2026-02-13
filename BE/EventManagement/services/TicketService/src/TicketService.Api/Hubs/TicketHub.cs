using Microsoft.AspNetCore.SignalR;

namespace TicketService.Api.Hubs
{
    public class TicketHub : Hub
    {
        public async Task JoinEventGroup(string eventId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
            Console.WriteLine($"--> Connection {Context.ConnectionId} joined event group: {eventId}");
        }

        public async Task LeaveEventGroup(string eventId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, eventId);
            Console.WriteLine($"--> Connection {Context.ConnectionId} left event group: {eventId}");
        }
    }
}
