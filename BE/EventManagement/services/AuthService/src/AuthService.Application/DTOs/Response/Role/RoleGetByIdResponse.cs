using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.DTOs.Response.Role
{
    public class RoleGetByIdResponse : IRequest<RoleDTO>
    {
    }
}
