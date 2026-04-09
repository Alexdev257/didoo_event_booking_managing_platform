using AuthService.Application.CQRS.Command.Role;
using AuthService.Application.DTOs.Response.Role;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.Role
{
    public class RoleDeleteCommandHandler : IRequestHandler<RoleDeleteCommand, RoleDeleteResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public RoleDeleteCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<RoleDeleteResponse> Handle(RoleDeleteCommand request, CancellationToken cancellationToken)
        {
            if(!Guid.TryParse(request.Id, out Guid roleId))
            {
                return new RoleDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Invalid role id",
                    Data = null,
                };
            }
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
            if (role == null || role.IsDeleted)
            {
                return new RoleDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Role not found",
                    Data = null,
                };
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                role.Status = Domain.Enum.StatusEnum.Inactive;
                _unitOfWork.Roles.UpdateAsync(role);
                _unitOfWork.Roles.DeleteAsync(role);
                await _unitOfWork.CommitTransactionAsync();
                return new RoleDeleteResponse
                {
                    IsSuccess = true,
                    Message = "Delete role successfully",
                    Data = null,
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new RoleDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
