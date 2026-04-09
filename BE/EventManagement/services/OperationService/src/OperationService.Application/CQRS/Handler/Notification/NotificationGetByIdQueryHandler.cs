using Grpc.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OperationService.Application.CQRS.Query.Notification;
using OperationService.Application.DTOs.Response.Notification;
using OperationService.Application.Interfaces.Repositories;
using OperationService.Domain.Enum;
using SharedContracts.Protos;
using SharedInfrastructure.Extensions;
using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;


namespace OperationService.Application.CQRS.Handler.Notification
{
    public class NotificationGetByIdQueryHandler : IRequestHandler<NotificationGetByIdQuery, NotificationGetByIdResponse>
    {
        private readonly IOperationUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authClient;
        private readonly EventGrpc.EventGrpcClient _eventClient;

        public NotificationGetByIdQueryHandler(
            IOperationUnitOfWork unitOfWork,
            AuthGrpc.AuthGrpcClient authClient,
            EventGrpc.EventGrpcClient eventClient)
        {
            _unitOfWork = unitOfWork;
            _authClient = authClient;
            _eventClient = eventClient;
        }

        public async Task<NotificationGetByIdResponse> Handle(NotificationGetByIdQuery request, CancellationToken cancellationToken)
        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(request.Id);

            if (notification == null)
            {
                return new NotificationGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Notification not found"
                };
            }

            var dto = new NotificationDTO
            {
                Id = notification.Id.ToString(),
                //UserId = notification.UserId,
                //EventId = notification.EventId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type.ToString(),
                RelatedId = notification.RelatedId?.ToString(),

                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            try
            {
                var userRequest = new UserRequest { UserId = notification.UserId.ToString() };
                var userResponse = await _authClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);
                
                if (userResponse != null)
                {
                    Console.WriteLine($"--------------------------{userResponse.FullName}--------------------------");
                    dto.User = new NotificationUserDTO
                    {
                        Id = userResponse.Id,
                        FullName = userResponse.FullName,
                        AvatarUrl = userResponse.AvatarUrl,
                        Gender = int.TryParse(userResponse.Gender, out var g) ? g : null
                    };
                }
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                return new NotificationGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {notification.UserId} does not exist."
                };
            }
            catch (Exception ex)
            {
                return new NotificationGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }

            try
            {
                var eventRequest = new EventRequest { EventId = notification.EventId.Value.ToString() };
                var eventResponse = await _eventClient.GetEventDetailAsync(eventRequest, cancellationToken: cancellationToken);
                if (eventResponse != null)
                {
                    Console.WriteLine($"--------------------------{eventResponse.Name}--------------------------");
                    dto.Event = new NotificationEventDTO
                    {
                        Id = eventResponse.Id,
                        Name = eventResponse.Name,
                        ThumbnailUrl = eventResponse.ThumbnailUrl
                    };
                }
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                return new NotificationGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {notification.EventId} does not exist."
                };
            }
            catch (Exception ex)
            {
                return new NotificationGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }

            var shapedData = DataShaper.ShapeData(dto, request.Fields);

            return new NotificationGetByIdResponse { Data = shapedData };
        }
    }
}


