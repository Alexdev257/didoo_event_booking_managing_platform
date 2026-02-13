using MediatR;
using ResaleService.Domain.Entities;
using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResaleService.Application.Interfaces.Repositories
{
    public interface IResaleUnitOfWork : IUnitOfWork
    {
        IGenericRepository<Resale> Resales { get; }
        IGenericRepository<ResaleTransaction> ResaleTransactions { get; }
    }
}
