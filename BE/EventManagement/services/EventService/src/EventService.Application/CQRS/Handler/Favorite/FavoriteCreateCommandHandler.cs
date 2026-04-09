using EventService.Application.CQRS.Command.FavoriteEvent;
using EventService.Application.DTOs.Response.EventReview;
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
    public class FavoriteCreateCommandHandler : IRequestHandler<FavoriteCreateCommand, FavoriteCreateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public FavoriteCreateCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<FavoriteCreateResponse> Handle(FavoriteCreateCommand request, CancellationToken cancellationToken)
        {
            var checkDuplicate = _unitOfWork.FavoriteEvents.GetAllAsync().Where(x => x.UserId == request.UserId && x.EventId == request.EventId);
            var checkDeleted = await checkDuplicate.FirstOrDefaultAsync(x => x.IsDeleted);
            if (checkDeleted != null)
            {
                return new FavoriteCreateResponse
                {
                    IsSuccess = false,
                    Message = "Favorite is deleted. Please restore instead of create new one"
                };
            }
            if (checkDuplicate.Any())
            {
                return new FavoriteCreateResponse
                {
                    IsSuccess = false,
                    Message = "User added this Event to favorite already"
                };
            }
            
            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new FavoriteCreateResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                Console.WriteLine($"User Response: {userResponse.FullName}");

                var findEvent = await _unitOfWork.Events.GetAllAsync().FirstOrDefaultAsync(x => x.Id == request.EventId);
                if (findEvent == null)
                {
                    return new FavoriteCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                if (findEvent.IsDeleted)
                {
                    return new FavoriteCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Event is deleted"
                    };
                }

                var favorite = new EventService.Domain.Entities.FavoriteEvent
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    EventId = request.EventId,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.BeginTransactionAsync();
                await _unitOfWork.FavoriteEvents.AddAsync(favorite);
                await _unitOfWork.CommitTransactionAsync();
                return new FavoriteCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Favorite Successfully",
                    Data = new FavoriteDTO
                    {
                        Id = favorite.Id.ToString(),
                        User = new FavoriteUserDTO
                        {
                            Id = userResponse.Id,
                            FullName = userResponse.FullName,
                            AvatarUrl = userResponse.AvatarUrl,
                            Gender = Int32.Parse(userResponse.Gender),
                        },
                        Event = new FavoriteEventDTO
                        {
                            Id = findEvent.Id.ToString(),
                            Name = findEvent.Name,
                            Slug = findEvent.Slug,
                            Description = findEvent.Description,
                            Subtitle = findEvent.Subtitle
                        },
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new FavoriteCreateResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new FavoriteCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
