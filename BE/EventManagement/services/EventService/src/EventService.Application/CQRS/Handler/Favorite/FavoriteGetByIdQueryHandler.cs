using EventService.Application.CQRS.Query.FavoriteEvent;
using EventService.Application.DTOs.Response.FavoriteEvent;
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

namespace EventService.Application.CQRS.Handler.Favorite
{
    public class FavoriteGetByIdQueryHandler : IRequestHandler<FavoriteGetByIdQuery, FavoriteGetByIdResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public FavoriteGetByIdQueryHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<FavoriteGetByIdResponse> Handle(FavoriteGetByIdQuery request, CancellationToken cancellationToken)
        {
            var favorite = await _unitOfWork.FavoriteEvents.GetAllAsync().Include(x => x.Event).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (favorite == null)
            {
                return new FavoriteGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Favorite is not found"
                };
            }
            if (favorite.IsDeleted)
            {
                return new FavoriteGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Favorite is deleted"
                };
            }

            try
            {
                var userRequest = new UserRequest { UserId = favorite.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new FavoriteGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                Console.WriteLine($"User Response: {userResponse.FullName}");

                var dto = new FavoriteDTO
                {
                    Id = favorite.Id.ToString(),
                    User = new FavoriteUserDTO
                    {
                        Id = userResponse.Id,
                        AvatarUrl = userResponse.AvatarUrl,
                        FullName = userResponse.FullName,
                        Gender = Int32.Parse(userResponse.Gender),
                    },
                    Event = new FavoriteEventDTO
                    {
                        Id = favorite.Event.Id.ToString(),
                        Name = favorite.Event.Name,
                        Slug = favorite.Event.Slug,
                        Description = favorite.Event.Description,
                        Subtitle = favorite.Event.Subtitle,
                    }
                };

                var shapedData = DataShaper.ShapeData(dto, request.Fields);
                return new FavoriteGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Get Favorite By Id Successfully",
                    Data = shapedData
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                return new FavoriteGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {favorite.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                return new FavoriteGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
