using AuthService.Application.CQRS.Query.User;
using AuthService.Application.DTOs.Response.User;
using AuthService.Application.Interfaces.Repositories;
using AuthService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Common.Wrappers;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.User
{
    public class UserGetListQueryHandler : IRequestHandler<UserGetListQuery, UserGetListResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public UserGetListQueryHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserGetListResponse> Handle(UserGetListQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var users = _unitOfWork.Users.GetAllAsync().Include(x => x.Role).Include(x => x.Locations).Where(x => !x.IsDeleted);
                if (!string.IsNullOrWhiteSpace(request.FullName))
                {
                    users = users.Where(x =>
                        x.FullName.ToLower().Contains(request.FullName.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(request.Email))
                {
                    users = users.Where(x =>
                        x.Email.ToLower().Contains(request.Email.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(request.Phone))
                {
                    users = users.Where(x =>
                        x.Phone != null && x.Phone.Contains(request.Phone));
                }

                if (request.IsVerified.HasValue)
                {
                    users = users.Where(x => x.IsVerified == request.IsVerified.Value);
                }

                var isDescending = request.IsDescending ?? false;

                users = isDescending
                    ? users.OrderByDescending(x => x.CreatedAt)
                    : users.OrderBy(x => x.CreatedAt);

                if (request.Gender.HasValue)
                {
                    users = users.Where(x => x.Gender == request.Gender);
                }

                if (request.DateOfBirth.HasValue)
                {
                    users = users.Where(x =>
                        x.DateOfBirth.HasValue &&
                        x.DateOfBirth.Value.Date == request.DateOfBirth.Value.Date);
                }

                if (!string.IsNullOrWhiteSpace(request.Address))
                {
                    users = users.Where(x =>
                        x.Address != null && x.Address.ToLower().Contains(request.Address.ToLower()));
                }

                if (request.Status.HasValue)
                {
                    users = users.Where(x => x.Status == request.Status.Value);
                }

                if (request.RoleId.HasValue && request.RoleId != Guid.Empty)
                {
                    users = users.Where(x => x.RoleId == request.RoleId.Value);
                }

                if (request.OrganizerId.HasValue)
                {
                    users = users.Where(x => x.OrganizerId == request.OrganizerId);
                }

                var pagedUsers = await QueryableExtensions.ToPagedListAsync(
                                                                    users, 
                                                                    request.PageNumber, 
                                                                    request.PageSize,
                                                                    user => new UserDTO
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
                                                                        OrganizerId = user.OrganizerId,
                                                                        Locations = request.HasLocation!.Value ? user.Locations.Select(loc => new DTOs.Response.User.LocationUserDTO
                                                                        {
                                                                            Longitude = loc.Longitude!.Value,
                                                                            Latitude = loc.Latitude!.Value,
                                                                            CreatedAt = loc.CreatedAt,
                                                                        }).ToList() : new List<LocationUserDTO>(),
                                                                    },
                                                                    request.Fields);
                return new UserGetListResponse
                {
                    IsSuccess = true,
                    Message = "Users retrieved successfully",
                    Data = pagedUsers,
                };
            }
            catch (Exception ex)
            {
                return new UserGetListResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
