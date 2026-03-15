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
        private readonly AuthGrpc.AuthGrpcClient _authClient;
        private readonly EventGrpc.EventGrpcClient _eventClient;
        private readonly ILogger<ExternalGrpcService> _logger;

        public ExternalGrpcService(
            AuthGrpc.AuthGrpcClient authClient,
            EventGrpc.EventGrpcClient eventClient,
            ILogger<ExternalGrpcService> logger)
        {
            _authClient = authClient;
            _eventClient = eventClient;
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
    }
}
