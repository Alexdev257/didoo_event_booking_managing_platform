using AuthService.Application.DTOs.Response.Auth;
using AuthService.Domain.Entities;
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
    public class VerifyChangeEmailCommand : IRequest<VerifyChangeEmailResponse>, IValidatable<VerifyChangeEmailResponse>
    {
        public string UserId { get; set; }
        public string Otp { get; set; }

        public Task<VerifyChangeEmailResponse> ValidateAsync()
        {
            var response = new VerifyChangeEmailResponse();
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
            if (string.IsNullOrEmpty(Otp))
                response.ListErrors.Add(new Errors
                {
                    Field = "Otp",
                    Detail = "Otp is null or empty"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
