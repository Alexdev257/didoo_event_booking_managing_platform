using EventService.Application.CQRS.Command.EventInteraction;
using EventService.Application.DTOs.Response.EventUserInteraction;
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
    public class InteractionDeleteCommandHandler : IRequestHandler<InteractionDeleteCommand, InteractionDeleteResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public InteractionDeleteCommandHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }
        public async Task<InteractionDeleteResponse> Handle(InteractionDeleteCommand request, CancellationToken cancellationToken)
        {
            var interaction = await _unitOfWork.UserEventInteractions.GetAllAsync()
                                                .Include(x => x.Event)
                                                .FirstOrDefaultAsync(x => x.UserId == request.UserId &&
                                                                          x.EventId == request.EventId &&
                                                                          x.Type == request.Type);
            if (interaction == null)
            {
                return new InteractionDeleteResponse
                {
                    IsSuccess = false,
                    Message = $"User is not interacted for this event"
                };
            }
            //if (interaction != null && interaction.IsDeleted)
            //{
            //    return new InteractionDeleteResponse
            //    {
            //        IsSuccess = false,
            //        Message = $"User is {interaction.Type.ToString().ToLower()}d for this event but its deleted"
            //    };
            //}
            try
            {
                var userRequest = new UserRequest { UserId = request.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new InteractionDeleteResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }
                var data = new InteractionDTO
                {
                    Id = interaction.Id.ToString(),
                    User = new InteractionUserDTO
                    {
                        Id = userResponse.Id,
                        AvatarUrl = userResponse.AvatarUrl,
                        FullName = userResponse.FullName,
                        Gender = Int32.Parse(userResponse.Gender),
                    },
                    Event = new InteractionEventDTO
                    {
                        Id = interaction.Event.Id.ToString(),
                        Name = interaction.Event.Name,
                        Description = interaction.Event.Description,
                        Slug = interaction.Event.Slug,
                        Subtitle = interaction.Event.Subtitle,
                    },
                    Type = interaction.Type,
                };
                await _unitOfWork.BeginTransactionAsync();
                _unitOfWork.UserEventInteractions.DeleteAsync(interaction);
                await _unitOfWork.CommitTransactionAsync();
                return new InteractionDeleteResponse
                {
                    IsSuccess = true,
                    Message = "Delete Interaction Successfully",
                    Data = data
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new InteractionDeleteResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {request.UserId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new InteractionDeleteResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
