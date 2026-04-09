using EventService.Application.CQRS.Command.Event;
using EventService.Application.DTOs.Response.Event;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Event
{
    public class EventCreateCommandHandler : IRequestHandler<EventCreateCommand, EventCreateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventCreateCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventCreateResponse> Handle(EventCreateCommand request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
            if(category == null)
            {
                return new EventCreateResponse
                {
                    IsSuccess = false,
                    Message = "Category is not found!",
                };
            }

            if(category.IsDeleted)
            {
                return new EventCreateResponse
                {
                    IsSuccess = false,
                    Message = "Category is deleted!",
                };
            }

            var organizer = await _unitOfWork.Organizers.GetByIdAsync(request.OrganizerId);
            if (organizer == null)
            {
                return new EventCreateResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found!",
                };
            }

            if (organizer.IsDeleted)
            {
                return new EventCreateResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is deleted!",
                };
            }

            var newEvent = new EventService.Domain.Entities.Event
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = request.Slug,
                Subtitle = request.Subtitle,
                Description = request.Description,
                Tags = JsonSerializer.Serialize(request.Tags),
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                OpenTime = request.OpenTime,
                ClosedTime = request.ClosedTime,
                //Status = request.Status,
                Status = Domain.Enum.EventStatusEnum.Draft,
                ThumbnailUrl = request.ThumbnailUrl,
                BannerUrl = request.BannerUrl,
                TicketMapUrl = request.TicketMapUrl,
                AgeRestriction = request.AgeRestriction,
                CategoryId = request.CategoryId,
                OrganizerId = request.OrganizerId,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                await _unitOfWork.Events.AddAsync(newEvent);
                if (request.Locations != null && request.Locations.Any())
                {
                    foreach (var location in request.Locations)
                    {
                        var locationEntity = new EventService.Domain.Entities.EventLocaltion
                        {
                            Id = Guid.NewGuid(),
                            EventId = newEvent.Id,
                            Name = request.Name,
                            Address = location.Address,
                            Province = location.Province,
                            District = location.District,
                            Ward = location.District,
                            Zipcode = location.Zipcode,
                            Latitude = location.Latitude,
                            Longitude = location.Longitude,
                            ContactEmail = location.ContactEmail,
                            ContactPhone = location.ContactPhone,
                            Status = Domain.Enum.EventStatusEnum.Draft,
                            CreatedAt = DateTime.UtcNow,
                        };
                        await _unitOfWork.EventLocaltions.AddAsync(locationEntity);
                    }
                }
                await _unitOfWork.CommitTransactionAsync();
                return new EventCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Event Successfully",
                    Data = new EventDTO
                    {
                        Id  = newEvent.Id.ToString(),
                        Name = newEvent.Name,
                        Slug = newEvent.Slug,
                        Subtitle = newEvent.Subtitle,
                        Description = newEvent.Description,
                        Tags = newEvent.Tags != null ? JsonSerializer.Deserialize<List<TagRequest>>(newEvent.Tags) : new List<TagRequest>(),
                        StartTime = newEvent.StartTime,
                        EndTime = newEvent.EndTime,
                        OpenTime = newEvent.OpenTime,
                        ClosedTime = newEvent.ClosedTime,
                        Status = newEvent.Status,
                        ThumbnailUrl = newEvent.ThumbnailUrl,
                        BannerUrl = newEvent.BannerUrl,
                        TicketMapUrl = newEvent.TicketMapUrl,
                        AgeRestriction = newEvent.AgeRestriction,
                        Category = category != null ? new EventCategoryDTO
                        {
                            Id = category.Id,
                            IconUrl = category.IconUrl,
                            Name = category.Name,
                        } : null,
                        Organizer = organizer != null ? new EventOrganizerDTO
                        {
                            Id = organizer.Id,
                            Name = organizer.Name,
                            Email = organizer.Email,
                            Phone = organizer.Phone,
                        } : null,
                        
                    }
                };
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
