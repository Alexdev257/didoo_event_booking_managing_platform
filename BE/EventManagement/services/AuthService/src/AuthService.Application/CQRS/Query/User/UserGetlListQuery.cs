using AuthService.Application.DTOs.Response.User;
using AuthService.Domain.Entities;
using AuthService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Query.User
{
    public class UserGetListQuery : PaginationRequest, IRequest<UserGetListResponse>
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool? IsVerified { get; set; }
        public int? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public StatusEnum? Status { get; set; }
        public Guid? RoleId { get; set; }
        public Guid? OrganizerId { get; set; }
        public string? Fields { get; set; }
        public bool? HasLocation { get; set; } = false!;
        public bool? IsDescending { get; set; } = false!;
        public bool? IsDeleted { get; set; }
    }
}
