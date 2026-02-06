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
    public class UserUpdateCommandHandler : IRequestHandler<UserUpdateCommand, UserUpdateResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public UserUpdateCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserUpdateResponse> Handle(UserUpdateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(request.Id);
                if (user == null)
                {
                    return new UserUpdateResponse
                    {
                        IsSuccess = false,
                        Message = "User not found",
                        Data = null
                    };
                }
                var role = await _unitOfWork.Roles.GetAllAsync().Where(x => x.Name == request.RoleName).FirstOrDefaultAsync();

                user.FullName = request.FullName;
                user.Phone = request.Phone;
                user.AvatarUrl = request.AvatarUrl;
                user.Gender = request.Gender;
                user.DateOfBirth = request.DateOfBirth;
                user.Address = request.Address;
                user.Status = request.Status;
                user.RoleId = role.Id;
                user.OrganizerId = request.OrganizerId != null ? Guid.Parse(request.OrganizerId) : null;
                user.UpdatedAt = DateTime.Now;

                _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CommitTransactionAsync();

                return new UserUpdateResponse
                {
                    IsSuccess = true,
                    Message = "User updated successfully",
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
                            Id = role.Id.ToString(),
                            Name = role.Name.ToString(),
                            CreatedAt = role.CreatedAt,
                            Status = role.Status.ToString(),
                        },
                        OrganizerId = user.OrganizerId
                    }
                };
            }
            catch (Exception ex)
            {
                return new UserUpdateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
