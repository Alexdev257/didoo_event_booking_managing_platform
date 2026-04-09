using EventService.Application.CQRS.Query.EventReview;
//using EventService.Application.DTOs.Response.Event;
using EventService.Application.DTOs.Response.EventReview;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using SharedContracts.Protos;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using Grpc.Core;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.EventReview
{
    public class EventReviewGetListQueryHandler : IRequestHandler<EventReviewGetListQuery, EventReviewGetListResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public EventReviewGetListQueryHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }

        public async Task<EventReviewGetListResponse> Handle(EventReviewGetListQuery request, CancellationToken cancellationToken)
        {
            var reviews = _unitOfWork.EventReviews.GetAllAsync()
                                            .Include(x => x.Event)
                                            .Include(x => x.ParentReview)
                                            .Include(x => x.Replies)
                                            .AsQueryable();
            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    reviews = reviews.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        reviews = reviews.Where(x => !x.IsDeleted);
                    }
                }
            }
            if (request.UserId != Guid.Empty)
            {
                reviews = reviews.Where(x => x.UserId == request.UserId);
            }
            if (request.UserId != Guid.Empty)
            {
                reviews = reviews.Where(x => x.EventId == request.EventId);
            }
            if (request.Rating.HasValue && request.Rating > 0)
            {
                reviews = reviews.Where(x => x.Rating == request.Rating);
            }
            if (!string.IsNullOrWhiteSpace(request.Comment))
            {
                reviews = reviews.Where(x => x.Comment.ToLower().Contains(request.Comment.ToLower()));
            }
            reviews = request.IsDescending == true
               ? reviews.OrderByDescending(x => x.CreatedAt)
               : reviews.OrderBy(x => x.CreatedAt);
            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                                reviews,
                                                request.PageNumber,
                                                request.PageSize,
                                                review => new EventReviewDTO
                                                {
                                                    Id = review.Id.ToString(),
                                                    User = new EventReviewUserDTO
                                                    {
                                                        Id = review.UserId.ToString(),
                                                        //FullName = userResponse.FullName,
                                                        //AvatarUrl = userResponse.AvatarUrl,
                                                        //Gender = Int32.Parse(userResponse.Gender),
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
                                                        Rating = x.Rating,
                                                    }).ToList() : new List<EventReviewDTO>(),
                                                },
                                                request.Fields);
            return new EventReviewGetListResponse
            {
                IsSuccess = false,
                Message = "Retrieve Reviews Successfully",
                Data = pagedList,
            };

            //var pagedList = await QueryableExtensions.ToPagedEntityListAsync(reviews, request.PageNumber, request.PageSize);
            //var userIds = pagedList.Items.Select(r => r.UserId)
            //    .Union(reviews.Where(r => r.ParentReview != null).Select(r => r.ParentReview!.UserId))
            //    .Union(reviews.SelectMany(r => r.Replies).Select(rep => rep.UserId))
            //    .Distinct()
            //    .ToList();

            //var usersDict = await GetUsersDictionaryAsync(userIds, cancellationToken);
            //var reviewDtos = pagedList.Items.Select(review => MapToDto(review, usersDict)).ToList();
            //var shapedData = reviewDtos.Select(dto => DataShaper.ShapeData(dto, request.Fields)).ToList();
            //return new EventReviewGetListResponse
            //{
            //    IsSuccess = true,
            //    Message = "Retrieve Reviews Successfully",
            //    Data = new SharedContracts.Common.Wrappers.PaginationResponse<object>
            //    {
            //        Items = shapedData,
            //        PageNumber = pagedList.PageNumber,
            //        PageSize = pagedList.PageSize,
            //        TotalItems = pagedList.TotalItems,
            //    },
            //};
        }

        private EventReviewDTO MapToDto(EventService.Domain.Entities.EventReview review, Dictionary<Guid, EventReviewUserDTO> usersDict)
        {
            // Lấy user tương ứng (nếu không tìm thấy thì new object rỗng để tránh null)
            var userDto = usersDict.TryGetValue(review.UserId, out var u) ? u : new EventReviewUserDTO { Id = review.UserId.ToString() };

            return new EventReviewDTO
            {
                Id = review.Id.ToString(),
                User = userDto, // Đã có thông tin user
                Event = new EventReviewEventDTO
                {
                    Id = review.EventId.ToString(),
                    Name = review.Event?.Name,
                    Slug = review.Event?.Slug
                    // ... map các field event khác
                },
                Rating = review.Rating,
                Comment = review.Comment,
                // Đệ quy map ParentReview
                ParentReview = (review.ParentReview != null) ? MapToDto(review.ParentReview, usersDict) : null,
                // Map Replies
                Replies = review.Replies?.Select(rep => MapToDto(rep, usersDict)).ToList() ?? new List<EventReviewDTO>()
            };
        }

        // Hàm giả lập gọi gRPC lấy danh sách User (Bạn cần update Proto để hỗ trợ hàm này)
        private async Task<Dictionary<Guid, EventReviewUserDTO>> GetUsersDictionaryAsync(List<Guid> userIds, CancellationToken cancellationToken)
        {
            if (!userIds.Any()) return new Dictionary<Guid, EventReviewUserDTO>();

            try
            {
                // Tạo request gRPC (Bạn cần sửa file .proto để có message GetUsersRequest nhận list string id)
                var grpcRequest = new GetUsersRequest();
                grpcRequest.UserIds.AddRange(userIds.Select(id => id.ToString()));

                // Gọi sang Auth
                var grpcResponse = await _authGrpcClient.GetUsersByIdsAsync(grpcRequest, cancellationToken: cancellationToken);

                // Chuyển đổi sang Dictionary để tra cứu cho nhanh (Key = UserId)
                return grpcResponse.Users.ToDictionary(
                    u => Guid.Parse(u.Id),
                    u => new EventReviewUserDTO
                    {
                        Id = u.Id,
                        FullName = u.FullName,
                        AvatarUrl = u.AvatarUrl,
                        Gender = int.TryParse(u.Gender, out int g) ? g : 0 // Parse an toàn
                    }
                );
            }
            catch (Exception ex)
            {
                // Log error nếu cần, trả về dict rỗng để code không chết
                return new Dictionary<Guid, EventReviewUserDTO>();
            }
        }
    }
}
