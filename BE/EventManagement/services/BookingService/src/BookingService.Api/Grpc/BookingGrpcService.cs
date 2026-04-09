using BookingService.Application.Interfaces.Repositories;
using BookingService.Domain.Enum;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using System;
using System.Collections.Generic;
using System.Linq;

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

            if (DateTime.TryParse(request.FromDate, out var fromDate))
            {
                var fromUtc = fromDate.Date;
                query = query.Where(b => b.CreatedAt >= fromUtc);
            }

            if (DateTime.TryParse(request.ToDate, out var toDate))
            {
                var toUtc = toDate.Date.AddDays(1);
                query = query.Where(b => b.CreatedAt < toUtc);
            }

            var bookings = await query.ToListAsync();

            var totalBookings = bookings.Count;
            var totalRevenue = (double)bookings.Where(b => b.Status == BookingStatusEnum.Paid).Sum(b => b.TotalPrice);

            var response = new BookingAnalyticsResponse
            {
                TotalBookings = totalBookings,
                TotalRevenue = totalRevenue
            };

            if (bookings.Count > 0)
            {
                var trendByDate = bookings
                    .GroupBy(b => b.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new RevenueTrendItem
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Revenue = (double)g.Where(b => b.Status == BookingStatusEnum.Paid).Sum(b => b.TotalPrice),
                        Orders = g.Count(),
                        TicketsSold = g.Sum(b => b.Amount)
                    });
                response.RevenueTrend.AddRange(trendByDate);

                var statusGroups = bookings.GroupBy(b => b.Status).ToList();
                var totalCount = (double)bookings.Count;
                foreach (var grp in statusGroups)
                {
                    var statusName = grp.Key switch
                    {
                        BookingStatusEnum.Paid => "Paid",
                        BookingStatusEnum.Pending => "Pending",
                        BookingStatusEnum.Canceled => "Cancelled",
                        _ => grp.Key.ToString()
                    };
                    response.OrderStatusBreakdown.Add(new OrderStatusBreakdownItem
                    {
                        Status = statusName,
                        Count = grp.Count(),
                        Percent = totalCount > 0 ? Math.Round(grp.Count() / totalCount * 100, 1) : 0
                    });
                }
            }

            if (request.EventIds != null && request.EventIds.Any() && bookings.Count > 0)
            {
                var eventStats = bookings
                    .GroupBy(b => b.EventId)
                    .Select(g => new EventStatsItem
                    {
                        EventId = g.Key.ToString(),
                        Revenue = (double)g.Where(b => b.Status == BookingStatusEnum.Paid).Sum(b => b.TotalPrice),
                        TicketsSold = g.Sum(b => b.Amount)
                    });
                response.EventStats.AddRange(eventStats);
            }

            return response;
        }
    }
}
