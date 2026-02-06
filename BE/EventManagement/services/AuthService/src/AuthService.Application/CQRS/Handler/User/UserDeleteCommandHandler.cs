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
    public class UserDeleteCommandHandler : IRequestHandler<UserDeleteCommand, UserDeleteResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public UserDeleteCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserDeleteResponse> Handle(UserDeleteCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                //var user = await _unitOfWork.Users.GetByIdAsync(request.Id);
                var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).Include(x => x.Locations).FirstOrDefaultAsync(x => x.Id == request.Id);
                if (user == null)
                {
                    return new UserDeleteResponse
                    {
                        IsSuccess = false,
                        Message = "User not found",
                        Data = null
                    };
                }

                if (user.IsDeleted)
                {
                    return new UserDeleteResponse
                    {
                        IsSuccess = false,
                        Message = "User already deleted",
                        Data = null
                    };
                }

                _unitOfWork.Users.DeleteAsync(user);
                await _unitOfWork.CommitTransactionAsync();

                return new UserDeleteResponse
                {
                    IsSuccess = true,
                    Message = "User deleted successfully",
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
                            Id = user.RoleId.ToString(),
                            Name = user.Role.Name.ToString(),
                            Status = user.Role.Status.ToString(),
                            CreatedAt = user.Role.CreatedAt,
                        },
                        OrganizerId = user.OrganizerId
                    }
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new UserDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
