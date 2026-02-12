using EventService.Application.CQRS.Query.UserEventInteraction;
using EventService.Application.DTOs.Response.EventUserInteraction;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.UserEventInteraction
{
    public class InteractionGetListQueryHandler : IRequestHandler<InteractionGetListQuery, InteractionGetListResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public InteractionGetListQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<InteractionGetListResponse> Handle(InteractionGetListQuery request, CancellationToken cancellationToken)
        {
            var interactions = _unitOfWork.UserEventInteractions.GetAllAsync().Include(x => x.Event).AsQueryable();
            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    interactions = interactions.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        interactions = interactions.Where(x => !x.IsDeleted);
                    }
                }
            }
            if (request.Type.HasValue)
            {
                interactions = interactions.Where(x => x.Type == request.Type.Value);
            }
            if(request.UserId != null && request.UserId != Guid.Empty)
            {
                interactions = interactions.Where(x => x.UserId == request.UserId);
            }
            if (request.EventId != null && request.EventId != Guid.Empty)
            {
                interactions = interactions.Where(x => x.EventId == request.EventId);
            }
            
            if (request.IsDescending.HasValue && request.IsDescending == true)
            {
                interactions = interactions.OrderByDescending(x => x.CreatedAt);
            }
            else
            {
                interactions = interactions.OrderBy(x => x.CreatedAt);
            }

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                            interactions,
                                            request.PageNumber,
                                            request.PageSize,
                                            x => new InteractionDTO
                                            {
                                                Id = x.Id.ToString(),
                                                User = new InteractionUserDTO
                                                {
                                                    Id = x.UserId.ToString(),
                                                },
                                                Event = new InteractionEventDTO
                                                {
                                                    Id = x.Event.Id.ToString(),
                                                    Description = x.Event.Description,
                                                    Name = x.Event.Name,
                                                    Slug = x.Event.Slug,
                                                    Subtitle = x.Event.Subtitle,
                                                },
                                                Type = x.Type,
                                            },
                                            request.Fields);
            return new InteractionGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Interactions Successfully",
                Data = pagedList
            };
        }
    }
}
