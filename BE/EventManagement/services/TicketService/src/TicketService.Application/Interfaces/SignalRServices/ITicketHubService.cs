using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Application.Interfaces.SignalRServices
{
    public interface ITicketHubService
    {
        Task SendTicketUpdate(string eventId, Guid ticketTypeId, int remainingCount);
    }
}
