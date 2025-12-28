using PaymentService.Domain.Entities;
using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PaymentService.Application.Interfaces.Repositories
{
    public interface IPaymentUnitOfWork : IUnitOfWork
    {
        public IGenericRepository<Payment> Payments { get; }
        public IGenericRepository<PaymentMethod> PaymentMethods { get; }
    }
}
