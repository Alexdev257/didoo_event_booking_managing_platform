using AuthService.Application.DTOs.Response.User;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.User
{
    public class UserDeleteCommand : IRequest<UserDeleteResponse>
    {
        public Guid Id { get; set; }
    }
}
