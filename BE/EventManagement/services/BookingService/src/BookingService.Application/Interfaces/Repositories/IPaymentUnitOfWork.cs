using BookingService.Domain.Entities;
using SharedKernel.Interfaces;

namespace BookingService.Application.Interfaces.Repositories
{
    public interface IPaymentUnitOfWork : IUnitOfWork
    {
        IGenericRepository<Payment> Payments { get; }
        IGenericRepository<PaymentMethod> PaymentMethods { get; }
    }
}
