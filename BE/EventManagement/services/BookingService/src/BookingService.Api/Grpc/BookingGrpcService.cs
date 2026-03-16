using BookingService.Application.Interfaces.Repositories;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;

namespace BookingService.Api.Grpc
{
    public class BookingGrpcService : BookingGrpc.BookingGrpcBase
    {
        private readonly IManageUnitOfWork _unitOfWork;

        public BookingGrpcService(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public override async Task<BookingAnalyticsResponse> GetBookingAnalytics(BookingAnalyticsRequest request, ServerCallContext context)
        {
            var query = _unitOfWork.Bookings.GetAllAsync();

            if (request.EventIds != null && request.EventIds.Any())
            {
                var eventGuids = request.EventIds
                    .Select(id => Guid.TryParse(id, out var g) ? g : Guid.Empty)
                    .Where(g => g != Guid.Empty)
                    .ToList();

                if (eventGuids.Any())
                {
                    query = query.Where(b => eventGuids.Contains(b.EventId));
                }
            }

            // Consider only paid/confirmed bookings for analytics? 
            // Assuming status 1 or similar means confirmed. Let's keep it simple for now as per other services.
            
            var bookings = await query.ToListAsync();

            return new BookingAnalyticsResponse
            {
                TotalBookings = bookings.Count,
                TotalRevenue = (double)bookings.Sum(b => b.TotalPrice)
            };
        }
    }
}
