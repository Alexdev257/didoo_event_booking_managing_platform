using Microsoft.AspNetCore.SignalR;
using TicketService.Api.Hubs;
using TicketService.Application.Interfaces.SignalRServices;

namespace TicketService.Api.SignalRServices
{
    public class TicketHubService : ITicketHubService
    {
        private readonly IHubContext<TicketHub> _hubContext;
        public TicketHubService(IHubContext<TicketHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task SendTicketUpdate(string eventId, Guid ticketTypeId, int remainingCount)
        {
            await _hubContext.Clients.Group(eventId)
                .SendAsync("ReceiveZoneUpdate", new
                {
                    TicketTypeId = ticketTypeId,
                    RemainingCount = remainingCount
                });
        }
    }
}
