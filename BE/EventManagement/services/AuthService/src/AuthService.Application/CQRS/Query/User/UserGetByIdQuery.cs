using AuthService.Application.DTOs.Response.User;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Query.User
{
    public class UserGetByIdQuery : IRequest<UserGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasLocation { get; set; } = false!;

    }
}
