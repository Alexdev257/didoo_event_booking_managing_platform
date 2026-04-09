using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using TicketService.Application.Interfaces.SignalRServices;

namespace TicketService.Api.Hubs
{
    public class TicketHub : Hub
    {
        private readonly ITicketReservationService _reservationService;
        private readonly ITicketHubService _ticketHubService;

        public TicketHub(ITicketReservationService reservationService, ITicketHubService ticketHubService)
        {
            _reservationService = reservationService;
            _ticketHubService = ticketHubService;
        }

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

        public async Task SelectTicket(string eventId, string ticketTypeId, int quantityChange)
        {
            if (Guid.TryParse(eventId, out Guid eId) && Guid.TryParse(ticketTypeId, out Guid tId))
            {
                var result = await _reservationService.TryReserveTicketAsync(Context.ConnectionId, eId, tId, quantityChange);
                if (result.IsSuccess)
                {
                    Console.WriteLine($"--> Connection {Context.ConnectionId} updated ticket {ticketTypeId} by {quantityChange}. New Available: {result.CurrentAvailable}");
                    // Broadcast the new available quantity to everyone in the event group
                    await _ticketHubService.SendTicketUpdate(eventId, tId, result.CurrentAvailable);
                }
                else
                {
                    // Optionally notify the caller that it failed
                    await Clients.Caller.SendAsync("ReceiveTicketUpdateFailed", ticketTypeId, "Not enough tickets available or invalid quantity");
                }
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Release all reservations this connection was holding
            var restoredTickets = await _reservationService.ReleaseAllReservationsAsync(Context.ConnectionId);

            foreach (var update in restoredTickets)
            {
                Console.WriteLine($"--> Connection {Context.ConnectionId} disconnected. Restored ticket {update.TicketTypeId}. New Available: {update.NewAvailable}");
                await _ticketHubService.SendTicketUpdate(update.EventId.ToString(), update.TicketTypeId, update.NewAvailable);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
