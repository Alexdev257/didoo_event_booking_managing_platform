"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock4, MapPin, Ticket, XCircle } from "lucide-react";
import { useGetEvent } from "@/hooks/useEvent";
import { useTicketListing } from "@/hooks/useTicket";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TicketListing } from "@/types/ticket";
import { TicketListingStatus } from "@/utils/enum";
import { getListingStatusLabel } from "./status";

export function ListingCard({
  listing,
  sellerUserId,
}: {
  listing: TicketListing;
  sellerUserId: string;
}) {
  const statusView = getListingStatusLabel(listing.status);
  const { cancel } = useTicketListing();
  const eventId = listing.event?.id || listing.eventId || "";
  const { data: eventRes } = useGetEvent(eventId);

  const event = eventRes?.data;

  const canCancel = () => {
    if (!event?.startTime || !event?.endTime) return true;
    const now = Date.now();
    const end = new Date(event.endTime).getTime();
    return now < end;
  };

  const onCancel = async () => {
    if (!listing?.id) return;
    if (!canCancel()) {
      toast.error("Không thể hủy vé sau khi sự kiện kết thúc.");
      return;
    }
    try {
      await cancel.mutateAsync({ id: listing.id, body: { SellerUserId: sellerUserId } });
      toast.success("Hủy bán vé thành công.");
    } catch {
      toast.error("Không thể hủy vé bán lại.");
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Vé bán lại</p>
              <p className="line-clamp-1 text-sm font-bold text-foreground">
                {event?.name || "Đang tải sự kiện..."}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Mã niêm yết: <span className="font-mono">{listing.id.slice(0, 10)}...</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={statusView.className}>
                {statusView.label}
              </Badge>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Giá đăng</p>
                <p className="text-2xl font-black leading-none text-primary">
                  {Number(listing.askingPrice || 0).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          </div>

          {listing.description && <p className="line-clamp-1 text-xs text-muted-foreground font-medium">{listing.description}</p>}

          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Ngày</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                {event?.startTime
                  ? new Date(event.startTime).toLocaleDateString("vi-VN")
                  : new Date(listing.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Địa điểm</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {event?.locations?.[0]?.province || "Đang cập nhật"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Đăng lúc</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground">
                <Clock4 className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(listing.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-end justify-end gap-1.5">
              <div className="flex items-center gap-1.5">
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link href={`/user/dashboard/resales/${listing.id}`}>Xem chi tiết</Link>
                </Button>
                {listing.status === TicketListingStatus.ACTIVE && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={onCancel}
                    disabled={cancel.isPending}
                    className="rounded-lg"
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    {cancel.isPending ? "Đang hủy..." : "Hủy bán"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
