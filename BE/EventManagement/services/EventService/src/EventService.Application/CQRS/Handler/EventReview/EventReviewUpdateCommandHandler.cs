using EventService.Application.CQRS.Command.EventReview;
using EventService.Application.DTOs.Response.EventReview;
using EventService.Application.Interfaces.Repositories;
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
    public class EventReviewUpdateCommandHandler : IRequestHandler<EventReviewUpdateCommand, EventReviewUpdateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authClient;
        public EventReviewUpdateCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authClient)
        {
            _unitOfWork = unitOfWork;
            _authClient = authClient;
        }
        public async Task<EventReviewUpdateResponse> Handle(EventReviewUpdateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var eventReview = await _unitOfWork.EventReviews.GetAllAsync().Include(x => x.Event).FirstOrDefaultAsync(x => x.Id == request.Id);
                if (eventReview == null)
                {
                    return new EventReviewUpdateResponse
                    {
                        IsSuccess = false,
                        Message = "Review is not found"
                    };
                }

                if (eventReview.IsDeleted)
                {
                    return new EventReviewUpdateResponse
                    {
                        IsSuccess = false,
                        Message = "Review is deleted"
                    };
                }

                var userRequest = new UserRequest { UserId = eventReview.UserId.ToString() };
                var userResponse = await _authClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);
                if (userResponse == null)
                {
                    return new EventReviewUpdateResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                eventReview.Rating = request.Rating;
                eventReview.Comment = request.Comment;

                await _unitOfWork.BeginTransactionAsync();
                _unitOfWork.EventReviews.UpdateAsync(eventReview);
                await _unitOfWork.CommitTransactionAsync();
                return new EventReviewUpdateResponse
                {
                    IsSuccess = true,
                    Message = "Create Review Successfully",
                    Data = new EventReviewDTO
                    {
                        Id = eventReview.Id.ToString(),
                        User = new EventReviewUserDTO
                        {
                            Id = userResponse.Id,
                            FullName = userResponse.FullName,
                            AvatarUrl = userResponse.AvatarUrl,
                            Gender = Int32.Parse(userResponse.Gender),
                        },
                        Event = new EventReviewEventDTO
                        {
                            Id = eventReview.Event.Id.ToString(),
                            Name = eventReview.Event.Name,
                            Slug = eventReview.Event.Slug,
                            Description = eventReview.Event.Description,
                            Subtitle = eventReview.Event.Subtitle
                        },
                        Rating = eventReview.Rating,
                        Comment = eventReview.Comment,
                        ReasonDeleted = eventReview.ReasonDeleted,
                        ParentReview = null,
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                // AuthService trả về lỗi NotFound -> User không tồn tại
                //return Result.Failure($"User with ID {request.UserId} does not exist.");
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewUpdateResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID does not exist.",
                };
            }
            catch (Exception)
            {
                // Lỗi mạng hoặc AuthService chưa bật -> Tùy bạn quyết định cho qua hay chặn lại
                //return Result.Failure("Cannot verify User identity. Auth Service is unavailable.");
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewUpdateResponse
                {
                    IsSuccess = false,
                    Message = "Cannot verify User identity. Auth Service is unavailable.",
                };
            }
        }
    }
}
