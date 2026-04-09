using AuthService.Application.DTOs.Response.Role;
using AuthService.Domain.Enum;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.Role
{
    public class RoleCreateCommand : IRequest<RoleCreateResponse>
    {
        
        public RoleNameEnum Name { get; set; }
        //public StatusEnum Status { get; set; } = StatusEnum.Active;
    }
}
