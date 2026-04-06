using EventService.Application.CQRS.Command.Event;
using EventService.Application.CQRS.Query.Event;
using EventService.Application.DTOs.Response.Event;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace EventService.Application.CQRS.Handler.Event
{
    public class EventGetListQueryHandler : IRequestHandler<EventGetListQuery, EventGetListResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventGetListQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventGetListResponse> Handle(EventGetListQuery request, CancellationToken cancellationToken)
        {
            var currentEvent = _unitOfWork.Events.GetAllAsync()
                                                .Include(x => x.Category)
                                                .Include(x => x.Organizer)
                                                .Include(x => x.EventLocations)
                                                .Include(x => x.EventReviews)
                                                .Include(x => x.UserEventInteractions)
                                                .AsQueryable();
            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    currentEvent = currentEvent.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        currentEvent = currentEvent.Where(x => !x.IsDeleted);
                    }
                }
            }
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                currentEvent = currentEvent.Where(x => x.Name.ToLower().Contains(request.Name.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(request.Slug))
            {
                currentEvent = currentEvent.Where(x => x.Slug.ToLower().Contains(request.Slug.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(request.Subtitle))
            {
                currentEvent = currentEvent.Where(x => x.Subtitle.ToLower().Contains(request.Subtitle.ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(request.Tags))
            {
                currentEvent = currentEvent.Where(x => x.Tags.ToLower().Contains(request.Tags.ToLower()));
            }

            if (request.StartTime.HasValue)
            {
                currentEvent = currentEvent.Where(x => x.StartTime >= request.StartTime);
            }

            if (request.EndTime.HasValue)
            {
                currentEvent = currentEvent.Where(x => x.EndTime <= request.EndTime);
            }
            if (request.Status.HasValue)
            {
                currentEvent = currentEvent.Where(x => x.Status == request.Status);
            }
            if (!request.Status.HasValue)
            {
                currentEvent = currentEvent.Where(x => x.Status == Domain.Enum.EventStatusEnum.Published);
            }
            if (request.CategoryId != null && request.CategoryId != Guid.Empty)
            {
                currentEvent = currentEvent.Where(x => x.CategoryId == request.CategoryId);
            }

            if (request.OrganizerId != null && request.OrganizerId != Guid.Empty)
            {
                currentEvent = currentEvent.Where(x => x.OrganizerId == request.OrganizerId);
            }
            if (request.AgeRestriction.HasValue)
            {
                currentEvent = currentEvent.Where(x => x.AgeRestriction == request.AgeRestriction);
            }

            if (request.Latitude.HasValue && request.Longitude.HasValue && request.Distance.HasValue)
            {
                var lat = (double)request.Latitude.Value;
                var lon = (double)request.Longitude.Value;
                var dist = request.Distance.Value;

                // Bounding box calculation
                // 1 degree of latitude is approximately 111 km
                double latDelta = dist / 111.0;
                // 1 degree of longitude is approximately 111 * cos(latitude) km
                double lonDelta = dist / (111.0 * Math.Cos(lat * Math.PI / 180.0));

                decimal minLat = (decimal)(lat - latDelta);
                decimal maxLat = (decimal)(lat + latDelta);
                decimal minLon = (decimal)(lon - lonDelta);
                decimal maxLon = (decimal)(lon + lonDelta);

                currentEvent = currentEvent.Where(x => x.EventLocations.Any(l =>
                    l.Latitude >= minLat && l.Latitude <= maxLat &&
                    l.Longitude >= minLon && l.Longitude <= maxLon));
            }
            if (request.IsDescending.HasValue && request.IsDescending == true)
            {
                currentEvent = currentEvent.OrderByDescending(x => x.CreatedAt); // Hoặc StartTime
            }
            else
            {
                currentEvent = currentEvent.OrderBy(x => x.CreatedAt);
            }

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                                currentEvent,
                                                request.PageNumber,
                                                request.PageSize,
                                                x => new EventDTO
                                                {
                                                    Id = x.Id.ToString(),
                                                    Name = x.Name,
                                                    Slug = x.Slug,
                                                    Subtitle = x.Subtitle,
                                                    Description = x.Description,
                                                    Tags = x.Tags != null ? JsonSerializer.Deserialize<List<TagRequest>>(x.Tags) : new List<Command.Event.TagRequest>(),
                                                    StartTime = x.StartTime,
                                                    EndTime = x.EndTime,
                                                    OpenTime = x.OpenTime,
                                                    ClosedTime = x.ClosedTime,
                                                    Status = x.Status,
                                                    ThumbnailUrl = x.ThumbnailUrl,
                                                    BannerUrl = x.BannerUrl,
                                                    TicketMapUrl = x.TicketMapUrl,
                                                    AgeRestriction = x.AgeRestriction,
                                                    Category = (x.Category != null && (request.HasCategory.HasValue && request.HasCategory.Value == true)) ? new EventCategoryDTO
                                                    {
                                                        Id = x.Category.Id,
                                                        IconUrl = x.Category.IconUrl,
                                                        Name = x.Category.Name,
                                                    } : null,
                                                    Organizer = (x.Organizer != null && (request.HasOrganizer.HasValue && request.HasOrganizer.Value == true)) ? new EventOrganizerDTO
                                                    {
                                                        Id = x.Organizer.Id,
                                                        Name = x.Organizer.Name,
                                                        Email = x.Organizer.Email,
                                                        Phone = x.Organizer.Phone,
                                                    } : null,
                                                    Locations = (x.EventLocations != null && (request.HasLocations.HasValue && request.HasLocations.Value == true)) ? x.EventLocations.Select(x => new EventEventLocationDTO
                                                    {
                                                        Id = x.Id.ToString(),
                                                        Name = x.Name,
                                                        Address = x.Address,
                                                        District = x.District,
                                                        Ward = x.Ward,
                                                        Zipcode = x.Zipcode,
                                                        Status = x.Status,
                                                        ContactEmail = x.ContactEmail,
                                                        ContactPhone = x.ContactPhone,
                                                        Province = x.Province,
                                                        Latitude = x.Latitude,
                                                        Longitude = x.Longitude,
                                                    }).ToList() : new List<EventEventLocationDTO>(),
                                                },
                                                request.Fields);

            return new EventGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Event Successfully",
                Data = pagedList
            };
        }
    }
}
