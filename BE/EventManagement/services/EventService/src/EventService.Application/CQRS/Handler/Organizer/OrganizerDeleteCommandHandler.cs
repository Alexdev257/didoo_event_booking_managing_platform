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
    public class OrganizerDeleteCommandHandler : IRequestHandler<OrganizerDeleteCommand, OrganizerDeleteRepsonse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public OrganizerDeleteCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<OrganizerDeleteRepsonse> Handle(OrganizerDeleteCommand request, CancellationToken cancellationToken)
        {
            var organizer = await _unitOfWork.Organizers.GetAllAsync().Include(x => x.Events).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (organizer == null)
            {
                return new OrganizerDeleteRepsonse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found"
                };
            }

            if (organizer.IsDeleted)
            {
                return new OrganizerDeleteRepsonse
                {
                    IsSuccess = false,
                    Message = "Organizer is deleted"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                //if(organizer.Events != null && organizer.Events.Any())
                //{
                //    foreach(var eventt in organizer.Events)
                //    {
                //        _unitOfWork.Events.DeleteAsync(eventt);
                //    }
                //}
                _unitOfWork.Organizers.DeleteAsync(organizer);
                await _unitOfWork.CommitTransactionAsync();
                return new OrganizerDeleteRepsonse
                {
                    IsSuccess = true,
                    Message = "Delete Organizer Successfully!",
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
                    }
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new OrganizerDeleteRepsonse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null
                };
            }

        }
    }
}
