using EventService.Application.CQRS.Command.Organizer;
using EventService.Application.DTOs.Response.Organizer;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Organizer
{
    public class OrganizerRestoreCommandHandler : IRequestHandler<OrganizerRestoreCommand, OrganizerRestoreResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public OrganizerRestoreCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<OrganizerRestoreResponse> Handle(OrganizerRestoreCommand request, CancellationToken cancellationToken)
        {
            var organizer = await _unitOfWork.Organizers.GetAllAsync().Include(x => x.Events).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (organizer == null)
            {
                return new OrganizerRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found"
                };
            }

            if (!organizer.IsDeleted)
            {
                return new OrganizerRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not deleted"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                organizer.IsDeleted = false;
                organizer.DeletedAt = null;
                organizer.Status = Domain.Enum.OrganizerStatusEnum.Verified;
                _unitOfWork.Organizers.UpdateAsync(organizer);
                await _unitOfWork.CommitTransactionAsync();
                return new OrganizerRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Restore organizer successfully",
                    Data = new OrganizerDTO
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
                    }
                };
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new OrganizerRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
