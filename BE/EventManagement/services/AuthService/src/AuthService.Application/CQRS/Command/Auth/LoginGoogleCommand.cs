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
    public class LoginGoogleCommand : IRequest<LoginGoogleResponse>, IValidatable<LoginGoogleResponse>
    {
        public string GoogleToken { get; set; } = null!;

        public Task<LoginGoogleResponse> ValidateAsync()
        {
            var response = new LoginGoogleResponse();
            if (string.IsNullOrEmpty(GoogleToken))
                response.ListErrors.Add(new Errors
                {
                    Field = "GoogleToken",
                    Detail = "GoogleToken is null or empty"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
