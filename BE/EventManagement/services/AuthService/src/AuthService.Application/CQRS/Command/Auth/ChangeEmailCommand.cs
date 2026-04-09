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
    public class ChangeEmailCommand : IRequest<ChangeEmailResponse>, IValidatable<ChangeEmailResponse>
    {
        public string UserId { get; set; }
        public string NewEmail { get; set; }

        public Task<ChangeEmailResponse> ValidateAsync()
        {
            var response = new ChangeEmailResponse();
            if (string.IsNullOrEmpty(UserId))
                response.ListErrors.Add(new Errors
                {
                    Field = "UserId",
                    Detail = "UserId is null or empty"
                });
            if (!Guid.TryParse(UserId, out _))
                response.ListErrors.Add(new Errors
                {
                    Field = "UserId",
                    Detail = "UserId is not valid GUID"
                });
            if (string.IsNullOrEmpty(NewEmail))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewEmail",
                    Detail = "NewEmail is null or empty"
                });
            if (!Regex.IsMatch(NewEmail, @"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewEmail",
                    Detail = "NewEmail is not valid!"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
