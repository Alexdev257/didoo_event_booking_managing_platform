using EventService.Application.CQRS.Query.Event;
using EventService.Application.DTOs.Response;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Event
{
    public class GetAllEventQueryHandler : IRequestHandler<EventGetAllQuery, GetAllEventResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public GetAllEventQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public Task<GetAllEventResponse> Handle(EventGetAllQuery request, CancellationToken cancellationToken)
        {
            var events = _unitOfWork.Events.GetAllAsync();
            var response = events.Select(e => new EventDTO
            {
                id = e.Id.ToString(),
                Name = e.Name,
                Description = e.Description,
                AgeRestriction = e.AgeRestriction,
                BannerUrl = e.BannerUrl,
                CategoryId = e.CategoryId.ToString(),
                ClosedTime = e.ClosedTime,
                EndTime = e.EndTime,
                OpenTime = e.OpenTime,
                OrganizerId = e.OrganizerId.ToString(),
                Slug = e.Slug,
                StartTime = e.StartTime,
                Status = e.Status.ToString(),
                Subtitle = e.Subtitle,
                Tags = e.Tags,
                ThumbnailUrl = e.ThumbnailUrl
            }).ToList();

            return Task.FromResult(new GetAllEventResponse
            {
                IsSuccess = true,
                Message = "Events retrieved successfully",
                Data = response,
            });
        }
    }
}
