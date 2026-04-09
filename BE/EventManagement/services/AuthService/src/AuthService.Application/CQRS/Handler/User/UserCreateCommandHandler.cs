using AuthService.Application.CQRS.Command.User;
using AuthService.Application.DTOs.Response.User;
using AuthService.Application.Interfaces.Helpers;
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
    public class UserCreateCommandHandler : IRequestHandler<UserCreateCommand, UserCreateResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly IBcryptHelper _bcryptHelper;
        public UserCreateCommandHandler(IAuthUnitOfWork unitOfWork, IBcryptHelper bcryptHelper)
        {
            _unitOfWork = unitOfWork;
            _bcryptHelper = bcryptHelper;
        }

        public async Task<UserCreateResponse> Handle(UserCreateCommand request, CancellationToken cancellationToken)
        {
            var checkEmail = _unitOfWork.Users.GetAllAsync().FirstOrDefault(x => x.Email == request.Email);
            if(checkEmail != null)
            {
                return new UserCreateResponse
                {
                    IsSuccess = false,
                    Message = "Email is already existed!"
                };
            }

            var checkPhone = _unitOfWork.Users.GetAllAsync().FirstOrDefault(x => x.Phone == request.Phone);
            if(checkPhone != null)
            {
                return new UserCreateResponse
                {
                    IsSuccess = false,
                    Message = "Phone number is already existed!"
                };
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var role = await _unitOfWork.Roles.GetAllAsync().Where(x => x.Name == request.RoleName).FirstOrDefaultAsync();
                var user = new Domain.Entities.User
                {
                    Id = Guid.NewGuid(),
                    FullName = request.FullName,
                    Email = request.Email,
                    Phone = request.Phone,
                    Password = _bcryptHelper.HashPassword(request.Password), 
                    AvatarUrl = request.AvatarUrl,
                    Gender = request.Gender,
                    DateOfBirth = request.DateOfBirth,
                    Address = request.Address,
                    Status = request.Status,
                    RoleId = role.Id,
                    OrganizerId = request.OrganizerId != null ? Guid.Parse(request.OrganizerId) : null,
                    CreatedAt = DateTime.Now
                };

                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.CommitTransactionAsync();

                return new UserCreateResponse
                {
                    IsSuccess = true,
                    Message = "User created successfully",
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
                        Role =  new DTOs.Response.Role.RoleDTO
                        {
                            Id = role.Id.ToString(),
                            Name = role.Name.ToString(),
                            Status = role.Status.ToString(),
                            CreatedAt = role.CreatedAt
                        },
                        OrganizerId = user.OrganizerId
                    }
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                //throw;
                return new UserCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
