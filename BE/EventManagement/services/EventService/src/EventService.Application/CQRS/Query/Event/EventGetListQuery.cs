using EventService.Application.DTOs.Response.Event;
using EventService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.Event
{
    public class EventGetListQuery : PaginationRequest, IRequest<EventGetListResponse>
    {
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Subtitle { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? Tags { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        public EventStatusEnum? Status { get; set; }
        public int? AgeRestriction { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? OrganizerId { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
        public string? Fields { get; set; }
        public bool? HasCategory { get; set; } = false!;
        public bool? HasOrganizer { get; set; } = false!;
        public bool? HasLocations { get; set; } = false!;
    }
}
