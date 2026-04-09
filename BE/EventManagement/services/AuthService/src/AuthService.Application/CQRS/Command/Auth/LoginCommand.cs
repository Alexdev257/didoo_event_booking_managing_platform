using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.DTOs.Response.User;
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
    public class LoginCommand : IRequest<LoginResponse>, IValidatable<LoginResponse>
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public LocationRequest Location { get; set; }

        public Task<LoginResponse> ValidateAsync()
        {
            var response = new LoginResponse();
            if (string.IsNullOrEmpty(Email))
                response.ListErrors.Add(new Errors
                {
                    Field = "Email",
                    Detail = "Email is null or empty"
                });
            if (string.IsNullOrEmpty(Password))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password is null or empty"
                });
            if (!Regex.IsMatch(Email, @"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Email",
                    Detail = "Email is not valid!"
                });
            if (Password.Length < 8)
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must be at least 8 characters!"
                });
            if (!Regex.IsMatch(Password, @"^(?=.*[A-Z]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 Upper character!"
                });
            if (!Regex.IsMatch(Password, @"^(?=.*[a-z]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 Lower character!"
                });
            if (!Regex.IsMatch(Password, @"^(?=.*[\d]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 digit!"
                });
            if (!Regex.IsMatch(Password, @"^(?=.*[!@#$%^&*(),.?"":{}|_<>]).+$"))
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
