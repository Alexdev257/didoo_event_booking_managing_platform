using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Enum;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
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
        public override async Task<AdminOverviewResponse> GetAdminOverview(AdminOverviewRequest request, ServerCallContext context)
        {
            var eventsQuery = _unitOfWork.Events.GetAllAsync();
            var organizersQuery = _unitOfWork.Organizers.GetAllAsync();

            var totalEvents = await eventsQuery.CountAsync();
            var totalOrganizers = await organizersQuery.CountAsync();
            var pendingOrganizers = await organizersQuery.CountAsync(o => o.Status == OrganizerStatusEnum.Pending);
            var activeEvents = await eventsQuery.CountAsync(e => e.Status == EventStatusEnum.Published || e.Status == EventStatusEnum.Opened);
            var pendingEvents = await eventsQuery.CountAsync(e => e.Status == EventStatusEnum.Draft);

            return new AdminOverviewResponse
            {
                TotalEvents = totalEvents,
                TotalOrganizers = totalOrganizers,
                PendingOrganizers = pendingOrganizers,
                ActiveEvents = activeEvents,
                PendingEvents = pendingEvents
            };
        }

        public override async Task<OrganizerOverviewResponse> GetOrganizerOverview(OrganizerOverviewRequest request, ServerCallContext context)
        {
            if (!Guid.TryParse(request.OrganizerId, out var organizerId))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid Organizer ID format"));
            }

            var eventsQuery = _unitOfWork.Events.GetAllAsync()
                .Where(e => e.OrganizerId == organizerId && !e.IsDeleted);

            var totalEvents = await eventsQuery.CountAsync();
            var openedEventsCount = await eventsQuery.CountAsync(e => e.Status == EventStatusEnum.Opened);
            var now = DateTime.UtcNow;
            var upcomingPublishedCount = await eventsQuery.CountAsync(e =>
                e.Status == EventStatusEnum.Published && e.StartTime.HasValue && e.StartTime.Value > now);

            var recentEventEntities = await eventsQuery
                .OrderByDescending(e => e.StartTime)
                .Take(10)
                .ToListAsync();

            var response = new OrganizerOverviewResponse
            {
                OrganizerId = request.OrganizerId,
                TotalEvents = totalEvents,
                OpenedEventsCount = openedEventsCount,
                UpcomingPublishedCount = upcomingPublishedCount
            };
            foreach (var e in recentEventEntities)
            {
                response.RecentEvents.Add(new OrganizerRecentEventItem
                {
                    Id = e.Id.ToString(),
                    Name = e.Name ?? string.Empty,
                    StartTime = e.StartTime.HasValue ? Timestamp.FromDateTime(e.StartTime.Value.ToUniversalTime()) : null,
                    Status = (int)e.Status,
                    Revenue = 0,
                    SoldCount = 0,
                    TotalCapacity = 0,
                    OccupancyPercent = 0
                });
            }
            return response;
        }
        public override async Task<GetEventIdsByOrganizerResponse> GetEventIdsByOrganizer(GetEventIdsByOrganizerRequest request, ServerCallContext context)
        {
            if (!Guid.TryParse(request.OrganizerId, out var organizerId))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid Organizer ID format"));
            }

            var eventIds = await _unitOfWork.Events.GetAllAsync()
                .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
                .Select(e => e.Id.ToString())
                .ToListAsync();

            var response = new GetEventIdsByOrganizerResponse();
            response.EventIds.AddRange(eventIds);
            return response;
        }
    }
}
