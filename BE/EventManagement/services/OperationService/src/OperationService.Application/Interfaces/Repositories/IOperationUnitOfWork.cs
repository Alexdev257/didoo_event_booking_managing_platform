using OperationService.Domain.Entities;
using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.Interfaces.Repositories
{
    public interface IOperationUnitOfWork : IUnitOfWork
    {
        IGenericRepository<EventCheckIn> EventCheckIns {  get; }
        IGenericRepository<Notification> Notifications {  get; }
    }
}
