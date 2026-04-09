using AuthService.Application.DTOs.Response.Role;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.Role
{
    public class RoleDeleteCommand : IRequest<RoleDeleteResponse>
    {
        [JsonIgnore]
        public string Id { get; set; }
    }
}
