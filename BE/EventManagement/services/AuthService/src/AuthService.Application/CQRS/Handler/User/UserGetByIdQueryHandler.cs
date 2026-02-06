using AuthService.Application.CQRS.Query.User;
using AuthService.Application.DTOs.Response.User;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.User
{
    public class UserGetByIdQueryHandler : IRequestHandler<UserGetByIdQuery, UserGetByIdResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public UserGetByIdQueryHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserGetByIdResponse> Handle(UserGetByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).Include(x => x.Locations).FirstOrDefaultAsync(x => x.Id == request.Id);
                if (user == null)
                {
                    return new UserGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "User not found",
                        Data = null
                    };
                }
                if (user.IsDeleted)
                {
                    return new UserGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "User is deleted",
                        Data = null
                    };
                }
                
                var dto = new UserDTO
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
                        CreatedAt = user.Role.CreatedAt,
                        Status = user.Role.Status.ToString(),
                    },
                    OrganizerId = user.OrganizerId,
                    Locations = request.HasLocation!.Value ? user.Locations.Select(loc => new DTOs.Response.User.LocationUserDTO
                    {
                        Longitude = loc.Longitude!.Value,
                        Latitude = loc.Latitude!.Value,
                        CreatedAt = loc.CreatedAt,
                    }).ToList() : new List<LocationUserDTO>(),
                };
                var shapedData = DataShaper.ShapeData(dto, request.Fields);
                return new UserGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "User found",
                    Data = shapedData,
                };
            }
            catch (Exception ex)
            {
                return new UserGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
