using EventService.Application.CQRS.Command.Organizer;
using EventService.Application.DTOs.Response.EventUserInteraction;
using EventService.Application.DTOs.Response.Organizer;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using Grpc.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Events;
using SharedContracts.Interfaces;
using SharedContracts.Protos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace EventService.Application.CQRS.Handler.Organizer
{
    public class OrganizerCreateCommandHandler : IRequestHandler<OrganizerCreateCommand, OrganizerCreateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly IMessageProducer _messageProducer;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public OrganizerCreateCommandHandler(IEventUnitOfWork unitOfWork, IMessageProducer messageProducer, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _messageProducer = messageProducer;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<OrganizerCreateResponse> Handle(OrganizerCreateCommand request, CancellationToken cancellationToken)
        {
            var checkEmail = await _unitOfWork.Organizers.GetAllAsync().FirstOrDefaultAsync(x => x.Email == request.Email);
            if (checkEmail != null)
            {
                return new OrganizerCreateResponse
                {
                    IsSuccess = false,
                    Message = "Email is belong to other companies, please check again!"
                };
            }

            var checkPhone = await _unitOfWork.Organizers.GetAllAsync().Include(x => x.Events).FirstOrDefaultAsync(x => x.Phone == request.Phone);
            if(checkPhone != null)
            {
                return new OrganizerCreateResponse
                {
                    IsSuccess = false,
                    Message = "This phone number is belong to other companies, please check again"
                };
            }

            var id = Guid.NewGuid();
            var organizer = new EventService.Domain.Entities.Organizer
            {
                Id = id,
                Name = request.Name,
                Slug = request.Slug,
                Description = request.Description,
                LogoUrl = request.LogoUrl,
                BannerUrl = request.BannerUrl,
                Email = request.Email,
                Phone = request.Phone,
                WebsiteUrl = request.WebsiteUrl,
                FacebookUrl = request.FacebookUrl,
                InstagramUrl = request.InstagramUrl,
                TiktokUrl = request.TiktokUrl,
                Address = request.Address,
                IsVerified = request.IsVerified,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow,
                
            };

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new OrganizerCreateResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }
                await _unitOfWork.Organizers.AddAsync(organizer);
                await _unitOfWork.CommitTransactionAsync();
                await _messageProducer.PublishAsync<OrganizerCreatedEvent>(new OrganizerCreatedEvent(request.UserId, id), cancellationToken);
                if(request.HasSendEmail.HasValue && request.HasSendEmail.Value == true)
                {
                    var adminRequest = new GetAdminEmailsRequest();
                    var adminResponse = await _authGrpcClient.GetAdminEmailsAsync(adminRequest, cancellationToken: cancellationToken);
                    if (!adminResponse.Emails.Any())
                    {
                        return new OrganizerCreateResponse
                        {
                            IsSuccess = false,
                            Message = "Admins do not exist"
                        };
                    }
                    await _messageProducer.PublishAsync<SendEmailOpenOrganizerToAdminEvent>(new SendEmailOpenOrganizerToAdminEvent(userResponse.FullName, adminResponse.Emails.ToList(), request.Name, id), cancellationToken);
                }
                return new OrganizerCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Organizer Successfully",
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
                        Events = null /*organizer.Events.Any() ? organizer.Events.Select(x => new OrganizerEventDTO
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
                        }).ToList() : null*/,
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new OrganizerCreateResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                return new OrganizerCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
