using SharedContracts.Protos;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace OperationService.Application.Interfaces.Services
{
    public interface IExternalGrpcService
    {
        // Auth gRPC
        Task<UserResponse> GetUserProfileAsync(string userId);
        Task<GetUsersResponse> GetUsersByIdsAsync(List<string> userIds);
        Task<GetAdminEmailsResponse> GetAdminEmailsAsync();

        // Event gRPC
        Task<EventResponse> GetEventDetailAsync(string eventId);
    }
}
