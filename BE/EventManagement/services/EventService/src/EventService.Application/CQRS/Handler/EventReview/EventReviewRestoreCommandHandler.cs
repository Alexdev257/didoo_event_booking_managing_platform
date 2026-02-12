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
    public class EventReviewRestoreCommandHandler : IRequestHandler<EventReviewRestoreCommand, EventReviewRestoreResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        public EventReviewRestoreCommandHandler(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<EventReviewRestoreResponse> Handle(EventReviewRestoreCommand request, CancellationToken cancellationToken)
        {
            var review = await _unitOfWork.EventReviews.GetAllAsync().Include(x => x.ParentReview).Include(x => x.Replies).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (review == null)
            {
                return new EventReviewRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Review is not found"
                };
            }

            if (!review.IsDeleted)
            {
                return new EventReviewRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Review is not deleted"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                review.IsDeleted = false;
                review.DeletedAt = null;
                _unitOfWork.EventReviews.UpdateAsync(review);
                if (review.Replies != null && review.Replies.Any())
                {
                    foreach (var reply in review.Replies)
                    {
                        reply.IsDeleted = false;
                        reply.DeletedAt = null;
                        _unitOfWork.EventReviews.UpdateAsync(reply);
                    }
                }

                await _unitOfWork.CommitTransactionAsync();
                return new EventReviewRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Restore review and its reply successfully",
                    Data = new EventReviewDTO
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
                        Comment = review.Comment,
                        Rating = review.Rating,
                        ReasonDeleted = review.ReasonDeleted,
                        ParentReview = review.ParentReview != null ? new EventReviewDTO
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
                            ReasonDeleted = review.ParentReview.ReasonDeleted
                        } : null,
                        Replies = review.Replies != null ? review.Replies.Select(x => new EventReviewDTO
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
                        }).ToList() : new List<EventReviewDTO>()
                    }
                };
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new EventReviewRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = null,
                };
            }
        }
    }
}
