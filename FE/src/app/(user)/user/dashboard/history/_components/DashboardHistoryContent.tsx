"use client";


import Image from "next/image";
import { useGetMe } from "@/hooks/useAuth";
import { useGetBookings } from "@/hooks/useBooking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking } from "@/types/booking";
import { useGetEvent } from "@/hooks/useEvent";
import { BookingTypeStatus } from "@/utils/enum";
import { Link } from "lucide-react";


const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";

function getStatusStyle(status: string) {
  const normalized = status?.toLowerCase() || "";
  if (normalized.includes("paid") || normalized.includes("success")) {
    return { label: "Đã thanh toán", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  }
  if (normalized.includes("pending")) {
    return { label: "Chờ thanh toán", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
  }
  return { label: "Đã hủy", className: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
}

function getBookingTypeStyle(bookingType?: number | string) {
  const bt = Number(bookingType);
  const btStr = String(bookingType ?? "").toLowerCase();
  if (bt === BookingTypeStatus.TRADE_PURCHASE || bt === 2 || btStr.includes("trade")) {
    return { label: "Mua lại", className: "bg-violet-500/10 text-violet-500 border-violet-500/20" };
  }
  return { label: "Mua trực tiếp", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
}

function HistoryRow({ booking }: { booking: Booking }) {
  const { data: eventRes } = useGetEvent(booking.eventId);
  const event = eventRes?.data;
  const status = getStatusStyle(booking.status || "");
  const bookingType = getBookingTypeStyle(booking.bookingType);
  const dateStr = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "--";

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-32">
        <Image
          src={event?.thumbnailUrl || event?.bannerUrl || FALLBACK_IMAGE}
          alt={event?.name || "Sự kiện"}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{event?.name || "Sự kiện"}</h3>
          <Badge variant="outline" className={bookingType.className}>
            {bookingType.label}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground font-medium">#{booking.id?.substring(0, 8).toUpperCase()}</p>
        <p className="mt-1 text-sm text-muted-foreground font-medium">{dateStr}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
        <p className="font-bold text-foreground">
          {Number(booking.totalPrice || 0).toLocaleString("vi-VN")}đ
        </p>
      </div>
    </div>
  );
}

export default function DashboardHistoryContent() {
  const { data: meRes } = useGetMe();
  const user = meRes?.data;

  const { data: bookingsRes } = useGetBookings(
    { userId: user?.id, pageNumber: 1, pageSize: 50, isDescending: true, bookingType: BookingTypeStatus.NORMAL },
    { enabled: !!user?.id }
  );
  const { data: resaleTransactionsRes } = useGetBookings(
    { userId: user?.id, pageNumber: 1, pageSize: 50, isDescending: true, bookingType: BookingTypeStatus.TRADE_PURCHASE },
    { enabled: !!user?.id }
  );


  const bookings = bookingsRes?.data.items || [];
  const resaleTransactions = resaleTransactionsRes?.data.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch sử mua hàng</h1>
          <p className="mt-1 text-muted-foreground font-medium">Xem tất cả đơn hàng đã đặt</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">
              Trực tiếp ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="transactions">
              Mua lại ({resaleTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Chưa có đơn hàng</h3>
                  <p className="mt-2 max-w-sm mx-auto text-muted-foreground font-medium">
                    Đặt vé sự kiện để xem lịch sử mua hàng tại đây.
                  </p>
                  <Button asChild className="mt-6 rounded-xl">
                    <Link href="/events">Khám phá sự kiện</Link>
                  </Button>
                </div>
              ) : (
                bookings.map((booking) => (
                  <HistoryRow key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              {resaleTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Chưa có giao dịch</h3>
                  <p className="mt-2 max-w-sm mx-auto text-muted-foreground font-medium">
                    Sẽ hiển thị các giao dịch mua lại tại đây.
                  </p>
                </div>
              ) : (
                resaleTransactions.map((transaction) => (
                  <HistoryRow key={transaction.id} booking={transaction} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
