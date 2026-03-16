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
        Task<UserCountResponse> GetUserCountAsync();

        // Event gRPC
        Task<EventResponse> GetEventDetailAsync(string eventId);
        Task<AdminOverviewResponse> GetAdminOverviewAsync();
        Task<OrganizerOverviewResponse> GetOrganizerOverviewAsync(string organizerId);
        Task<GetEventIdsByOrganizerResponse> GetEventIdsByOrganizerAsync(string organizerId);

        // Booking gRPC
        Task<BookingAnalyticsResponse> GetBookingAnalyticsAsync(List<string> eventIds);
    }
}
