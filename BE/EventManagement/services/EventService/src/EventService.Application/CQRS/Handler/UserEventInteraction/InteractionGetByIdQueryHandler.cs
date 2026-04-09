using EventService.Application.CQRS.Query.UserEventInteraction;
using EventService.Application.DTOs.Response.EventUserInteraction;
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

namespace EventService.Application.CQRS.Handler.UserEventInteraction
{
    public class InteractionGetByIdQueryHandler : IRequestHandler<InteractionGetByIdQuery, InteractionGetByIdResponse>
    {
        private readonly IEventUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;
        public InteractionGetByIdQueryHandler(IEventUnitOfWork unitOfWork, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _authGrpcClient = authGrpcClient;
        }

        public async Task<InteractionGetByIdResponse> Handle(InteractionGetByIdQuery request, CancellationToken cancellationToken)
        {
            var interaction = await _unitOfWork.UserEventInteractions.GetAllAsync()
                                                .Include(x => x.Event)
                                                .FirstOrDefaultAsync(x => x.Id == request.Id);
            if (interaction == null)
            {
                return new InteractionGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"User is not interacted for this event"
                };
            }
            if (interaction.IsDeleted)
            {
                return new InteractionGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"User is {interaction.Type.ToString().ToLower()}d for this event but its deleted"
                };
            }
            try
            {
                var userRequest = new UserRequest { UserId = interaction.UserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new InteractionGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }
                var dto = new InteractionDTO
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
                var shapedData = DataShaper.ShapeData(dto, request.Fields);
                return new InteractionGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Get Interaction By Id Successfully",
                    Data = shapedData
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new InteractionGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"User with ID {interaction.Id} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new InteractionGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
