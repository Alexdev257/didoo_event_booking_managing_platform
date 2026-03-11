using EventService.Application.CQRS.Command.Organizer;
using EventService.Application.DTOs.Response.Organizer;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Events;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Organizer
{
    public class OrganizerVerifyCommandHandler : IRequestHandler<OrganizerVerifyCommand, OrganizerVerifyResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly IMessageProducer _messageProducer;
        public OrganizerVerifyCommandHandler(IEventUnitOfWork unitOfWork, IMessageProducer messageProducer)
        { 
            _unitOfWork = unitOfWork;
            _messageProducer = messageProducer;
        }
        public async Task<OrganizerVerifyResponse> Handle(OrganizerVerifyCommand request, CancellationToken cancellationToken)
        {
            var organizer = await _unitOfWork.Organizers.GetAllAsync().Include(x => x.Events).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (organizer == null)
            {
                return new OrganizerVerifyResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is not found"
                };
            }

            if (organizer.IsDeleted)
            {
                return new OrganizerVerifyResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is deleted"
                };
            }

            if (organizer.IsVerified.HasValue && organizer.IsVerified.Value == true)
            {
                return new OrganizerVerifyResponse
                {
                    IsSuccess = false,
                    Message = "Organizer is already verified"
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
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                organizer.IsVerified = true;
                organizer.Status = Domain.Enum.OrganizerStatusEnum.Verified;
                _unitOfWork.Organizers.UpdateAsync(organizer);
                await _unitOfWork.CommitTransactionAsync();

                // Publish notification event
                await _messageProducer.PublishAsync(new OrganizerVerifiedNotificationEvent
                {
                    OrganizerId = organizer.Id,
                    UserId = organizer.CreatedBy ?? Guid.Empty,
                    OrganizerName = organizer.Name ?? string.Empty
                }, cancellationToken);
                return new OrganizerVerifyResponse
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
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new OrganizerVerifyResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
