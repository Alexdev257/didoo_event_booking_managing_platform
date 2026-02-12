using EventService.Application.CQRS.Query.EventReview;
using EventService.Application.DTOs.Response.EventReview;
using EventService.Application.Interfaces.Repositories;
using Grpc.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.EventReview
{
    public class EventReviewGetByIdQueryHandler : IRequestHandler<EventReviewGetByIdQuery, EventReviewGetByIdResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public EventReviewGetByIdQueryHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<EventReviewGetByIdResponse> Handle(EventReviewGetByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var review = await _unitOfWork.EventReviews.GetAllAsync().Include(x => x.Event).Include(x => x.ParentReview).Include(x => x.Replies).FirstOrDefaultAsync(x => x.Id == request.Id);
                if(review == null)
                {
                    return new EventReviewGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "Review is not found"
                    };
                }
                if (review.IsDeleted)
                {
                    return new EventReviewGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "Review is deleted"
                    };
                }

                var userRequest = new UserRequest { UserId = review.UserId.ToString() };
                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new EventReviewGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                var dto = new EventReviewDTO
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
                        Id = review.Event.Id.ToString(),
                        Name = review.Event.Name,
                        Slug = review.Event.Slug,
                        Subtitle = review.Event.Subtitle,
                        Description = review.Event.Description,
                    },
                    Comment = review.Comment,
                    Rating = review.Rating,
                    ParentReview = (review.ParentReview != null && request.HasParent.Value == true) ? new EventReviewDTO
                    {
                        Id = review.ParentReview.Id.ToString(),
                        User = new EventReviewUserDTO
                        {
                            Id = review.ParentReview.UserId.ToString(),
                        },
                        Event = new EventReviewEventDTO
                        {
                            Id = review.ParentReview.EventId.ToString(),
                        },
                        Comment = review.ParentReview.Comment,
                        Rating = review.ParentReview.Rating,
                    } : null,
                    Replies = ((review.Replies != null && review.Replies.Any()) && request.HasReplies.Value == true) ? review.Replies.Select(x => new EventReviewDTO
                    {
                        Id = x.Id.ToString(),
                        User = new EventReviewUserDTO
                        {
                            Id = x.UserId.ToString(),
                        },
                        Event = new EventReviewEventDTO
                        {
                            Id = x.EventId.ToString(),
                        },
                        Comment = x.Comment,
                        Rating= x.Rating,
                    }).ToList() : new List<EventReviewDTO>(),
                };

                var shapedData = DataShaper.ShapeData(dto, request.Fields);

                return new EventReviewGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Create Review Successfully",
                    Data = shapedData
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
