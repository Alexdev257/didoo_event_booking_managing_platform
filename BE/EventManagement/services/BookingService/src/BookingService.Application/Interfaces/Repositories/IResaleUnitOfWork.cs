using BookingService.Domain.Entities;
using SharedKernel.Interfaces;

namespace BookingService.Application.Interfaces.Repositories
{
    public interface IResaleUnitOfWork : IUnitOfWork
    {
        IGenericRepository<Resale> Resales { get; }
        IGenericRepository<ResaleTransaction> ResaleTransactions { get; }
    }
}
