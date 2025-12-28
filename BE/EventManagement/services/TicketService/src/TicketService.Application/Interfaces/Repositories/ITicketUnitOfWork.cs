using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Domain.Entities;

namespace TicketService.Application.Interfaces.Repositories
{
    public interface ITicketUnitOfWork : IUnitOfWork
    {
        IGenericRepository<TicketType> TicketTypes { get; }
        IGenericRepository<Ticket> Tickets { get; }
        IGenericRepository<Seat> Seats { get; }
    }
}
