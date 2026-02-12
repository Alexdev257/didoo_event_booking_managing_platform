using EventService.Application.CQRS.Command.Event;
using EventService.Application.CQRS.Query.Event;
using EventService.Application.DTOs.Response.Event;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System.Text.Json;

namespace EventService.Application.CQRS.Handler.Event
{
    public class EventGetByIdQueryHandler : IRequestHandler<EventGetByIdQuery, EventGetByIdResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventGetByIdQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventGetByIdResponse> Handle(EventGetByIdQuery request, CancellationToken cancellationToken)
        {
            var currentEvent = await _unitOfWork.Events.GetAllAsync()
                                                .Include(x => x.Category)
                                                .Include(x => x.Organizer)
                                                .Include(x => x.EventLocations)
                                                .Include(x => x.EventReviews)
                                                .Include(x => x.UserEventInteractions)
                                                .FirstOrDefaultAsync(x => x.Id == request.Id);
            if (currentEvent == null)
            {
                return new EventGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Event is not found"
                };
            }

            if (currentEvent.IsDeleted)
            {
                return new EventGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Evwnt is deleted"
                };
            }

            var dto = new EventDTO
            {
                Id = currentEvent.Id.ToString(),
                Name = currentEvent.Name,
                Slug = currentEvent.Slug,
                Subtitle = currentEvent.Subtitle,
                Description = currentEvent.Description,
                Tags = currentEvent.Tags != null ? JsonSerializer.Deserialize<List<TagRequest>>(currentEvent.Tags) : new List<Command.Event.TagRequest>(),
                StartTime = currentEvent.StartTime,
                EndTime = currentEvent.EndTime,
                OpenTime = currentEvent.OpenTime,
                ClosedTime = currentEvent.ClosedTime,
                Status = currentEvent.Status,
                ThumbnailUrl = currentEvent.ThumbnailUrl,
                BannerUrl = currentEvent.BannerUrl,
                AgeRestriction = currentEvent.AgeRestriction,
                Category = (currentEvent.Category != null && (request.HasLocations.HasValue && request.HasLocations.Value == true)) ? new EventCategoryDTO
                {
                    Id = currentEvent.Category.Id,
                    IconUrl = currentEvent.Category.IconUrl,
                    Name = currentEvent.Category.Name,
                } : null,
                Organizer = (currentEvent.Organizer != null && (request.HasOrganizer.HasValue && request.HasOrganizer.Value == true)) ? new EventOrganizerDTO
                {
                    Id = currentEvent.Organizer.Id,
                    Name = currentEvent.Organizer.Name,
                    Email = currentEvent.Organizer.Email,
                    Phone = currentEvent.Organizer.Phone,
                } : null,
                Locations = (currentEvent.EventLocations != null && (request.HasLocations.HasValue && request.HasLocations.Value == true)) ? currentEvent.EventLocations.Select(x => new EventEventLocationDTO
                {
                    Id = x.Id.ToString(),
                    Name = x.Name,
                    Address = x.Address,
                    Province = x.Province,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                }).ToList() : new List<EventEventLocationDTO>(),
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new EventGetByIdResponse
            {
                IsSuccess = true,
                Message = "Get Event By Id Successfully",
                Data = shapedData
            };
        }
    }
}
