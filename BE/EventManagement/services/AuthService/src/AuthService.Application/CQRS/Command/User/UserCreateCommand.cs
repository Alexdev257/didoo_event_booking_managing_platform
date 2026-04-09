using AuthService.Application.DTOs.Response.User;
using AuthService.Domain.Entities;
using AuthService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Command.User
{
    public class UserCreateCommand : IRequest<UserCreateResponse>, IValidatable<UserCreateResponse>
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }
        public string Password { get; set; }
        public string? AvatarUrl { get; set; }
        public int? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public StatusEnum Status { get; set; }
        public RoleNameEnum RoleName { get; set; }
        public string? OrganizerId { get; set; }

        public Task<UserCreateResponse> ValidateAsync()
        {
            var response = new UserCreateResponse();
            if (string.IsNullOrEmpty(FullName))
                response.ListErrors.Add(new Errors
                {
                    Field = "Fullname",
                    Detail = "Fullname is null or empty"
                });
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
            if (!Regex.IsMatch(FullName, @"([a-zA-Z\s]+)"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Fullname",
                    Detail = "Fullname is not allowed special characters and digits!"
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
            if (!Regex.IsMatch(Password, @"^(?=.*[!@#$%^&*(),.?"":{}|<>]).+$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Password",
                    Detail = "Password must contain at least 1 special character(!@#$%^&*(),.?\":{}|<>)!"
                });
            if (!(string.IsNullOrEmpty(Phone)))
            {
                if (!Regex.IsMatch(Phone, @"^(0[3|5|7|8|9])[0-9]{8}$"))
                    response.ListErrors.Add(new Errors
                    {
                        Field = "Phone",
                        Detail = "Phone must be Viet Nam phone number!"
                    });
            }
            if (!string.IsNullOrWhiteSpace(OrganizerId))
            {
                if (!Guid.TryParse(OrganizerId, out Guid organizerId))
                {
                    response.ListErrors.Add(new Errors
                    {
                        Field = "OrganizerId",
                        Detail = "OrganizerId must be guid!"
                    });
                }
            }
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);

        }
    }
}
