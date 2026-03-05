using EventService.Application.CQRS.Command.Event;
using EventService.Application.DTOs.Response.Event;
using EventService.Application.Interfaces.Repositories;
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
    public class EventDeleteCommandHandler : IRequestHandler<EventDeleteCommand, EventDeleteResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventDeleteCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventDeleteResponse> Handle(EventDeleteCommand request, CancellationToken cancellationToken)
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
                return new EventDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Event is not found"
                };
            }

            if (currentEvent.IsDeleted)
            {
                return new EventDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Evwnt is deleted"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if(currentEvent.EventLocations != null && currentEvent.EventLocations.Any())
                {
                    foreach(var location in currentEvent.EventLocations)
                    {
                        if(!location.IsDeleted)
                        {
                            _unitOfWork.EventLocaltions.DeleteAsync(location);
                        }
                    }
                }
                if (currentEvent.EventReviews != null && currentEvent.EventReviews.Any())
                {
                    foreach (var review in currentEvent.EventReviews)
                    {
                        if (!review.IsDeleted)
                        {
                            _unitOfWork.EventReviews.DeleteAsync(review);
                        }
                    }
                }
                if (currentEvent.UserEventInteractions != null && currentEvent.UserEventInteractions.Any())
                {
                    foreach(var interaction in currentEvent.UserEventInteractions)
                    {
                        if (!interaction.IsDeleted)
                        {
                            _unitOfWork.UserEventInteractions.DeleteAsync(interaction);
                        }
                    }
                }
                currentEvent.Status = Domain.Enum.EventStatusEnum.Cancelled;
                _unitOfWork.Events.UpdateAsync(currentEvent);
                _unitOfWork.Events.DeleteAsync(currentEvent);
                await _unitOfWork.CommitTransactionAsync();
                return new EventDeleteResponse
                {
                    IsSuccess = true,
                    Message = "Delete Event Successfully",
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
                return new EventDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }

            
        }
    }
}
