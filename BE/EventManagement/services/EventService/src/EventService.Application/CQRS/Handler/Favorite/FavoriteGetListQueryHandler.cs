using EventService.Application.CQRS.Query.FavoriteEvent;
using EventService.Application.DTOs.Response.FavoriteEvent;
using EventService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Handler.Favorite
{
    public class FavoriteGetListQueryHandler : IRequestHandler<FavoriteGetListQuery, FavoriteGetListResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public FavoriteGetListQueryHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<FavoriteGetListResponse> Handle(FavoriteGetListQuery request, CancellationToken cancellationToken)
        {
            var favorites = _unitOfWork.FavoriteEvents.GetAllAsync().Include(x => x.Event).AsQueryable();
            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    favorites = favorites.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        favorites = favorites.Where(x => !x.IsDeleted);
                    }
                }
            }
            if(request.UserId != null && request.UserId != Guid.Empty)
            {
                favorites = favorites.Where(x => x.UserId == request.UserId);
            }
            if(request.EventId != null && request.EventId  != Guid.Empty)
            {
                favorites = favorites.Where(x => x.EventId == request.EventId);
            }
            if (request.IsDescending.HasValue && request.IsDescending == true)
            {
                favorites = favorites.OrderByDescending(x => x.CreatedAt); 
            }
            else
            {
                favorites = favorites.OrderBy(x => x.CreatedAt);
            }
            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                    favorites,
                                    request.PageNumber,
                                    request.PageSize,
                                    x => new FavoriteDTO
                                    {
                                        Id = x.Id.ToString(),
                                        User = new FavoriteUserDTO
                                        {
                                            Id = x.UserId.ToString(),
                                        },
                                        Event = new FavoriteEventDTO
                                        {
                                            Id = x.Event.Id.ToString(),
                                            Name = x.Event.Name,
                                            Slug = x.Event.Slug,
                                            Description = x.Event.Description,
                                            Subtitle = x.Event.Subtitle
                                        }
                                    },
                                    request.Fields);
            return new FavoriteGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Favorites Successfully",
                Data = pagedList
            };
        }
    }
}
