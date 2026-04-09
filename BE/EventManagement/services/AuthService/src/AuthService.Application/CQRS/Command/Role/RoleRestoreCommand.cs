
using AuthService.Application.DTOs.Response.Role;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.Role
{
    public class RoleRestoreCommand : IRequest<RoleRestoreResponse>
    {
        public string Id { get; set; }
    }
}
