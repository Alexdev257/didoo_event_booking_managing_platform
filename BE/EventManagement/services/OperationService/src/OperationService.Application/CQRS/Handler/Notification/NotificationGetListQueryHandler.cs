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
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;


namespace OperationService.Application.CQRS.Handler.Notification
{
    public class NotificationGetListQueryHandler : IRequestHandler<NotificationGetListQuery, NotificationGetListResponse>
    {
        private readonly IOperationUnitOfWork _unitOfWork;
        private readonly AuthGrpc.AuthGrpcClient _authClient;
        private readonly EventGrpc.EventGrpcClient _eventClient;

        public NotificationGetListQueryHandler(
            IOperationUnitOfWork unitOfWork,
            AuthGrpc.AuthGrpcClient authClient,
            EventGrpc.EventGrpcClient eventClient)
        {
            _unitOfWork = unitOfWork;
            _authClient = authClient;
            _eventClient = eventClient;
        }

        public async Task<NotificationGetListResponse> Handle(NotificationGetListQuery request, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Notifications.GetAllAsync();

            if (request.UserId.HasValue) query = query.Where(n => n.UserId == request.UserId.Value);
            if (request.EventId.HasValue) query = query.Where(n => n.EventId == request.EventId.Value);
            if (!string.IsNullOrEmpty(request.Title)) query = query.Where(n => n.Title.Contains(request.Title));
            if (!string.IsNullOrEmpty(request.Message)) query = query.Where(n => n.Message.Contains(request.Message));
            if (request.IsRead.HasValue) query = query.Where(n => n.IsRead == request.IsRead.Value);
            if (request.IsDeleted.HasValue) query = query.Where(n => n.IsDeleted == request.IsDeleted.Value);

            if (request.IsDescending == true)
                query = query.OrderByDescending(n => n.CreatedAt);
            else
                query = query.OrderBy(n => n.CreatedAt);

            var notifications = await query.ToListAsync(cancellationToken);

            var dtos = notifications.Select(n => new NotificationDTO
            {
                Id = n.Id.ToString(),
                Title = n.Title,
                Message = n.Message,
                Type = n.Type.ToString(),
                RelatedId = n.RelatedId?.ToString(),

                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToList();

            try
            {
                var userIds = notifications.Select(n => n.UserId.ToString()).Distinct().ToList();
                var getUsersRequest = new GetUsersRequest();
                getUsersRequest.UserIds.AddRange(userIds);
                var usersResponse = await _authClient.GetUsersByIdsAsync(getUsersRequest, cancellationToken: cancellationToken);

                if (usersResponse != null && usersResponse.Users != null)
                {
                    var userMap = usersResponse.Users.ToDictionary(u => u.Id);
                    for (int i = 0; i < notifications.Count; i++)
                    {
                        if (userMap.TryGetValue(notifications[i].UserId.ToString(), out var user))
                        {
                            Console.WriteLine($"--------------------------{user.FullName}--------------------------");
                            dtos[i].User = new NotificationUserDTO
                            {
                                Id = user.Id,
                                FullName = user.FullName,
                                AvatarUrl = user.AvatarUrl,
                                Gender = int.TryParse(user.Gender, out var g) ? g : null
                            };
                        }
                    }
                }
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                return new NotificationGetListResponse
                {
                    IsSuccess = false,
                    Message = "One or more users not found."
                };
            }
            catch (Exception ex)
            {
                return new NotificationGetListResponse
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }

            var eventIds = notifications.Where(n => n.EventId.HasValue).Select(n => n.EventId.Value.ToString()).Distinct().ToList();
            var eventMap = new Dictionary<string, EventResponse>();

            foreach (var eventId in eventIds)
            {
                try
                {
                    var eventRequest = new EventRequest { EventId = eventId };
                    var eventResponse = await _eventClient.GetEventDetailAsync(eventRequest, cancellationToken: cancellationToken);
                    if (eventResponse != null)
                    {
                        Console.WriteLine($"--------------------------{eventResponse.Name}--------------------------");
                        eventMap[eventId] = eventResponse;
                    }
                }
                catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
                {
                    return new NotificationGetListResponse
                    {
                        IsSuccess = false,
                        Message = $"Event with ID {eventId} does not exist."
                    };
                }
                catch (Exception ex)
                {
                    return new NotificationGetListResponse
                    {
                        IsSuccess = false,
                        Message = ex.Message
                    };
                }
            }

            for (int i = 0; i < notifications.Count; i++)
            {
                if (notifications[i].EventId.HasValue && eventMap.TryGetValue(notifications[i].EventId.Value.ToString(), out var ev))
                {
                    dtos[i].Event = new NotificationEventDTO
                    {
                        Id = ev.Id,
                        Name = ev.Name,
                        ThumbnailUrl = ev.ThumbnailUrl
                    };
                }
            }

            var shapedData = dtos.Select(d => DataShaper.ShapeData(d, request.Fields)).ToList();

            return new NotificationGetListResponse { Data = shapedData };
        }
    }
}



