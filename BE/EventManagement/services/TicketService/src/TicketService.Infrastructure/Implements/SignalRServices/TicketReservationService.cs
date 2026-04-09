using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Application.Interfaces.SignalRServices;

namespace TicketService.Infrastructure.Implements.SignalRServices
{
    public class TicketReservationService : ITicketReservationService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        // Tracks ConnectionId -> (TicketTypeId -> (EventId, QuantityHeld))
        private readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, (Guid EventId, int Quantity)>> _connectionReservations = new();

        // Tracks EventId -> HashSet<string> (ConnectionIds viewing/holding tickets for this event)
        // Helps to notify all users on the same event when someone disconnects.
        private readonly ConcurrentDictionary<Guid, HashSet<string>> _eventConnections = new();

        // In-memory cache of the latest "known" AvailableQuantity from DB minus all current temporary holds.
        // Cache: TicketTypeId -> CurrentAvailableQuantity
        private readonly ConcurrentDictionary<Guid, int> _ticketTypeAvailability = new();

        // Lock object for thread-safe operations on specific ticket types
        private readonly ConcurrentDictionary<Guid, SemaphoreSlim> _ticketTypeLocks = new();
        private readonly SemaphoreSlim _connectionLock = new(1, 1);


        public TicketReservationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        private SemaphoreSlim GetLock(Guid ticketTypeId)
        {
            return _ticketTypeLocks.GetOrAdd(ticketTypeId, _ => new SemaphoreSlim(1, 1));
        }

        public async Task<(bool IsSuccess, int CurrentAvailable)> TryReserveTicketAsync(string connectionId, Guid eventId, Guid ticketTypeId, int quantityChange)
        {
            var typeLock = GetLock(ticketTypeId);
            await typeLock.WaitAsync();

            try
            {
                // Ensure we know the base stock from DB if this is the first time
                if (!_ticketTypeAvailability.TryGetValue(ticketTypeId, out int currentAvailableDb))
                {
                    using var scope = _scopeFactory.CreateScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<ITicketUnitOfWork>();
                    

                    // // We calculate available by finding total tickets with status Available
                    // var availableInDb = await unitOfWork.Tickets
                    //     .GetAllAsync()
                    //     .CountAsync(x => x.TicketTypeId == ticketTypeId && x.Status == Domain.Enum.TicketStatusEnum.Available);
                    // Get AvailableQuantity from TicketType instead of counting physical tickets
                    var ticketType = await unitOfWork.TicketTypes.GetByIdAsync(ticketTypeId);
                    var availableInDb = ticketType?.AvailableQuantity ?? 0;
                        
                    currentAvailableDb = availableInDb;
                    _ticketTypeAvailability[ticketTypeId] = currentAvailableDb;
                }
                else
                {
                    currentAvailableDb = _ticketTypeAvailability[ticketTypeId];
                }

                // If asking to hold more tickets
                if (quantityChange > 0)
                {
                    if (currentAvailableDb < quantityChange)
                    {
                        // Not enough stock
                        return (false, currentAvailableDb);
                    }
                }

                // Make the change
                int newAvailable = currentAvailableDb - quantityChange;
                
                // Prevent going negative when releasing (if clients send bad data)
                // Wait, if releasing, quantityChange is negative, so newAvailable goes UP.
                // We should ensure they aren't releasing more than they held!
                var userHolds = _connectionReservations.GetOrAdd(connectionId, _ => new ConcurrentDictionary<Guid, (Guid EventId, int Quantity)>());
                var currentHoldInfo = userHolds.GetValueOrDefault(ticketTypeId, (EventId: eventId, Quantity: 0));
                int currentlyHeld = currentHoldInfo.Quantity;

                if (quantityChange < 0 && Math.Abs(quantityChange) > currentlyHeld)
                {
                    // Can't release more than held
                    return (false, currentAvailableDb);
                }

                // Commit the changes to memory
                _ticketTypeAvailability[ticketTypeId] = newAvailable;
                
                int newHeld = currentlyHeld + quantityChange;
                if (newHeld == 0)
                {
                    userHolds.TryRemove(ticketTypeId, out _);
                }
                else
                {
                    userHolds[ticketTypeId] = (EventId: eventId, Quantity: newHeld);
                }

                // Track the event connection to know which events to broadcast to on disconnect
                await _connectionLock.WaitAsync();
                try
                {
                    var conns = _eventConnections.GetOrAdd(eventId, _ => new HashSet<string>());
                    conns.Add(connectionId);
                }
                finally
                {
                    _connectionLock.Release();
                }

                return (true, newAvailable);
            }
            finally
            {
                typeLock.Release();
            }
        }

        public async Task<List<(Guid EventId, Guid TicketTypeId, int NewAvailable)>> ReleaseAllReservationsAsync(string connectionId)
        {
            var broadcastUpdates = new List<(Guid EventId, Guid TicketTypeId, int NewAvailable)>();

            if (_connectionReservations.TryRemove(connectionId, out var userHolds))
            {
                foreach (var hold in userHolds)
                {
                    var ticketTypeId = hold.Key;
                    var eventId = hold.Value.EventId;
                    var quantityHeld = hold.Value.Quantity;

                    if (quantityHeld > 0)
                    {
                        var typeLock = GetLock(ticketTypeId);
                        await typeLock.WaitAsync();
                        try
                        {
                            if (_ticketTypeAvailability.TryGetValue(ticketTypeId, out int currentAvailable))
                            {
                                // Return the held quantity back to the pool
                                var newAvailable = currentAvailable + quantityHeld;
                                _ticketTypeAvailability[ticketTypeId] = newAvailable;
                                broadcastUpdates.Add((eventId, ticketTypeId, newAvailable));
                            }
                        }
                        finally
                        {
                            typeLock.Release();
                        }
                    }
                }

                await _connectionLock.WaitAsync();
                try
                {
                    // Find which events this connection belonged to
                    var eventsWithConnection = _eventConnections.Where(x => x.Value.Contains(connectionId)).ToList();
                    foreach (var evt in eventsWithConnection)
                    {
                        evt.Value.Remove(connectionId);
                    }
                }
                finally
                {
                    _connectionLock.Release();
                }
            }

            return broadcastUpdates;
        }

        public async Task<int> GetCurrentAvailableQuantityAsync(Guid ticketTypeId)
        {
            var typeLock = GetLock(ticketTypeId);
            await typeLock.WaitAsync();
            try
            {
                if (_ticketTypeAvailability.TryGetValue(ticketTypeId, out int currentAvailable))
                {
                    return currentAvailable;
                }

                // Not in memory, check DB
                using var scope = _scopeFactory.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<ITicketUnitOfWork>();
                var ticketType = await unitOfWork.TicketTypes.GetByIdAsync(ticketTypeId);
                var availableInDb = ticketType?.AvailableQuantity ?? 0;
                
                _ticketTypeAvailability[ticketTypeId] = availableInDb;
                return availableInDb;
            }
            finally
            {
                typeLock.Release();
            }
        }
    }
}
