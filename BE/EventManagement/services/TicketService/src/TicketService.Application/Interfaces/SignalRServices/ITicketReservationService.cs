using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TicketService.Application.Interfaces.SignalRServices
{
    public interface ITicketReservationService
    {
        /// <summary>
        /// Attempts to reserve or release a quantity of tickets for a specific connection.
        /// Positive quantityChange means selecting (holding) tickets.
        /// Negative quantityChange means deselecting (releasing) tickets.
        /// </summary>
        /// <returns>True if the operation was successful (e.g., enough stock), along with the new AvailableQuantity to broadcast.</returns>
        Task<(bool IsSuccess, int CurrentAvailable)> TryReserveTicketAsync(string connectionId, Guid eventId, Guid ticketTypeId, int quantityChange);

        /// <summary>
        /// Releases all tickets currently held by a specific connection ID (e.g., when the user disconnects).
        /// </summary>
        /// <returns>A list of (EventId, TicketTypeId, NewAvailable) to broadcast to other clients.</returns>
        Task<List<(Guid EventId, Guid TicketTypeId, int NewAvailable)>> ReleaseAllReservationsAsync(string connectionId);

        /// <summary>
        /// Gets the current adjusted available quantity for a ticket type, accounting for all temporary holds.
        /// </summary>
        Task<int> GetCurrentAvailableQuantityAsync(Guid ticketTypeId);
    }
}
