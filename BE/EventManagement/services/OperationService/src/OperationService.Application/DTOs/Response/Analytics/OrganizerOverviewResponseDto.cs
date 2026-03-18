using System;
using System.Collections.Generic;

namespace OperationService.Application.DTOs.Response.Analytics
{
    /// <summary>
    /// Response for GET /api/analytics/organizer/overview per 12-overview-analytics-rbac.md
    /// </summary>
    public class OrganizerOverviewResponseDto
    {
        public string OrganizerId { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public double RevenueGrowthPercent { get; set; }
        public int TicketsSold { get; set; }
        public double TicketsSoldGrowthPercent { get; set; }
        public double OccupancyRate { get; set; }
        public double OccupancyGrowthPercent { get; set; }
        public int OpenedEventsCount { get; set; }
        public int UpcomingPublishedCount { get; set; }
        public List<ChartDataItemDto> ChartData { get; set; } = new();
        public List<RecentEventItemDto> RecentEvents { get; set; } = new();
    }

    public class ChartDataItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int Sales { get; set; }
        public int Capacity { get; set; }
        public double Occupancy { get; set; }
    }

    public class RecentEventItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime? StartTime { get; set; }
        public int Status { get; set; }
        public decimal Revenue { get; set; }
        public int SoldCount { get; set; }
        public int TotalCapacity { get; set; }
        public double OccupancyPercent { get; set; }
    }
}
