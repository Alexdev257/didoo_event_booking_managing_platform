using System.Collections.Generic;

namespace OperationService.Application.DTOs.Response.Analytics
{
    /// <summary>
    /// Response for GET /api/analytics/admin/overview per 12-overview-analytics-rbac.md
    /// </summary>
    public class AdminOverviewResponseDto
    {
        public int TotalUsers { get; set; }
        public double UsersGrowthPercent { get; set; }
        public int TotalOrganizers { get; set; }
        public int PendingOrganizers { get; set; }
        public int TotalEvents { get; set; }
        public int ActiveEvents { get; set; }
        public int PendingEvents { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AvgOrderValue { get; set; }
        public double RevenueGrowthPercent { get; set; }
        public decimal TotalResaleRevenue { get; set; }
        public int ActiveListings { get; set; }
        public int TotalListings { get; set; }
        public int TotalResaleTransactions { get; set; }
        public List<RevenueTrendItemDto> RevenueTrend { get; set; } = new();
        public List<OrderStatusBreakdownItemDto> OrderStatusBreakdown { get; set; } = new();
    }

    public class RevenueTrendItemDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }

    public class OrderStatusBreakdownItemDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percent { get; set; }
    }
}
