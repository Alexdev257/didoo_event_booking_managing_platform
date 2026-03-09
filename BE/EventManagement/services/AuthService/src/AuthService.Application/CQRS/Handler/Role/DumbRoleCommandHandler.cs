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
    public class DumbRoleCommandHandler : IRequestHandler<RoleDumbCommand, RoleDumbResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        public DumbRoleCommandHandler(IAuthUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<RoleDumbResponse> Handle(RoleDumbCommand request, CancellationToken cancellationToken)
        {
            var roles = _unitOfWork.Roles.GetAllAsync();
            if(roles.Any())
            {
                return new RoleDumbResponse
                {
                    IsSuccess = false,
                    Message = "Roles are existed, can not dumb",
                    Data = null,
                };
            }

            var list = new List<AuthService.Domain.Entities.Role>()
            {
                new AuthService.Domain.Entities.Role()
                {
                    Id = Guid.NewGuid(),
                    Name = Domain.Enum.RoleNameEnum.Admin,
                    CreatedAt = DateTime.Now,
                    Status = Domain.Enum.StatusEnum.Active,
                },
                //new AuthService.Domain.Entities.Role()
                //{
                //    Id = Guid.NewGuid(),
                //    Name = Domain.Enum.RoleNameEnum.Manager,
                //    CreatedAt = DateTime.Now,
                //    Status = Domain.Enum.StatusEnum.Active,
                //},
                new AuthService.Domain.Entities.Role()
                {
                    Id = Guid.NewGuid(),
                    Name = Domain.Enum.RoleNameEnum.User,
                    CreatedAt = DateTime.Now,
                    Status = Domain.Enum.StatusEnum.Active,
                },
                //new AuthService.Domain.Entities.Role()
                //{
                //    Id = Guid.NewGuid(),
                //    Name = Domain.Enum.RoleNameEnum.Guest,
                //    CreatedAt = DateTime.Now,
                //    Status = Domain.Enum.StatusEnum.Active,
                //}
            };
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach(var role in list)
                {
                    await _unitOfWork.Roles.AddAsync(role);
                }
                await _unitOfWork.CommitTransactionAsync();
                return new RoleDumbResponse
                {
                    IsSuccess = true,
                    Message = "Dumb data successfully",
                    Data = roles.Select(x => new RoleDTO
                        {
                            Id = x.Id.ToString(),
                            Name = x.Name.ToString(),
                            CreatedAt = x.CreatedAt,
                            Status = x.Status.ToString(),
                        }
                    ).ToList(),
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
