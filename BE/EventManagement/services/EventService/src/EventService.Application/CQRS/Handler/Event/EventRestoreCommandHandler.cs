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
    public class EventRestoreCommandHandler : IRequestHandler<EventRestoreCommand, EventRestoreResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventRestoreCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventRestoreResponse> Handle(EventRestoreCommand request, CancellationToken cancellationToken)
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
                return new EventRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Event is not found"
                };
            }

            if (!currentEvent.IsDeleted)
            {
                return new EventRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Evwnt is not deleted"
                };
            }

            if (currentEvent.Status != Domain.Enum.EventStatusEnum.Cancelled)
            {
                return new EventRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Evwnt is not deleted"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                currentEvent.IsDeleted = false;
                currentEvent.DeletedAt = null;
                if(currentEvent.StartTime <= DateTime.UtcNow)
                {
                    currentEvent.Status = Domain.Enum.EventStatusEnum.Published;
                }
                else
                {
                    currentEvent.Status = Domain.Enum.EventStatusEnum.Draft;
                }
                _unitOfWork.Events.UpdateAsync(currentEvent);
                if (currentEvent.EventLocations != null && currentEvent.EventLocations.Any())
                {
                    foreach (var location in currentEvent.EventLocations)
                    {
                        if (location.IsDeleted)
                        {
                            location.IsDeleted = false;
                            location.DeletedAt = null;
                            _unitOfWork.EventLocaltions.UpdateAsync(location);
                        }
                    }
                }
                if (currentEvent.EventReviews != null && currentEvent.EventReviews.Any())
                {
                    foreach (var review in currentEvent.EventReviews)
                    {
                        if (review.IsDeleted)
                        {
                            review.IsDeleted = false;
                            review.DeletedAt = null;
                            _unitOfWork.EventReviews.UpdateAsync(review);
                        }
                    }
                }
                if (currentEvent.UserEventInteractions != null && currentEvent.UserEventInteractions.Any())
                {
                    foreach (var interaction in currentEvent.UserEventInteractions)
                    {
                        if (interaction.IsDeleted)
                        {
                            interaction.IsDeleted = false;
                            interaction.DeletedAt = null;
                            _unitOfWork.UserEventInteractions.UpdateAsync(interaction);
                        }
                    }
                }
                await _unitOfWork.CommitTransactionAsync();
                return new EventRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Restore Event Successfully",
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
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
