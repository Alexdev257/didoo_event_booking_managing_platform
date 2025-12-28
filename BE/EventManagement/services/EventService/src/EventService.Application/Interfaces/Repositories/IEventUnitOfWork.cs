using EventService.Domain.Entities;
using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.Interfaces.Repositories
{
    public interface IEventUnitOfWork : IUnitOfWork
    {
        IGenericRepository<Category> Categories { get; }
        IGenericRepository<Event> Events { get; }
        IGenericRepository<EventLocaltion> EventLocaltions { get; }
        IGenericRepository<EventReview> EventReviews { get; }
        IGenericRepository<FavoriteEvent> FavoriteEvents { get; }
        IGenericRepository<Organizer> Organizers { get; }
        IGenericRepository<UserEventInteraction> UserEventInteractions { get; }

    }
}
