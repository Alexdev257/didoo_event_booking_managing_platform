using AuthService.Application.DTOs.Response.Auth;
using MediatR;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.Auth
{
    public class LogoutCommand : IRequest<LogoutResponse>, IValidatable<LogoutResponse>
    {
        public string UserId { get; set; }

        public Task<LogoutResponse> ValidateAsync()
        {
            var response = new LogoutResponse();
            if (string.IsNullOrEmpty(UserId))
                response.ListErrors.Add(new Errors
                {
                    Field = "UserId",
                    Detail = "UserId is not null or empty"
                });

            if (!Guid.TryParse(UserId, out _))
                response.ListErrors.Add(new Errors
                {
                    Field = "UserId",
                    Detail = "UserId is not in correct format"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
