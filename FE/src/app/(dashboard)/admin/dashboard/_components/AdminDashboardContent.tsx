"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useGetAdminOverview } from "@/hooks/useOperation";
import { bookingRequest } from "@/apiRequest/bookingService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  ArrowRight,
  MoreHorizontal,
  Eye,
  ArrowLeftRight,
} from "lucide-react";

const formatNumber = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
const formatCurrency = (n: number) => `${formatNumber(Math.round(n))}₫`;

const CHART_COLORS = ["#EA580C", "#0D9488", "#7C3AED", "#059669", "#DC2626"];

export function AdminDashboardContent() {
  const { data: overviewRes, isLoading: isOverviewLoading } = useGetAdminOverview({ period: "30d" });
  const overview = overviewRes?.data;

  const { data: recentBookingsRes } = useQuery({
    queryKey: ["admin-dashboard-recent-bookings"],
    queryFn: async () => {
      const res = await bookingRequest.getList({ pageNumber: 1, pageSize: 15, isDescending: true });
      return res.data.items;
    },
  });

  const recentTransactions = recentBookingsRes || [];

  const orderStatusData = useMemo(() => {
    if (!overview?.orderStatusBreakdown) return [];
    return overview.orderStatusBreakdown.map((item, index) => {
      let fill = CHART_COLORS[0];
      const s = String(item.status ?? "").toLowerCase();
      if (s === "2" || s.includes("paid") || s.includes("success")) fill = CHART_COLORS[3];
      else if (s === "1" || s.includes("pending")) fill = CHART_COLORS[0];
      else if (s === "3" || s.includes("cancel")) fill = CHART_COLORS[4];
      
      let name = item.status;
      if (s === "2" || s.includes("paid") || s.includes("success")) name = "Đã thanh toán";
      else if (s === "1" || s.includes("pending")) name = "Chờ thanh toán";
      else if (s === "3" || s.includes("cancel")) name = "Đã hủy";

      return {
        name: name,
        value: item.count,
        percent: item.percent,
        fill,
      };
    }).filter(d => d.value > 0);
  }, [overview?.orderStatusBreakdown]);

  const revenueTrendData = useMemo(() => {
    if (!overview?.revenueTrend) return [];
    return overview.revenueTrend.map(r => ({
      date: r.date,
      revenue: r.revenue,
      orders: r.orders
    }));
  }, [overview?.revenueTrend]);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "—";
  };

  const getStatusLabel = (status: string | number | undefined) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "2" || s.includes("paid") || s.includes("success")) return { label: "HOÀN TẤT", variant: "default" as const };
    if (s === "1" || s.includes("pending")) return { label: "CHỜ XỬ LÝ", variant: "secondary" as const };
    if (s === "3" || s.includes("cancel")) return { label: "Đã hủy", variant: "destructive" as const };
    return { label: "CHỜ XỬ LÝ", variant: "secondary" as const };
  };

  if (isOverviewLoading) {
     return <div className="py-12 text-center text-sm text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* System Overview */}
      <Card className="min-w-0 border-border">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">Tổng quan hệ thống</CardTitle>
            <CardDescription className="text-muted-foreground">
              Hiệu suất và thống kê thời gian thực — {new Date().toLocaleDateString("vi-VN", { dateStyle: "long" })}
            </CardDescription>
          </div>
         <div></div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Người dùng</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatNumber(overview?.totalUsers || 0)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                +{overview?.usersGrowthPercent || 12.5}% so với tháng trước
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Nhà tổ chức</span>
                {(overview?.pendingOrganizers ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px] bg-muted text-muted-foreground border-border">
                    {overview?.pendingOrganizers} chờ duyệt
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatNumber(overview?.totalOrganizers || 0)}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Sự kiện đang mở</span>
                {(overview?.activeEvents ?? 0) > 0 && (
                  <Badge variant="default" className="ml-auto text-[10px]">
                    Đang hoạt động
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatNumber(overview?.activeEvents || 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {overview?.totalEvents || 0} tổng · {overview?.pendingEvents || 0} chờ duyệt
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Doanh thu</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(overview?.totalRevenue || 0)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                TB: {formatCurrency(overview?.avgOrderValue || 0)}/đơn
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Mua bán lại</span>
                {(overview?.activeListings ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px] bg-muted text-muted-foreground border-border">
                    {overview?.activeListings} đang bán
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(overview?.totalResaleRevenue || 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {overview?.totalListings || 0} tin đăng · {overview?.totalResaleTransactions || 0} giao dịch
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="min-w-0 border-border">
          <CardHeader>
            <CardTitle className="text-foreground ">Xu hướng doanh thu</CardTitle>
            <CardDescription className="text-muted-foreground">30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-[280px] min-h-0 w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "short" })}
                  />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--muted-foreground)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.[0] ? (
                        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                          <p className="text-xs text-muted-foreground">
                            {label ? new Date(label).toLocaleDateString("vi-VN", { dateStyle: "long" }) : ""}
                          </p>
                          <p className="font-semibold text-foreground">{formatCurrency(Number(payload[0].value) || 0)}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EA580C"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="min-w-0 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Trạng thái đơn hàng</CardTitle>
            <CardDescription className="text-muted-foreground">Phân bổ trạng thái</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="flex h-[240px] min-w-0 items-center justify-center">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                            <p className="font-medium text-foreground">{payload[0].payload.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].value} đơn ({payload[0].payload.percent}%)
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu đơn hàng</p>
              )}
            </div>
            {orderStatusData.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {orderStatusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-xs text-muted-foreground">
                      {d.name}: {d.percent}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Giao dịch gần đây - Table */}
      <Card className="min-w-0 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Giao dịch gần đây</CardTitle>
            <CardDescription className="text-muted-foreground">Dữ liệu {recentTransactions.length} giao dịch mới nhất</CardDescription>
          </div>
          <Link href="/admin/revenue">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Xem tất cả
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            {recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground">MÃ ĐƠN</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">KHÁCH HÀNG</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">NGÀY ĐẶT</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">GIÁ TRỊ</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">TRẠNG THÁI</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((b) => {
                    const statusInfo = getStatusLabel(b.status);
                    return (
                      <TableRow key={b.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-muted-foreground">
                          #DH-{b.id.replace(/-/g, "").slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                {getInitials(b.fullname || "")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{b.fullname || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {b.paidAt || b.createdAt
                            ? new Date(b.paidAt || b.createdAt!).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatCurrency(Number(b.totalPrice) || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className={statusInfo.variant === "secondary" ? "bg-muted text-muted-foreground border-border" : ""}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href="/admin/revenue" className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Xem chi tiết
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">Chưa có giao dịch</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
