using AuthService.Application.Interfaces.Repositories;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.Consumers
{
    public class OrganizerCreatedConsumer : IConsumer<OrganizerCreatedEvent>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public OrganizerCreatedConsumer(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task Consume(ConsumeContext<OrganizerCreatedEvent> context)
        {
            var msg = context.Message;

            var user = await _unitOfWork.Users.GetAllAsync()
                                  .FirstOrDefaultAsync(u => u.Id == msg.userId);

            if (user != null)
            {
                await _unitOfWork.BeginTransactionAsync();
                try
                {
                    user.OrganizerId = msg.organizerId;
                    _unitOfWork.Users.UpdateAsync(user);
                    await _unitOfWork.CommitTransactionAsync();
                }
                catch (Exception ex)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw;
                }
            }
        }
    }
}
