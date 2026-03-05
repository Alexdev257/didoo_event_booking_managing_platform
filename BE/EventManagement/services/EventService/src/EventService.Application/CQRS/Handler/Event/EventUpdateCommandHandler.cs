using EventService.Application.CQRS.Command.Event;
using EventService.Application.DTOs.Response.Event;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Event
{
    public class EventUpdateCommandHandler : IRequestHandler<EventUpdateCommand, EventUpdateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventUpdateCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<EventUpdateResponse> Handle(EventUpdateCommand request, CancellationToken cancellationToken)
        {
            var currentEvent = await _unitOfWork.Events.GetAllAsync().Include(x => x.Category).Include(x => x.Organizer).Include(x => x.EventLocations).FirstOrDefaultAsync(x => x.Id == request.Id);
            if(currentEvent == null)
            {
                return new EventUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Event is not found"
                };
            }

            if (currentEvent.IsDeleted)
            {
                return new EventUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Evwnt is deleted"
                };
            }

            var checkCategory = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
            if (checkCategory == null)
            {
                return new EventUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Category is not found via new CategoryId"
                };
            }

            var checkOrganizer = await _unitOfWork.Organizers.GetByIdAsync(request.OrganizerId);
            if (checkOrganizer == null)
            {
                return new EventUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found via new OrganizerId"
                };
            }

            currentEvent.Name = request.Name;
            currentEvent.Slug = request.Slug;
            currentEvent.Subtitle = request.Subtitle;
            currentEvent.Description = request.Description;
            currentEvent.Tags = JsonSerializer.Serialize(request.Tags);
            currentEvent.StartTime = request.StartTime;
            currentEvent.EndTime = request.EndTime;
            currentEvent.OpenTime = request.OpenTime;
            currentEvent.ClosedTime = request.ClosedTime;
            currentEvent.Status = request.Status;
            currentEvent.ThumbnailUrl = request.ThumbnailUrl;
            currentEvent.BannerUrl = request.BannerUrl;
            currentEvent.TicketMapUrl = request.TicketMapUrl;
            currentEvent.AgeRestriction = request.AgeRestriction;
            currentEvent.CategoryId = request.CategoryId;
            currentEvent.OrganizerId = request.OrganizerId;

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                _unitOfWork.Events.UpdateAsync(currentEvent);
                await _unitOfWork.CommitTransactionAsync();
                return new EventUpdateResponse
                {
                    IsSuccess = true,
                    Message = "Update Event Successfully",
                    Data = new EventDTO
                    {
                        Id = currentEvent.Id.ToString(),
                        Name = currentEvent.Name,
                        Slug = currentEvent.Slug,
                        Subtitle = currentEvent.Subtitle,
                        Description = currentEvent.Description,
                        Tags = currentEvent.Tags != null ? JsonSerializer.Deserialize<List<TagRequest>>(currentEvent.Tags) : new List<TagRequest>(),
                        StartTime = currentEvent.StartTime,
                        EndTime = currentEvent.EndTime,
                        OpenTime = currentEvent.OpenTime,
                        ClosedTime = currentEvent.ClosedTime,
                        Status = currentEvent.Status,
                        ThumbnailUrl = currentEvent.ThumbnailUrl,
                        BannerUrl = currentEvent.BannerUrl,
                        TicketMapUrl = currentEvent.TicketMapUrl,
                        AgeRestriction = currentEvent.AgeRestriction,
                        Category = currentEvent.Category != null ? new EventCategoryDTO
                        {
                            Id = currentEvent.Category.Id,
                            IconUrl = currentEvent.Category.IconUrl,
                            Name = currentEvent.Category.Name,
                        } : null,
                        Organizer = currentEvent.Organizer != null ? new EventOrganizerDTO
                        {
                            Id = currentEvent.Organizer.Id,
                            Name = currentEvent.Organizer.Name,
                            Email = currentEvent.Organizer.Email,
                            Phone = currentEvent.Organizer.Phone,
                        } : null,
                    }
                };
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventUpdateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
