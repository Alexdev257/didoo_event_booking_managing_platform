using Grpc.Core;
using Microsoft.Extensions.Logging;
using OperationService.Application.Interfaces.Services;
using SharedContracts.Protos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OperationService.Infrastructure.Services
{
    public class ExternalGrpcService : IExternalGrpcService
    {
        private readonly global::SharedContracts.Protos.AuthGrpc.AuthGrpcClient _authClient;
        private readonly global::SharedContracts.Protos.EventGrpc.EventGrpcClient _eventClient;
        private readonly global::SharedContracts.Protos.BookingGrpc.BookingGrpcClient _bookingClient;
        private readonly ILogger<ExternalGrpcService> _logger;

        public ExternalGrpcService(
            global::SharedContracts.Protos.AuthGrpc.AuthGrpcClient authClient,
            global::SharedContracts.Protos.EventGrpc.EventGrpcClient eventClient,
            global::SharedContracts.Protos.BookingGrpc.BookingGrpcClient bookingClient,
            ILogger<ExternalGrpcService> logger)
        {
            _authClient = authClient;
            _eventClient = eventClient;
            _bookingClient = bookingClient;
            _logger = logger;
        }

        public async Task<UserResponse> GetUserProfileAsync(string userId)
        {
            try
            {
                var request = new UserRequest { UserId = userId };
                return await _authClient.GetUserProfileAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling AuthGrpc.GetUserProfile for UserId: {UserId}", userId);
                return null;
            }
        }

        public async Task<GetUsersResponse> GetUsersByIdsAsync(List<string> userIds)
        {
            try
            {
                var request = new GetUsersRequest();
                request.UserIds.AddRange(userIds);
                return await _authClient.GetUsersByIdsAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling AuthGrpc.GetUsersByIds");
                return new GetUsersResponse();
            }
        }

        public async Task<GetAdminEmailsResponse> GetAdminEmailsAsync()
        {
            try
            {
                return await _authClient.GetAdminEmailsAsync(new GetAdminEmailsRequest());
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling AuthGrpc.GetAdminEmails");
                return new GetAdminEmailsResponse();
            }
        }

        public async Task<UserCountResponse> GetUserCountAsync()
        {
            try
            {
                return await _authClient.GetUserCountAsync(new UserCountRequest());
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling AuthGrpc.GetUserCount");
                return new UserCountResponse();
            }
        }

        public async Task<EventResponse> GetEventDetailAsync(string eventId)
        {
            try
            {
                var request = new EventRequest { EventId = eventId };
                return await _eventClient.GetEventDetailAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling EventGrpc.GetEventDetail for EventId: {EventId}", eventId);
                return null;
            }
        }

        public async Task<AdminOverviewResponse> GetAdminOverviewAsync(string? fromDate = null, string? toDate = null, string? period = null)
        {
            try
            {
                var request = new AdminOverviewRequest();
                if (!string.IsNullOrEmpty(fromDate)) request.FromDate = fromDate;
                if (!string.IsNullOrEmpty(toDate)) request.ToDate = toDate;
                if (!string.IsNullOrEmpty(period)) request.Period = period;
                return await _eventClient.GetAdminOverviewAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling EventGrpc.GetAdminOverview");
                return new AdminOverviewResponse();
            }
        }

        public async Task<OrganizerOverviewResponse> GetOrganizerOverviewAsync(string organizerId, string? period = null)
        {
            try
            {
                var request = new OrganizerOverviewRequest { OrganizerId = organizerId };
                if (!string.IsNullOrEmpty(period)) request.Period = period;
                return await _eventClient.GetOrganizerOverviewAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling EventGrpc.GetOrganizerOverview for OrganizerId: {OrganizerId}", organizerId);
                return new OrganizerOverviewResponse();
            }
        }

        public async Task<GetEventIdsByOrganizerResponse> GetEventIdsByOrganizerAsync(string organizerId)
        {
            try
            {
                var request = new GetEventIdsByOrganizerRequest { OrganizerId = organizerId };
                return await _eventClient.GetEventIdsByOrganizerAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling EventGrpc.GetEventIdsByOrganizer for OrganizerId: {OrganizerId}", organizerId);
                return new GetEventIdsByOrganizerResponse();
            }
        }

        public async Task<BookingAnalyticsResponse> GetBookingAnalyticsAsync(List<string>? eventIds = null, string? fromDate = null, string? toDate = null)
        {
            try
            {
                var request = new BookingAnalyticsRequest();
                if (eventIds != null && eventIds.Count > 0)
                    request.EventIds.AddRange(eventIds);
                if (!string.IsNullOrEmpty(fromDate)) request.FromDate = fromDate;
                if (!string.IsNullOrEmpty(toDate)) request.ToDate = toDate;
                return await _bookingClient.GetBookingAnalyticsAsync(request);
            }
            catch (RpcException ex)
            {
                _logger.LogError(ex, "Error calling BookingGrpc.GetBookingAnalytics");
                return new BookingAnalyticsResponse();
            }
        }
    }
}
