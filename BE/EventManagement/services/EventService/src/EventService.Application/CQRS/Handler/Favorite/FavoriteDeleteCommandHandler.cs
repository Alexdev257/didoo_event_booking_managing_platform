using EventService.Application.CQRS.Command.FavoriteEvent;
using EventService.Application.DTOs.Response.FavoriteEvent;
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

namespace EventService.Application.CQRS.Handler.Favorite
{
    public class FavoriteDeleteCommandHandler : IRequestHandler<FavoriteDeleteCommand, FavoriteDeleteResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public FavoriteDeleteCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<FavoriteDeleteResponse> Handle(FavoriteDeleteCommand request, CancellationToken cancellationToken)
        {
            var favorite = await _unitOfWork.FavoriteEvents.GetAllAsync().Include(x => x.Event).FirstOrDefaultAsync(x => x.UserId == request.UserId && x.EventId == request.EventId);
            if (favorite == null)
            {
                return new FavoriteDeleteResponse
                {
                    IsSuccess = false,
                    Message = "Favorite is not found"
                };
            }
            //if (favorite.IsDeleted)
            //{
            //    return new FavoriteDeleteResponse
            //    {
            //        IsSuccess = false,
            //        Message = "Favorite is deleted"
            //    };
            //}

            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new FavoriteDeleteResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                Console.WriteLine($"User Response: {userResponse.FullName}");

                var data = new FavoriteDTO
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

                await _unitOfWork.BeginTransactionAsync();
                _unitOfWork.FavoriteEvents.DeleteAsync(favorite);
                await _unitOfWork.CommitTransactionAsync();
                return new FavoriteDeleteResponse
                {
                    IsSuccess = true,
                    Message = "Delete Favorite Successfully",
                    Data = data
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new FavoriteDeleteResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new FavoriteDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
