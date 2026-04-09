"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { TicketListing, TicketType } from "@/types/ticket";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800";

export interface TradeBookingDetailContentProps {
  eventId: string;
  listingId: string;
  event: Event;
  listing: TicketListing;
  ticketTypeGroups: { name: string; count: number; price: number }[];
  isAvailable: boolean;
  exceedsMax: boolean;
  isLoggedIn: boolean;
}

export function TradeBookingDetailContent({
  eventId,
  listingId,
  event,
  listing,
  ticketTypeGroups,
  isAvailable,
  exceedsMax,
  isLoggedIn,
}: TradeBookingDetailContentProps) {
  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-24 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/resale/${eventId}`}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs md:text-sm font-bold text-muted-foreground transition hover:bg-muted shadow-sm"
        >
          ← Quay lại danh sách vé
        </Link>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-muted">
                <Image
                  src={
                    event.bannerUrl ||
                    event.thumbnailUrl ||
                    FALLBACK_IMAGE
                  }
                  alt={event.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              <div className="p-5 md:p-6">
                <h1 className="text-xl md:text-2xl font-black text-foreground leading-tight">{event.name}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {event.startTime && (
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {format(new Date(event.startTime), "dd MMM yyyy", { locale: vi })}
                    </span>
                  )}
                  {(event.locations?.[0]?.name || event.locations?.[0]?.address) && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.locations[0].address || "Liên hệ người tổ chức"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Ticket className="h-5 w-5 text-primary" />
                Thông tin vé
              </h2>
              <div className="mt-4 space-y-2">
                {ticketTypeGroups.length > 0 ? (
                  ticketTypeGroups.map((g, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-muted-foreground/90">
                        {g.name} × {g.count}
                      </p>
                      <p className="text-sm font-semibold text-foreground shrink-0">
                        {g.price * g.count === 0 ? "Miễn phí" : `${(g.price * g.count).toLocaleString("vi-VN")}đ`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Thông tin loại vé đang cập nhật</p>
                )}
              </div>
              {!isAvailable && !exceedsMax && (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-500 font-medium">
                  Vé này không còn khả dụng để mua. Vui lòng chọn vé khác.
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5 mt-4 lg:mt-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Chi tiết giá</h2>
              <p className="mt-4 text-3xl font-black text-primary">
                {Number(listing.askingPrice || 0) === 0 ? "Miễn phí" : `${Number(listing.askingPrice).toLocaleString("vi-VN")}đ`}
              </p>
              {exceedsMax && (
                <p className="mt-2 text-sm font-medium text-amber-600">
                  Bạn đã đạt giới hạn vé cho loại vé này
                </p>
              )}

              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                <p className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Giao dịch an toàn
                </p>
                <p className="mt-1 text-muted-foreground/80 font-medium">
                  Thanh toán qua cổng an toàn. Vé được chuyển quyền sở hữu sau khi thanh toán thành công.
                </p>
              </div>

              {isAvailable ? (
                isLoggedIn ? (
                  <Button asChild className="mt-6 h-14 w-full rounded-xl text-base font-semibold">
                    <Link href={`/resale/${eventId}/trade-booking/${listingId}/confirm`}>
                      Mua vé ngay
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="mt-6 h-14 w-full rounded-xl text-base font-semibold">
                    <Link href={`/login?redirect=${encodeURIComponent(`/resale/${eventId}/trade-booking/${listingId}`)}`}>
                      Đăng nhập ngay
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )
              ) : (
                <Button
                  disabled
                  className="mt-6 h-14 w-full rounded-xl text-base font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                >
                  Mua vé ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}

              {!isAvailable && !exceedsMax && (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Vé đã được bán hoặc không còn khả dụng
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
