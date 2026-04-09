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
    public class RefreshCommand : IRequest<RefreshResponse>, IValidatable<RefreshResponse>
    {
        public string Id { get; set; }
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;

        public Task<RefreshResponse> ValidateAsync()
        {
            var response = new RefreshResponse();
            if (string.IsNullOrEmpty(Id))
                response.ListErrors.Add(new Errors
                {
                    Field = "Id",
                    Detail = "Id is null or empty"
                });
            if (!Guid.TryParse(Id.ToString(), out _))
                response.ListErrors.Add(new Errors
                {
                    Field = "Id",
                    Detail = "Id is not format GUID"
                });
            if (string.IsNullOrEmpty(AccessToken))
                response.ListErrors.Add(new Errors
                {
                    Field = "AccessToken",
                    Detail = "AccessToken is null or empty"
                });
            if (string.IsNullOrEmpty(RefreshToken))
                response.ListErrors.Add(new Errors
                {
                    Field = "RefreshToken",
                    Detail = "RefreshToken is null or empty"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
