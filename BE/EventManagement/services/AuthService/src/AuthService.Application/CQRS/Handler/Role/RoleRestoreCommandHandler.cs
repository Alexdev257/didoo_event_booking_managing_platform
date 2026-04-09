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
    public class RoleRestoreCommandHandler : IRequestHandler<RoleRestoreCommand, RoleRestoreResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public RoleRestoreCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<RoleRestoreResponse> Handle(RoleRestoreCommand request, CancellationToken cancellationToken)
        {
            if (!Guid.TryParse(request.Id, out Guid roleId))
            {
                return new RoleRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Invalid role id",
                    Data = null,
                };
            }
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
            if (role == null)
            {
                return new RoleRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Role not found",
                    Data = null,
                };
            }

            if (!role.IsDeleted)
            {
                return new RoleRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Role is not deleted",
                    Data = null,
                };
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                role.IsDeleted = false;
                role.DeletedAt = null;
                role.Status = Domain.Enum.StatusEnum.Active;
                _unitOfWork.Roles.UpdateAsync(role);
                await _unitOfWork.CommitTransactionAsync();
                return new RoleRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Delete role successfully",
                    Data = null,
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new RoleRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
