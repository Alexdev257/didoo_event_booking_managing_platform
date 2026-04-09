"use client";

import Link from "next/link";
import { Ticket, History, UserCircle, ArrowRight, CircleDollarSign } from "lucide-react";
import { useGetMe } from "@/hooks/useAuth";
import { useGetBookings } from "@/hooks/useBooking";
import { useGetTicketListings, useGetTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { BookingTypeStatus } from "@/utils/enum";

export default function DashboardHomeContent() {
  const { data: meRes } = useGetMe();
  const user = meRes?.data;

  const { data: bookingsRes } = useGetBookings(
    { userId: user?.id, pageNumber: 1, pageSize: 5, isDescending: true },
    { enabled: !!user?.id }
  );
  const { data: ticketsRes } = useGetTickets(
    { ownerId: user?.id, pageNumber: 1, pageSize: 1 },
    { enabled: !!user?.id }
  );
  const { data: listingsRes } = useGetTicketListings(
    { sellerUserId: user?.id, pageNumber: 1, pageSize: 5, isDescending: true },
    { enabled: !!user?.id }
  );
  const { data: tradeBookingsRes } = useGetBookings(
    user?.id
      ? {
          userId: user.id,
          bookingType: BookingTypeStatus.TRADE_PURCHASE,
          pageNumber: 1,
          pageSize: 5,
          isDescending: true,
        }
      : { pageNumber: 1, pageSize: 1 },
    { enabled: !!user?.id }
  );
  const recentBookings = bookingsRes?.data.items || [];
  const totalTickets = ticketsRes?.data.totalItems ?? 0;
  const totalResales = listingsRes?.data.totalItems ?? 0;
  const recentResaleTransactions = tradeBookingsRes?.data.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Xin chào, {user?.fullName || "bạn"}!
        </h1>
        <p className="mt-1 text-muted-foreground">Quản lý vé và thông tin tài khoản của bạn</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/user/dashboard/tickets"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ticket className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Vé của tôi</p>
            <p className="text-sm text-muted-foreground">{totalTickets} vé đang sở hữu</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/user/dashboard/history"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Lịch sử mua hàng</p>
            <p className="text-sm text-muted-foreground">Xem đơn hàng đã mua</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/user/dashboard/profile"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserCircle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Hồ sơ</p>
            <p className="text-sm text-muted-foreground">Cập nhật thông tin cá nhân</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/resale"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:col-span-2 lg:col-span-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ticket className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Chợ vé bán lại</p>
            <p className="text-sm text-muted-foreground">{totalResales} tin đăng bán của bạn</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/user/dashboard/resales"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:col-span-2 lg:col-span-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Theo dõi vé bán lại</p>
            <p className="text-sm text-muted-foreground">
              {totalResales} tin đăng bán và lịch sử người mua
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {recentBookings.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Đơn hàng gần đây</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
              <Link href="/user/dashboard/history">Xem tất cả</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentBookings.slice(0, 3).map((b) => (
              <Link
                key={b.id}
                href={`/events/${b.eventId}/booking/confirm?bookingId=${b.id}`}
                className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">#{b.id?.substring(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {Number(b.totalPrice || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentResaleTransactions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Giao dịch mua lại gần đây</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
              <Link href="/resale">Đi tới chợ vé</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentResaleTransactions.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border/50 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">#{t.id?.substring(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">{t.status}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {Number(t.totalPrice || 0).toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
