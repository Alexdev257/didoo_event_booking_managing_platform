using EventService.Application.DTOs.Response.Organizer;
using EventService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Organizer
{
    public class OrganizerCreateCommand : IRequest<OrganizerCreateResponse>, IValidatable<OrganizerCreateResponse>
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string BannerUrl { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WebsiteUrl { get; set; } = string.Empty;
        public string? FacebookUrl { get; set; } = string.Empty;
        public string? InstagramUrl { get; set; } = string.Empty;
        public string? TiktokUrl { get; set; } = string.Empty;
        public string? Address { get; set; } = string.Empty;
        public bool? IsVerified { get; set; } = false!;
        public bool? HasSendEmail { get; set; } = false!;
        public Guid UserId { get; set; }
        public OrganizerStatusEnum Status { get; set; } = OrganizerStatusEnum.Pending;

        public Task<OrganizerCreateResponse> ValidateAsync()
        {
            var response = new OrganizerCreateResponse();
            if (string.IsNullOrEmpty(Name))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Name",
                    Detail = "Name is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(Slug))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Slug",
                    Detail = "Slug is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(Description))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Description",
                    Detail = "Description is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(LogoUrl))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "LogoUrl",
                    Detail = "LogoUrl is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(BannerUrl))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "BannerUrl",
                    Detail = "BannerUrl is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(Email))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Email",
                    Detail = "Email is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(Phone))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Phone",
                    Detail = "Phone is not null or empty"
                });
            }
            if (string.IsNullOrEmpty(WebsiteUrl))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "WebsiteUrl",
                    Detail = "WebsiteUrl is not null or empty"
                });
            }
            if (!Regex.IsMatch(Phone, @"^(0[3|5|7|8|9])[0-9]{8}$"))
                response.ListErrors.Add(new Errors
                {
                    Field = "Phone",
                    Detail = "Phone must be Viet Nam phone number!"
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
