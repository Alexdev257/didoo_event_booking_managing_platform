using EventService.Application.CQRS.Command.EventReview;
using EventService.Application.DTOs.Response.EventReview;
using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Entities;
using Grpc.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.EventReview
{
    public class EventReviewCreateCommandHandler : IRequestHandler<EventReviewCreateCommand, EventReviewCreateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authClient;
        public EventReviewCreateCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authClient)
        {
            _unitOfWork = unitOfWork;
            _authClient = authClient;
        }
        public async Task<EventReviewCreateResponse> Handle(EventReviewCreateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                // Nếu code chạy đến dòng này nghĩa là User TỒN TẠI.
                // Bạn có thể lấy tên user để lưu vào review nếu cần:
                // var reviewerName = userResponse.FullName;

                if(userResponse == null)
                {
                    return new EventReviewCreateResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                Console.WriteLine($"User Response: {userResponse.FullName}");

                var findEvent = await _unitOfWork.Events.GetAllAsync().FirstOrDefaultAsync(x => x.Id == request.EventId);
                if(findEvent == null)
                {
                    return new EventReviewCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                if (findEvent.IsDeleted)
                {
                    return new EventReviewCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Event is deleted"
                    };
                }

                var review = new EventService.Domain.Entities.EventReview
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    EventId = request.EventId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    ReasonDeleted = request.ReasonDeleted,
                    ParentReviewId = request.ParentReviewId,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.BeginTransactionAsync();
                await _unitOfWork.EventReviews.AddAsync(review);
                await _unitOfWork.CommitTransactionAsync();
                return new EventReviewCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Review Successfully",
                    Data = new EventReviewDTO
                    {
                        Id = review.Id.ToString(),
                        User = new EventReviewUserDTO
                        {
                            Id = userResponse.Id,
                            FullName = userResponse.FullName,
                            AvatarUrl = userResponse.AvatarUrl,
                            Gender = Int32.Parse(userResponse.Gender),
                        }, 
                        Event = new EventReviewEventDTO
                        {
                            Id = findEvent.Id.ToString(),
                            Name = findEvent.Name,
                            Slug = findEvent.Slug,
                            Description = findEvent.Description,
                            Subtitle = findEvent.Subtitle
                        },
                        Rating = request.Rating,
                        Comment = request.Comment,
                        ReasonDeleted = request.ReasonDeleted,
                        ParentReview = null,
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewCreateResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
