using EventService.Application.DTOs.Response.Event;
using EventService.Domain.Entities;
using EventService.Domain.Enum;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Event
{
    public class EventCreateCommand : IRequest<EventCreateResponse>
    {
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Subtitle { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public List<TagRequest>? Tags { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? ClosedTime { get; set; }
        //public EventStatusEnum Status { get; set; } = EventStatusEnum.Draft;
        public string? ThumbnailUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? TicketMapUrl { get; set; }
        public int AgeRestriction { get; set; } = 18;
        public Guid? CategoryId { get; set; }
        //public virtual Category? Category { get; set; }
        public Guid? OrganizerId { get; set; }
        public List<EventLocationRequest>? Locations { get; set; }
        //public virtual Organizer? Organizer { get; set; }

        //public virtual ICollection<EventLocaltion> EventLocations { get; set; }
        //public virtual ICollection<EventReview> EventReviews { get; set; }
        //public virtual ICollection<UserEventInteraction> UserEventInteractions { get; set; }
        //public virtual ICollection<FavoriteEvent> FavoriteEvents { get; set; }
    }

    public class TagRequest
    {
        public string TagName { get; set; }
    }

    public class EventLocationRequest
    {
        //public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string Zipcode { get; set; } = string.Empty;
        public decimal? Latitude { get; set; } = 0;
        public decimal? Longitude { get; set; } = 0;
        public string ContactEmail { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
    }
}
