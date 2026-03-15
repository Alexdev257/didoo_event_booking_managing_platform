using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Enum;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using SharedContracts.Protos;

namespace EventService.Api.Grpc
{
    public class EventGrpcService : EventGrpc.EventGrpcBase
    {
        private readonly IEventUnitOfWork _unitOfWork;

        public EventGrpcService(IEventUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public override async Task<EventResponse> GetEventDetail(EventRequest request, ServerCallContext context)
        {
            if (!Guid.TryParse(request.EventId, out var eventId))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid Event ID format"));
            }

            var eventEntity = await _unitOfWork.Events.GetByIdAsync(eventId);

            if (eventEntity == null || eventEntity.IsDeleted)
            {
                throw new RpcException(new Status(StatusCode.NotFound, "User not found"));
            }

            EventStatus protoStatus = eventEntity.Status switch
            {
                EventStatusEnum.Draft => EventStatus.Draft,
                EventStatusEnum.Published => EventStatus.Published,
                EventStatusEnum.Cancelled => EventStatus.Cancelled,
                EventStatusEnum.Opened => EventStatus.Completed,
                _ => EventStatus.Cancelled
            };

            var response = new EventResponse
            {
                Id = eventEntity.Id.ToString(),
                Name = eventEntity.Name ?? string.Empty,
                Slug = eventEntity.Slug ?? string.Empty,
                Description = eventEntity.Description ?? string.Empty,
                Tags = eventEntity.Tags ?? string.Empty,
                Status = protoStatus,
                ThumbnailUrl = eventEntity.ThumbnailUrl ?? string.Empty,
                BannerUrl = eventEntity.BannerUrl ?? string.Empty,
                AgeRestriction = eventEntity.AgeRestriction
            };

            if (eventEntity.StartTime.HasValue)
            {
                response.StartTime = Timestamp.FromDateTime(eventEntity.StartTime.Value.ToUniversalTime());
            }

            if (eventEntity.EndTime.HasValue)
            {
                response.EndTime = Timestamp.FromDateTime(eventEntity.EndTime.Value.ToUniversalTime());
            }

            if (eventEntity.OpenTime.HasValue)
            {
                response.OpenTime = eventEntity.OpenTime.Value.ToString("HH:mm:ss");
            }

            if (eventEntity.ClosedTime.HasValue)
            {
                response.ClosedTime = eventEntity.ClosedTime.Value.ToString("HH:mm:ss");
            }

            return response;
        }

        public override async Task<OrganizerStatusResponse> GetOrganizerStatus(OrganizerStatusRequest request, ServerCallContext context)
        {
            if (!Guid.TryParse(request.OrganizerId, out var organizerId))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid Organizer ID format"));
            }

            var organizer = await _unitOfWork.Organizers.GetByIdAsync(organizerId);

            if (organizer == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, "Organizer not found"));
            }

            return new OrganizerStatusResponse
            {
                IsVerified = organizer.IsVerified ?? false,
                Status = (int)organizer.Status
            };
        }
    }
}
