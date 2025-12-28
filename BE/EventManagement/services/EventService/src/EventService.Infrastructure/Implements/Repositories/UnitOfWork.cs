using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using EventService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SharedInfrastructure.Persistence.Repositories;
using SharedKernel.Interfaces;

namespace EventService.Infrastructure.Implements.Repositories
{
    public class UnitOfWork : IEventUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _currentTransaction;
        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }
        public IGenericRepository<Category> Categories => new GenericRepository<Category>(_context);

        public IGenericRepository<Event> Events => new GenericRepository<Event>(_context);

        public IGenericRepository<EventLocaltion> EventLocaltions => new GenericRepository<EventLocaltion>(_context);

        public IGenericRepository<EventReview> EventReviews => new GenericRepository<EventReview>(_context);

        public IGenericRepository<FavoriteEvent> FavoriteEvents => new GenericRepository<FavoriteEvent>(_context);

        public IGenericRepository<Organizer> Organizers => new GenericRepository<Organizer>(_context);

        public IGenericRepository<UserEventInteraction> UserEventInteractions => new GenericRepository<UserEventInteraction>(_context);

        public async Task BeginTransactionAsync()
        {
            if (_currentTransaction != null)
            {
                return; // ?ã có transaction ?ang ch?y thì không t?o m?i
            }

            _currentTransaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                // Luôn SaveChanges tr??c khi Commit
                await _context.SaveChangesAsync();

                if (_currentTransaction != null)
                {
                    await _currentTransaction.CommitAsync();
                }
            }
            catch
            {
                await RollbackTransactionAsync();
                throw; // Ném l?i ra ?? Middleware x? lý
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.DisposeAsync();
                    _currentTransaction = null;
                }
            }
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.RollbackAsync();
                }
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.DisposeAsync();
                    _currentTransaction = null;
                }
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}