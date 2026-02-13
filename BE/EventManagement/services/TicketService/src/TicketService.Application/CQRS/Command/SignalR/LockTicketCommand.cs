using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Application.CQRS.Command.SignalR
{
    public class LockTicketCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }       
        public Guid EventId { get; set; }      
        public Guid TicketTypeId { get; set; } 
        public int Quantity { get; set; } = 1; 
    }
}
