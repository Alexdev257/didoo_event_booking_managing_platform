using AuthService.Application.DTOs.Response.Auth;
using AuthService.Domain.Entities;
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
    public class ChangePasswordCommand : IRequest<ChangePasswordResponse>, IValidatable<ChangePasswordResponse>
    {
        public string UserId { get; set; }
        public string Password { get; set; }
        public string NewPassword { get; set; }

        public Task<ChangePasswordResponse> ValidateAsync()
        {
            ChangePasswordResponse response = new();
            if (string.IsNullOrEmpty(UserId))
                response.ListErrors.Add(new Errors
                {
                    Field = "UserId",
                    Detail = "UserId is not null or empty"
                });
            if (string.IsNullOrEmpty(Password))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password is not null or empty"
                });
            if (string.IsNullOrEmpty(NewPassword))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password is not null or empty"
                });
            if(!Guid.TryParse(UserId, out _))
                response.ListErrors.Add(new Errors
                {
                    Field = "UserId",
                    Detail = "UserId is not in correct format"
                });
            if (NewPassword.Length < 8)
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must be at least 8 characters!"
                });

            if (!Regex.IsMatch(NewPassword, @"^(?=.*[A-Z]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 Upper character!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[a-z]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 Lower character!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[\d]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 digit!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[!@#$%^&*(),.?"":{}|<>]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 special character(!@#$%^&*(),.?\":{}|<>)!"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
