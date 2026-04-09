"use client";

import Link from "next/link";
import Image from "next/image";
import { useGetTicketListing, useGetTicketType } from "@/hooks/useTicket";
import { useGetBooking } from "@/hooks/useBooking";
import { useGetEvent } from "@/hooks/useEvent";
import type { TicketListing } from "@/types/ticket";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  Ticket,
  Clock3,
  Activity,
} from "lucide-react";
import { TicketListingStatus } from "@/utils/enum";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export function ResaleListingDetailContent({ id }: { id: string }) {
  const { data: listingRes, isLoading } = useGetTicketListing(id);
  const listing: TicketListing | undefined = listingRes?.data;
  const firstTicketTypeId = listing?.ticket?.[0]?.ticketTypeId || "";
  const { data: ticketTypeRes } = useGetTicketType(firstTicketTypeId);
  const ticketType = ticketTypeRes?.data;

  const { data: bookingRes } = useGetBooking(listing?.bookingId || (listing as any)?.BookingId || "");
  const booking = bookingRes?.data;

  const eventId = listing?.eventId || (listing as any)?.EventId || listing?.event?.id || booking?.eventId || (booking as any)?.EventId || "";
  const { data: eventRes } = useGetEvent(eventId);
  const event = eventRes?.data;

  if (isLoading) return null;

  if (!listing) {
    return (
      <div className="rounded-2xl border border-border bg-card p-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Ticket className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Không tìm thấy vé</h3>
        <p className="mt-2 mx-auto max-w-sm text-muted-foreground">Vé bán lại này không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  const statusLabel =
    listing.status === TicketListingStatus.SOLD
      ? "Đã bán"
      : listing.status === TicketListingStatus.ACTIVE
        ? "Đang bán"
        : listing.status === TicketListingStatus.CANCELLED
          ? "Đã hủy"
          : "Chờ duyệt";

  const statusClass =
    listing.status === TicketListingStatus.SOLD
      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
      : listing.status === TicketListingStatus.ACTIVE
        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        : listing.status === TicketListingStatus.CANCELLED
          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
          : "bg-amber-500/10 text-amber-500 border-amber-500/20";

  const listingTickets = listing.ticket || [];
  const listedQty = listingTickets.length > 0 ? listingTickets.length : 1;
  const locationLabel =
    event?.locations?.[0]?.address ||
    event?.locations?.[0]?.province ||
    "Đang cập nhật";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-full border border-border">
          <Link href="/user/dashboard/resales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Chi tiết vé bán lại</h1>
          <p className="text-xs text-muted-foreground font-medium">Mã niêm yết: {listing.id}</p>
        </div>
      </div>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-52 w-full shrink-0 bg-muted sm:h-auto sm:w-64">
            {event?.bannerUrl || event?.thumbnailUrl ? (
              <Image
                src={event?.bannerUrl || event?.thumbnailUrl || ""}
                alt={event?.name || "Sự kiện"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 256px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                <Ticket className="mr-1 h-4 w-4" />
                Ảnh sự kiện
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between gap-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Vé niêm yết
                </p>
                <h2 className="text-xl font-bold text-foreground">
                  {event?.name || listing.event?.name || "Sự kiện không xác định"}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">Mã niêm yết: {listing.id}</p>
              </div>
              <Badge variant="outline" className={statusClass}>
                {statusLabel}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Giá đăng</p>
                <p className="mt-1 text-xl font-black text-primary">
                  {formatCurrency(Number(listing.askingPrice || 0))}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Đã bán ra</p>
                <p className="mt-1 text-xl font-bold text-foreground">{listingTickets.length} vé</p>
              </div>
             
            </div>

            <div className="grid gap-2 text-sm text-foreground/80 sm:grid-cols-2 font-medium">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {locationLabel}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {event?.startTime
                  ? new Date(event.startTime).toLocaleString("vi-VN")
                  : "Đang cập nhật thời gian sự kiện"}
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                Tạo lúc {new Date(listing.createdAt).toLocaleString("vi-VN")}
              </p>
              <p className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Cập nhật:{" "}
                {listing.updatedAt ? new Date(listing.updatedAt).toLocaleString("vi-VN") : "Chưa có"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-bold text-foreground">Thông tin vé bán</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground font-medium">Số lượng niêm yết</span>
              <span className="font-bold text-foreground">{listedQty} vé</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground font-medium">Loại vé</span>
              <span className="font-bold text-foreground text-right">
                {ticketType?.name || firstTicketTypeId || "Đang cập nhật"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground font-medium">Giá loại vé</span>
              <span className="font-bold text-foreground">
                {ticketType?.price ? formatCurrency(Number(ticketType.price)) : "Đang cập nhật"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-bold text-foreground">Mô tả</h3>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="font-medium">{listing.description || "Không có mô tả."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

