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
    public class OrganizerUpdateCommandHandler : IRequestHandler<OrganizerUpdateCommand, OrganizerUpdateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public OrganizerUpdateCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<OrganizerUpdateResponse> Handle(OrganizerUpdateCommand request, CancellationToken cancellationToken)
        {
            var organizer = await _unitOfWork.Organizers.GetAllAsync().Include(x => x.Events).FirstOrDefaultAsync(x => x.Id == request.Id);
            if(organizer == null)
            {
                return new OrganizerUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found"
                };
            }

            if (organizer.IsDeleted)
            {
                return new OrganizerUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is deleted"
                };
            }

            //var checkEmail = await _unitOfWork.Organizers.GetAllAsync().FirstOrDefaultAsync(x => x.Email == request.Email);
            //if (checkEmail != null)
            //{
            //    return new OrganizerUpdateResponse
            //    {
            //        IsSuccess = false,
            //        Message = "Email is belong to other companies, please check again!"
            //    };
            //}

            //var checkPhone = await _unitOfWork.Organizers.GetAllAsync().FirstOrDefaultAsync(x => x.Phone == request.Phone);
            //if (checkPhone != null)
            //{
            //    return new OrganizerUpdateResponse
            //    {
            //        IsSuccess = false,
            //        Message = "This phone number is belong to other companies, please check again"
            //    };
            //}

            organizer.Name = request.Name;
            organizer.Slug = request.Slug;
            organizer.Description = request.Description;
            organizer.LogoUrl = request.LogoUrl;
            organizer.BannerUrl = request.BannerUrl;
            organizer.Email = request.Email;
            organizer.Phone = request.Phone;
            organizer.WebsiteUrl = request.WebsiteUrl;
            organizer.FacebookUrl = request.FacebookUrl;
            organizer.InstagramUrl = request.InstagramUrl;
            organizer.TiktokUrl = request.TiktokUrl;
            organizer.Address = request.Address;
            organizer.IsVerified = request.IsVerified;
            organizer.Status = request.Status;
            organizer.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                _unitOfWork.Organizers.UpdateAsync(organizer);
                await _unitOfWork.CommitTransactionAsync();
                return new OrganizerUpdateResponse
                {
                    IsSuccess = true,
                    Message = "Update Organizer Successfully",
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
                return new OrganizerUpdateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
