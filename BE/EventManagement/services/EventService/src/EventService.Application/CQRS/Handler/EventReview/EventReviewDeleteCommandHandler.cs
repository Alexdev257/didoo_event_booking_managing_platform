using EventService.Application.CQRS.Command.EventReview;
using EventService.Application.DTOs.Response.EventReview;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.EventReview
{
    public class EventReviewDeleteCommandHandler : IRequestHandler<EventReviewDeleteCommand, EventReviewDeleteResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventReviewDeleteCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventReviewDeleteResponse> Handle(EventReviewDeleteCommand request, CancellationToken cancellationToken)
        {
            var review = await _unitOfWork.EventReviews.GetAllAsync().Include(x => x.ParentReview).Include(x => x.Replies).FirstOrDefaultAsync(x => x.Id == request.Id);
            if(review == null)
            {
                return new EventReviewDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Review is not found"
                };
            }

            if (review.IsDeleted)
            {
                return new EventReviewDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Review is deleted"
                };
            }

            var data = new EventReviewDTO
            {
                Id = review.Id.ToString(),
                User = new EventReviewUserDTO
                {
                    Id = review.UserId.ToString(),
                },
                Event = new EventReviewEventDTO
                {
                    Id = review.EventId.ToString(),
                },
                Rating = review.Rating,
                Comment = review.Comment,
                ReasonDeleted = review.ReasonDeleted,
                ParentReview = review.ParentReview != null ? new EventReviewDTO
                {
                    Id = review.ParentReview.Id.ToString(),
                    User = new EventReviewUserDTO
                    {
                        Id =review.ParentReview.UserId.ToString(),
                    },
                    Event = new EventReviewEventDTO
                    {
                        Id = review.ParentReview.EventId.ToString(),
                    },
                    Comment = review.Comment,
                    Rating = review.Rating,
                    ReasonDeleted = review.ReasonDeleted,
                } : null,
                Replies = review.Replies.Any() ? review.Replies.Select(x => new EventReviewDTO
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
                    Rating = x.Rating,
                    ReasonDeleted = x.ReasonDeleted,
                }).ToList() : new List<EventReviewDTO>(),
            };

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if(review.Replies != null && review.Replies.Any())
                {
                    foreach(var reply in  review.Replies)
                    {
                        if (!reply.IsDeleted)
                        {
                            _unitOfWork.EventReviews.DeleteAsync(reply);
                        }
                    }
                }
                _unitOfWork.EventReviews.DeleteAsync(review);
                await _unitOfWork.CommitTransactionAsync();
                if (review.Replies != null && review.Replies.Any())
                {
                    return new EventReviewDeleteResponse
                    {
                        IsSuccess = false,
                        Message = "Delete review and its replies successfully",
                        Data = data
                    };
                }
                else
                {
                    return new EventReviewDeleteResponse
                    {
                        IsSuccess = false,
                        Message = "Delete review successfully",
                        Data = data
                    };
                }
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
