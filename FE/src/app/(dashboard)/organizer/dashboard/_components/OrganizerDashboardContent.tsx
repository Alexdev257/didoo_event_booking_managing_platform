"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetMe } from "@/hooks/useAuth";
import { useGetOrganizerOverview } from "@/hooks/useOperation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventStatus } from "@/utils/enum";
import {
  DollarSign,
  Ticket,
  CalendarDays,
  CalendarClock,
  ArrowLeftRight,
  TrendingUp,
  Calendar,
  Plus,
} from "lucide-react";

const formatNumber = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
const formatCurrency = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B VNĐ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M VNĐ`;
  return `${formatNumber(Math.round(n))} VNĐ`;
};

function formatDate(s: string | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return s;
  }
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop";

export function OrganizerDashboardContent() {
  const { data: meRes } = useGetMe();
  const organizerId = meRes?.data?.organizerId ?? undefined;
  
  const { data: overviewRes, isLoading } = useGetOrganizerOverview(
    { organizerId, period: "30d" },
    { enabled: !!organizerId }
  );
  
  const overview = overviewRes?.data;

  const kpiCards = useMemo(
    () => [
      {
        title: "Tổng doanh thu",
        value: formatCurrency(overview?.totalRevenue || 0),
        change: `+${overview?.revenueGrowthPercent || 0}% so với kỳ trước`,
        icon: DollarSign,
        trend: "up" as const,
      },
      {
        title: "Vé đã bán",
        value: formatNumber(overview?.ticketsSold || 0),
        change: `+${overview?.ticketsSoldGrowthPercent || 0}% so với kỳ trước`,
        icon: Ticket,
        trend: "up" as const,
      },
      {
        title: "Sự kiện đang mở",
        value: formatNumber(overview?.openedEventsCount || 0),
        change: "Đang mở bán",
        icon: CalendarDays,
        trend: "up" as const,
      },
      {
        title: "Sự kiện sắp tới",
        value: formatNumber(overview?.upcomingPublishedCount || 0),
        change: "Đã duyệt, sắp diễn ra",
        icon: CalendarClock,
        trend: "up" as const,
      },
    ],
    [overview]
  );

  const chartData = overview?.chartData || [];
  const recentEvents = overview?.recentEvents || [];

  if (isLoading || !organizerId) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Organizer Overview */}
      <Card className="min-w-0 border-border">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">Tổng quan tổ chức</CardTitle>
            <CardDescription className="text-muted-foreground">
              Hiệu suất bán vé và hoạt động tổ chức sự kiện
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              30 ngày qua
            </Badge>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" asChild>
              <Link href="/organizer/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo sự kiện mới
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((kpi, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{kpi.title}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  {kpi.change}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doanh thu vé mỗi ngày */}
        <Card className="min-w-0 border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Biểu đồ bán vé</CardTitle>
            <CardDescription className="text-muted-foreground">30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] min-h-0 w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `${(v).toFixed(0)}`}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
                          <p className="font-bold text-foreground">{payload[0].payload.name}</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatNumber(Number(payload[0].value) || 0)} vé
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tăng trưởng tỷ lệ lấp đầy */}
        <Card className="min-w-0 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Tỷ lệ lấp đầy</CardTitle>
            <CardDescription className="text-muted-foreground">Trung bình các sự kiện</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-2xl font-bold text-primary">
              {overview?.occupancyRate || 0}%
            </div>
            <div className="h-[180px] min-h-0 w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orgRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis tickLine={false} axisLine={false} hide />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
                          <p className="font-bold text-foreground">{payload[0].payload.name}</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatNumber(Number(payload[0].value) || 0)} vé
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#orgRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sự kiện hoạt động gần đây */}
      <Card className="min-w-0 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Sự kiện hoạt động gần đây</CardTitle>
            <CardDescription className="text-muted-foreground">Các sự kiện đang diễn ra hoặc bán vé tốt</CardDescription>
          </div>
          <Link href="/organizer/events">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Xem tất cả sự kiện
              <ArrowLeftRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((e) => {
                let statusBadge = "SẮP DIỄN RA";
                const now = new Date();
                const startTime = e.startTime ? new Date(e.startTime) : null;
                const status = Number(e.status);
                
                if (status === EventStatus.OPENED || status === EventStatus.PUBLISHED) {
                    if (startTime && startTime <= now) {
                        statusBadge = "LIVE";
                    }
                } else if (status === EventStatus.CLOSED || status === EventStatus.CANCELLED) {
                    statusBadge = "ĐÃ KẾT THÚC";
                }
                
                return (
                <Link
                  key={e.id}
                  href={`/organizer/events/${e.id}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    <Image
                      src={FALLBACK_IMAGE}
                      alt={e.name}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute right-2 top-2">
                      <Badge
                        variant={
                          statusBadge === "LIVE"
                            ? "default"
                            : statusBadge === "SẮP DIỄN RA"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          statusBadge === "LIVE"
                            ? "bg-emerald-500"
                            : statusBadge === "SẮP DIỄN RA"
                              ? "bg-primary"
                              : ""
                        }
                      >
                        {statusBadge}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-foreground truncate">{e.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(e.startTime)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${e.occupancyPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {e.occupancyPercent}%
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(e.revenue)}
                      </span>
                    </div>
                  </div>
                </Link>
                );
              })
            ) : (
              <p className="col-span-full py-8 text-center text-sm font-medium text-muted-foreground">
                Chưa có sự kiện nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

