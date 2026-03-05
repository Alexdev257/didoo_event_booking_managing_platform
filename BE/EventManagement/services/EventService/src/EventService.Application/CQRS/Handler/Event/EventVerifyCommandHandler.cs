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
    public class EventVerifyCommandHandler : IRequestHandler<EventVerifyCommand, EventVerfiyResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventVerifyCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventVerfiyResponse> Handle(EventVerifyCommand request, CancellationToken cancellationToken)
        {
            var currentEvent = await _unitOfWork.Events.GetAllAsync().Include(x => x.Category).Include(x => x.Organizer).Include(x => x.EventLocations).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (currentEvent == null)
            {
                return new EventVerfiyResponse
                {
                    IsSuccess = false,
                    Message = "Event is not found"
                };
            }

            if (currentEvent.IsDeleted)
            {
                return new EventVerfiyResponse
                {
                    IsSuccess = false,
                    Message = "Evwnt is deleted"
                };
            }

            

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                currentEvent.Status = request.Status;
                _unitOfWork.Events.UpdateAsync(currentEvent);
                await _unitOfWork.CommitTransactionAsync();
                return new EventVerfiyResponse
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
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventVerfiyResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
    }
}
