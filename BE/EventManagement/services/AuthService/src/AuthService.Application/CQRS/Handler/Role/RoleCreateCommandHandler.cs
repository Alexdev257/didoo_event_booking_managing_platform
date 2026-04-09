using AuthService.Application.CQRS.Command.Role;
using AuthService.Application.DTOs.Response.Role;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.Role
{
    public class RoleCreateCommandHandler : IRequestHandler<RoleCreateCommand, RoleCreateResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public RoleCreateCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<RoleCreateResponse> Handle(RoleCreateCommand request, CancellationToken cancellationToken)
        {
            var role = await _unitOfWork.Roles.GetAllAsync().Where(x => x.Name == request.Name).FirstOrDefaultAsync();
            if(role != null)
            {
                return new RoleCreateResponse
                {
                    IsSuccess = false,
                    Message = "Role is existed",
                    Data = null,
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                await _unitOfWork.Roles.AddAsync(new Domain.Entities.Role
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    CreatedAt = DateTime.Now,
                    Status = Domain.Enum.StatusEnum.Active,
                });
                await _unitOfWork.CommitTransactionAsync();
                return new RoleCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create role successfully",
                    Data = null,
                };
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new RoleCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
