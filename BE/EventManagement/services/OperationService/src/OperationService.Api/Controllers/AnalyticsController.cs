using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OperationService.Application.DTOs.Response.Analytics;
using OperationService.Application.Interfaces.Services;
using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationService.Api.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IExternalGrpcService _grpcService;
        private static readonly string[] DayNames = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };

        public AnalyticsController(IExternalGrpcService grpcService)
        {
            _grpcService = grpcService;
        }

        private static (string from, string to) GetDateRangeFromPeriod(string? period, string? fromDate, string? toDate)
        {
            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                return (fromDate, toDate);
            var to = DateTime.UtcNow.Date;
            var days = period switch
            {
                "7d" => 7,
                "90d" => 90,
                _ => 30
            };
            var from = to.AddDays(-days);
            return (from.ToString("yyyy-MM-dd"), to.ToString("yyyy-MM-dd"));
        }

        /// <summary>
        /// GET /api/analytics/admin/overview — Admin Dashboard Overview (Role = ADMIN).
        /// Query: fromDate (ISO), toDate (ISO), period ("7d" | "30d" | "90d", default "30d").
        /// </summary>
        [HttpGet("admin/overview")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAdminOverview(
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null,
            [FromQuery] string? period = "30d")
        {
            var (from, to) = GetDateRangeFromPeriod(period, fromDate, toDate);

            var userCountTask = _grpcService.GetUserCountAsync();
            var eventOverviewTask = _grpcService.GetAdminOverviewAsync(fromDate, toDate, period);
            var bookingAnalyticsTask = _grpcService.GetBookingAnalyticsAsync(null, from, to);

            await Task.WhenAll(userCountTask, eventOverviewTask, bookingAnalyticsTask);

            var booking = bookingAnalyticsTask.Result;
            var totalUsers = userCountTask.Result?.TotalUsers ?? 0;
            var totalBookings = booking?.TotalBookings ?? 0;
            var totalRevenue = (decimal)(booking?.TotalRevenue ?? 0);

            var data = new AdminOverviewResponseDto
            {
                TotalUsers = totalUsers,
                UsersGrowthPercent = 0,
                TotalOrganizers = eventOverviewTask.Result?.TotalOrganizers ?? 0,
                PendingOrganizers = eventOverviewTask.Result?.PendingOrganizers ?? 0,
                TotalEvents = eventOverviewTask.Result?.TotalEvents ?? 0,
                ActiveEvents = eventOverviewTask.Result?.ActiveEvents ?? 0,
                PendingEvents = eventOverviewTask.Result?.PendingEvents ?? 0,
                TotalRevenue = totalRevenue,
                AvgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0,
                RevenueGrowthPercent = 0,
                TotalResaleRevenue = 0,
                ActiveListings = 0,
                TotalListings = 0,
                TotalResaleTransactions = 0,
                RevenueTrend = (booking?.RevenueTrend ?? Enumerable.Empty<SharedContracts.Protos.RevenueTrendItem>())
                    .Select(x => new RevenueTrendItemDto
                    {
                        Date = x.Date,
                        Revenue = (decimal)x.Revenue,
                        Orders = x.Orders
                    }).ToList(),
                OrderStatusBreakdown = (booking?.OrderStatusBreakdown ?? Enumerable.Empty<SharedContracts.Protos.OrderStatusBreakdownItem>())
                    .Select(x => new OrderStatusBreakdownItemDto
                    {
                        Status = x.Status,
                        Count = x.Count,
                        Percent = x.Percent
                    }).ToList()
            };

            return Ok(new CommonResponse<AdminOverviewResponseDto>
            {
                IsSuccess = true,
                Message = "Admin overview retrieved successfully",
                Data = data
            });
        }

        /// <summary>
        /// GET /api/analytics/organizer/overview — Organizer Dashboard Overview (USER + IsOrganizer).
        /// Query: organizerId (optional, must match JWT), period ("7d" | "30d", default "30d").
        /// </summary>
        [HttpGet("organizer/overview")]
        [Authorize(Policy = "OrganizerOnly")]
        public async Task<IActionResult> GetOrganizerOverview(
            [FromQuery] string? organizerId = null,
            [FromQuery] string? period = "30d")
        {
            var jwtOrganizerId = User.FindFirst("OrganizerId")?.Value;
            var effectiveOrganizerId = !string.IsNullOrEmpty(organizerId) ? organizerId : jwtOrganizerId;

            if (string.IsNullOrEmpty(effectiveOrganizerId))
            {
                return BadRequest(new CommonResponse<OrganizerOverviewResponseDto>
                {
                    IsSuccess = false,
                    Message = "Organizer ID not found in claims"
                });
            }

            if (!string.IsNullOrEmpty(organizerId) && organizerId != jwtOrganizerId)
            {
                return Forbid();
            }

            var eventOverviewTask = _grpcService.GetOrganizerOverviewAsync(effectiveOrganizerId, period);
            var eventIdsTask = _grpcService.GetEventIdsByOrganizerAsync(effectiveOrganizerId);

            await Task.WhenAll(eventOverviewTask, eventIdsTask);

            var eventIds = eventIdsTask.Result?.EventIds?.ToList() ?? new List<string>();
            var (from, to) = GetDateRangeFromPeriod(period, null, null);
            var bookingAnalytics = await _grpcService.GetBookingAnalyticsAsync(eventIds, from, to);

            var totalRevenue = (decimal)(bookingAnalytics?.TotalRevenue ?? 0);
            var ticketsSold = bookingAnalytics?.TotalBookings ?? 0;
            var eventStatsDict = (bookingAnalytics?.EventStats ?? Enumerable.Empty<SharedContracts.Protos.EventStatsItem>())
                .ToDictionary(x => x.EventId, x => (Revenue: (decimal)x.Revenue, TicketsSold: x.TicketsSold));

            var recentEventsFromGrpc = eventOverviewTask.Result?.RecentEvents ?? Enumerable.Empty<SharedContracts.Protos.OrganizerRecentEventItem>();
            var recentEvents = recentEventsFromGrpc.Select(e =>
            {
                var stats = eventStatsDict.TryGetValue(e.Id, out var s) ? s : (Revenue: 0m, TicketsSold: 0);
                var totalCap = e.TotalCapacity;
                var occupancy = totalCap > 0 ? Math.Round((double)stats.TicketsSold / totalCap * 100, 1) : 0;
                return new RecentEventItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    StartTime = e.StartTime != null ? e.StartTime.ToDateTime() : (DateTime?)null,
                    Status = e.Status,
                    Revenue = stats.Revenue,
                    SoldCount = stats.TicketsSold,
                    TotalCapacity = totalCap,
                    OccupancyPercent = occupancy
                };
            }).ToList();

            var chartData = (bookingAnalytics?.RevenueTrend ?? Enumerable.Empty<SharedContracts.Protos.RevenueTrendItem>())
                .Select(x =>
                {
                    var dt = DateTime.TryParse(x.Date, out var d) ? d : DateTime.UtcNow;
                    var dayLabel = DayNames[(int)dt.DayOfWeek];
                    return new ChartDataItemDto
                    {
                        Name = $"{dayLabel} {x.Date}",
                        Sales = x.TicketsSold,
                        Capacity = 0,
                        Occupancy = 0
                    };
                }).ToList();

            var data = new OrganizerOverviewResponseDto
            {
                OrganizerId = effectiveOrganizerId,
                TotalRevenue = totalRevenue,
                RevenueGrowthPercent = 0,
                TicketsSold = ticketsSold,
                TicketsSoldGrowthPercent = 0,
                OccupancyRate = 0,
                OccupancyGrowthPercent = 0,
                OpenedEventsCount = eventOverviewTask.Result?.OpenedEventsCount ?? 0,
                UpcomingPublishedCount = eventOverviewTask.Result?.UpcomingPublishedCount ?? 0,
                ChartData = chartData,
                RecentEvents = recentEvents
            };

            return Ok(new CommonResponse<OrganizerOverviewResponseDto>
            {
                IsSuccess = true,
                Message = "Organizer overview retrieved successfully",
                Data = data
            });
        }
    }
}
