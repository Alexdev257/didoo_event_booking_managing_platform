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
    public class FavoriteRestoreCommandHandler : IRequestHandler<FavoriteRestoreCommand, FavoriteRestoreResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public FavoriteRestoreCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<FavoriteRestoreResponse> Handle(FavoriteRestoreCommand request, CancellationToken cancellationToken)
        {
            var favorite = await _unitOfWork.FavoriteEvents.GetAllAsync().Include(x => x.Event).FirstOrDefaultAsync(x => x.UserId == request.UserId && x.EventId == request.EventId);
            if (favorite == null)
            {
                return new FavoriteRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Favorite is not found"
                };
            }
            if (!favorite.IsDeleted)
            {
                return new FavoriteRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Favorite is not deleted"
                };
            }

            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new FavoriteRestoreResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                Console.WriteLine($"User Response: {userResponse.FullName}");

                await _unitOfWork.BeginTransactionAsync();
                favorite.IsDeleted = false;
                favorite.DeletedAt = null;
                _unitOfWork.FavoriteEvents.UpdateAsync(favorite);
                await _unitOfWork.CommitTransactionAsync();
                return new FavoriteRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Restore Favorite Successfully",
                    Data = new FavoriteDTO
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
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new FavoriteRestoreResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new FavoriteRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
