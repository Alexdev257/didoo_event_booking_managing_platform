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
    public class VerifyForgotPasswordCommand : IRequest<VerifyForgotPasswordResponse>, IValidatable<VerifyForgotPasswordResponse>
    {
        public string Key { get; set; }
        public string NewPassword { get; set; }

        public Task<VerifyForgotPasswordResponse> ValidateAsync()
        {
            var response = new VerifyForgotPasswordResponse();
            if (string.IsNullOrEmpty(NewPassword))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewPassword",
                    Detail = "NewPassword is null or empty"
                });
            if (NewPassword.Length < 8)
                response.ListErrors.Add(new Errors
                {
                    Field = "NewPassword",
                    Detail = "NewPassword must be at least 8 characters!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[A-Z]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewPassword",
                    Detail = "NewPassword must contain at least 1 Upper character!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[a-z]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewPassword",
                    Detail = "NewPassword must contain at least 1 Lower character!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[\d]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewPassword",
                    Detail = "NewPassword must contain at least 1 digit!"
                });
            if (!Regex.IsMatch(NewPassword, @"^(?=.*[!@#$%^&*(),.?"":{}|<>]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "NewPassword",
                    Detail = "NewPassword must contain at least 1 special character(!@#$%^&*(),.?\":{}|<>)!"
                });
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
