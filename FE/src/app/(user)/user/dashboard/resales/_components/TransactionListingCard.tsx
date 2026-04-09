"use client";

import Image from "next/image";
import { Ticket } from "lucide-react";
import { useGetEvent } from "@/hooks/useEvent";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Booking } from "@/types/booking";
import { getBookingStatusView } from "./status";

export function TransactionListingCard({ booking }: { booking: Booking }) {
  const { data: eventRes } = useGetEvent(booking.eventId || "");
  const event = eventRes?.data;
  const statusView = getBookingStatusView(booking.status);

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/20">
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted sm:ml-4 sm:h-auto sm:w-44">
          {event?.thumbnailUrl ? (
            <Image
              src={event.thumbnailUrl}
              alt={event?.name || "Ảnh sự kiện"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 176px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              <Ticket className="mr-1 h-4 w-4" />
              Hình sự kiện
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Giao dịch</span>
                <Badge variant="outline" className={statusView.className}>
                  {statusView.label}
                </Badge>
              </div>
              <div className="max-w-full rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground font-medium">
                {booking.id}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Người mua</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {(booking.fullname || "U").charAt(0).toUpperCase()}
                </span>
                {booking.fullname || "Không rõ"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Số lượng</p>
              <p className="mt-1 text-sm font-bold text-foreground">{booking.amount} vé</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Giá trị</p>
              <p className="mt-1 text-2xl font-black leading-none text-primary">
                {Number(booking.totalPrice || 0).toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Thời gian</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {new Date(booking.paidAt || booking.createdAt || "").toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
