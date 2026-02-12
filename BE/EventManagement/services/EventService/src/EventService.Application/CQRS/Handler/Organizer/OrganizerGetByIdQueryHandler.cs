using EventService.Application.CQRS.Query.Organizer;
using EventService.Application.DTOs.Response.Organizer;
using EventService.Application.Interfaces.Repositories;
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
    public class OrganizerGetByIdQueryHandler : IRequestHandler<OrganizerGetByIdQuery, OrganizerGetByIdResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public OrganizerGetByIdQueryHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<OrganizerGetByIdResponse> Handle(OrganizerGetByIdQuery request, CancellationToken cancellationToken)
        {
            var organizer = await _unitOfWork.Organizers.GetAllAsync().Include(x => x.Events).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (organizer == null)
            {
                return new OrganizerGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found"
                };
            }

            if (organizer.IsDeleted)
            {
                return new OrganizerGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is deleted"
                };
            }

            var dto = new OrganizerDTO
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
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new OrganizerGetByIdResponse
            {
                IsSuccess = true,
                Message = "Get Organizer by id successfully!",
                Data = shapedData,
            };
        }
    }
}
