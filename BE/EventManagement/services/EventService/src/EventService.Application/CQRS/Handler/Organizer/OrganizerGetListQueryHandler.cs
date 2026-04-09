
using EventService.Application.CQRS.Query.Organizer;
using EventService.Application.DTOs.Response.Organizer;
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

namespace EventService.Application.CQRS.Handler.Organizer
{
    public class OrganizerGetListQueryHandler : IRequestHandler<OrganizerGetListQuery, OrganizerGetListResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public OrganizerGetListQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<OrganizerGetListResponse> Handle(OrganizerGetListQuery request, CancellationToken cancellationToken)
        {
            var organizers = _unitOfWork.Organizers.GetAllAsync()
                                        .Include(x => x.Events)
                                        .AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    organizers = organizers.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        organizers = organizers.Where(x => !x.IsDeleted);
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                organizers = organizers.Where(x => x.Name.ToLower().Contains(request.Name.ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(request.Slug))
            {
                organizers = organizers.Where(x => x.Slug.ToLower().Contains(request.Slug.ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                organizers = organizers.Where(x => x.Description.ToLower().Contains(request.Description.ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                organizers = organizers.Where(x => x.Email.Contains(request.Email));
            }
            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                organizers = organizers.Where(x => x.Phone.Contains(request.Phone));
            }
            if (!string.IsNullOrWhiteSpace(request.MediaUrl))
            {
                organizers = organizers.Where(x => x.WebsiteUrl.Contains(request.MediaUrl) ||
                                                   x.FacebookUrl.Contains(request.MediaUrl) ||
                                                   x.InstagramUrl.Contains(request.MediaUrl) ||
                                                   x.TiktokUrl.Contains(request.MediaUrl));
            }
            if(!string.IsNullOrWhiteSpace(request.Address))
            {
                organizers = organizers.Where(x => x.Address.ToLower().Contains(request.Address.ToLower()));
            }
            if (request.IsVerified.HasValue)
            {
                organizers = organizers.Where(x => x.IsVerified == request.IsVerified.Value);
            }
            if (request.Status.HasValue)
            {
                organizers = organizers.Where(x => x.Status == request.Status.Value);
            }
            var isDescending = request.IsDescending ?? false;

            organizers = isDescending
                ? organizers.OrderByDescending(x => x.CreatedAt)
                : organizers.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                                    organizers,
                                                    request.PageNumber,
                                                    request.PageSize,
                                                    organizer => new OrganizerDTO
                                                    {
                                                        Id = organizer.Id.ToString(),
                                                        Name = organizer.Name,
                                                        Slug = organizer.Slug,
                                                        Description = organizer.Description,
                                                        Address = organizer.Address,
                                                        IsVerified = organizer.IsVerified,
                                                        BannerUrl = organizer.BannerUrl,
                                                        Email = organizer.Email,
                                                        Phone = organizer.Phone,
                                                        WebsiteUrl = organizer.WebsiteUrl,
                                                        FacebookUrl = organizer.FacebookUrl,
                                                        InstagramUrl = organizer.InstagramUrl,
                                                        LogoUrl = organizer.LogoUrl,
                                                        Status = organizer.Status,
                                                        TiktokUrl = organizer.TiktokUrl,
                                                        CreatedAt = organizer.CreatedAt,
                                                        UpdatedAt = organizer.UpdatedAt,
                                                        Events = organizer.Events.Any() ? organizer.Events.Select(x => new OrganizerEventDTO
                                                        {
                                                            Id = x.Id.ToString(),
                                                            Name = x.Name,
                                                            Slug = x.Slug,
                                                            Subtitle = x.Subtitle,
                                                            Description = x.Description,
                                                            Tags = x.Tags,
                                                            StartTime = x.StartTime,
                                                            EndTime = x.EndTime,
                                                            OpenTime = x.OpenTime,
                                                            ClosedTime = x.ClosedTime,
                                                            Status = x.Status,
                                                            ThumbnailUrl = x.ThumbnailUrl,
                                                            BannerUrl = x.BannerUrl,
                                                            AgeRestriction = x.AgeRestriction,
                                                        }).ToList() : null,
                                                    },
                                                    request.Fields);
            return new OrganizerGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve organizers successfully",
                Data = pagedList,
            };
        }
    }
}
