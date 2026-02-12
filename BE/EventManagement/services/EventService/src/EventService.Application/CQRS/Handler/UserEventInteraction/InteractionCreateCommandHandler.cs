using EventService.Application.CQRS.Command.EventInteraction;
using EventService.Application.DTOs.Response.EventUserInteraction;
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

namespace EventService.Application.CQRS.Handler.UserEventInteraction
{
    public class InteractionCreateCommandHandler : IRequestHandler<InteractionCreateCommand, InteractionCreateResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public InteractionCreateCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }

        public async Task<InteractionCreateResponse> Handle(InteractionCreateCommand request, CancellationToken cancellationToken)
        {
            var interaction = await _unitOfWork.UserEventInteractions.GetAllAsync()
                                                .Include(x => x.Event)
                                                .FirstOrDefaultAsync(x => x.UserId == request.UserId &&
                                                                          x.EventId == request.EventId &&
                                                                          x.Type == request.Type);

            if(interaction != null && !interaction.IsDeleted)
            {
                return new InteractionCreateResponse
                {
                    IsSuccess = false,
                    Message = $"User is {interaction.Type.ToString().ToLower()}d for this event"
                };
            }
            if(interaction != null && interaction.IsDeleted)
            {
                return new InteractionCreateResponse
                {
                    IsSuccess = false,
                    Message = $"User is {interaction.Type.ToString().ToLower()}d for this event but its deleted, please restore instead of creating new one"
                };
            }
            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new InteractionCreateResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }

                var interactionEntity = new EventService.Domain.Entities.UserEventInteraction
                {
                    Id = Guid.NewGuid(),
                    UserId = request.UserId,
                    EventId = request.EventId,
                    Type = request.Type,
                    CreatedAt = DateTime.UtcNow,
                };

                var eventEntity = await _unitOfWork.Events.GetByIdAsync(interactionEntity.EventId);

                Console.WriteLine($"User Response: {userResponse.FullName}");
                await _unitOfWork.BeginTransactionAsync();
                await _unitOfWork.UserEventInteractions.AddAsync(interactionEntity);
                await _unitOfWork.CommitTransactionAsync();
                return new InteractionCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Interaction Successfully",
                    Data = new InteractionDTO
                    {
                        Id = interactionEntity.Id.ToString(),
                        User = new InteractionUserDTO
                        {
                            Id = userResponse.Id,
                            AvatarUrl = userResponse.AvatarUrl,
                            FullName = userResponse.FullName,
                            Gender = Int32.Parse(userResponse.Gender),
                        },
                        Event = new InteractionEventDTO
                        {
                            Id = eventEntity.Id.ToString(),
                            Name = eventEntity.Name,
                            Description = eventEntity.Description,
                             Slug = eventEntity.Slug,
                             Subtitle = eventEntity.Subtitle
                        },
                        Type = interactionEntity.Type,
                    }
                };
                
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new InteractionCreateResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new InteractionCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
