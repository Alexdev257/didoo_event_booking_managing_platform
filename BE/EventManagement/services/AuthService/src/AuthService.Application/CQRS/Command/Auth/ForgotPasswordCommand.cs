using AuthService.Application.DTOs.Response.Auth;
using MediatR;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.Auth
{
    public class ForgotPasswordCommand : IRequest<ForgotPasswordResponse>, IValidatable<ForgotPasswordResponse>
    {
        public string Email { get; set; } = null!;

        public Task<ForgotPasswordResponse> ValidateAsync()
        {
            var response = new ForgotPasswordResponse();
            if (string.IsNullOrEmpty(Email))
                response.ListErrors.Add(new Errors
                {
                    Field = "Email",
                    Detail = "Email is null or empty"
                });
            if (!Regex.IsMatch(Email, @"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Email",
                    Detail = "Email is not valid!"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
