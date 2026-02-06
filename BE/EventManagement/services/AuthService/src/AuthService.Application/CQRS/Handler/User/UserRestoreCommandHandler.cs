using AuthService.Application.CQRS.Command.User;
using AuthService.Application.DTOs.Response.User;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.User
{
    public class UserRestoreCommandHandler : IRequestHandler<UserRestoreCommand, UserRestoreResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public UserRestoreCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserRestoreResponse> Handle(UserRestoreCommand request, CancellationToken cancellationToken)
        {
            try
            {
                //var user = await _unitOfWork.Users.GetByIdAsync(request.Id);
                var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).Include(x => x.Locations).FirstOrDefaultAsync(x => x.Id == request.Id);
                if (user == null)
                {
                    return new UserRestoreResponse
                    {
                        IsSuccess = false,
                        Message = "User not found",
                        Data = null
                    };
                }

                if (!user.IsDeleted)
                {
                    return new UserRestoreResponse
                    {
                        IsSuccess = false,
                        Message = "User is not deleted",
                        Data = null
                    };
                }

                user.Status = Domain.Enum.StatusEnum.Active; 
                user.IsDeleted = false;
                user.DeletedAt = null;
                _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CommitTransactionAsync();

                return new UserRestoreResponse
                {
                    IsSuccess = true,
                    Message = "User restored successfully",
                    Data = new UserDTO
                    {
                        Id = user.Id.ToString(),
                        FullName = user.FullName,
                        Email = user.Email,
                        Phone = user.Phone,
                        IsVerified = user.IsVerified,
                        AvatarUrl = user.AvatarUrl,
                        Gender = user.Gender,
                        DateOfBirth = user.DateOfBirth,
                        Address = user.Address,
                        Status = user.Status,
                        Role = new DTOs.Response.Role.RoleDTO
                        {
                            Id = user.Role.Id.ToString(),
                            Name = user.Role.Name.ToString(),
                            Status = user.Role.Status.ToString(),
                            CreatedAt = user.Role.CreatedAt
                        },
                        OrganizerId = user.OrganizerId
                    }
                };
            }
            catch (Exception ex)
            {
                return new UserRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
