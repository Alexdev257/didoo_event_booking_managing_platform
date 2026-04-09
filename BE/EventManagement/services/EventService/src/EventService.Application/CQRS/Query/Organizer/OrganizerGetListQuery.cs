using EventService.Application.DTOs.Response.Organizer;
using EventService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.Organizer
{
    public class OrganizerGetListQuery :PaginationRequest, IRequest<OrganizerGetListResponse>
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? MediaUrl { get; set; }
        public string? Address { get; set; }
        public bool? IsVerified { get; set; }
        public OrganizerStatusEnum? Status { get; set; }
        public bool? IsDescending { get; set; } = false!;
        public bool? IsDeleted  { get; set; }
        public string? Fields { get; set; }
        public bool? HasEvents { get; set; } = false!;
    }
}
