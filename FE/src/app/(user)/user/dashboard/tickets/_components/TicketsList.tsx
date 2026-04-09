"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Barcode from "react-barcode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { useGetTickets } from "@/hooks/useTicket";
import { Ticket as TicketData, TicketType as TicketTypeData } from "@/types/ticket";
import { Event as EventData } from "@/types/event";
import { CalendarDays, Clock, QrCode, Ticket as TicketIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSessionStore } from "@/stores/sesionStore";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";

type TicketCardView = {
  id: string;
  eventId: string;
  status: number;
  totalPrice: number;
  createdAt: string;
  event?: Partial<EventData>;
  ticketType?: Partial<TicketTypeData>;
};

type TicketsListProps = {
  statusFilter?: string;
  sortBy?: string;
};

function getStatusStyle(status: number) {
  switch (status) {
    case 1:
      return { label: "Sẵn sàng", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    case 2:
      return { label: "Đã dùng", className: "bg-zinc-500/10 text-muted-foreground border-border" };
    case 3:
      return { label: "Không khả dụng", className: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    case 4:
      return { label: "Đang khóa", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    default:
      return { label: "Không xác định", className: "bg-zinc-500/10 text-muted-foreground border-border" };
  }
}

export default function TicketsList({ statusFilter = "all", sortBy = "newest" }: TicketsListProps) {
  const { user } = useSessionStore()
  const {
    data: ticketsRes,
    isLoading: isTicketsLoading,
    isError,
  } = useGetTickets(
    {
      ownerId: user?.UserId,
      pageNumber: 1,
      pageSize: 200,
      isDescending: true,
      hasEvent: true,
      hasType: true,
    },
    { enabled: !!user?.UserId }
  );

  const tickets = ticketsRes?.data.items || [];
  const ticketCards: TicketCardView[] = tickets.map((ticket: TicketData) => ({
    id: ticket.id,
    eventId: ticket.event?.id || "",
    status: ticket.status,
    totalPrice: Number(ticket.ticketType?.price || 0),
    createdAt: ticket.createdAt || "",
    event: ticket.event,
    ticketType: ticket.ticketType,
  }));

  const filteredCards = ticketCards.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "ready") return item.status === 1;
    if (statusFilter === "locked") return item.status === 4;
    if (statusFilter === "unavailable") return item.status === 3;
    if (statusFilter === "used") return item.status === 2;
    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    if (sortBy === "priceAsc") return a.totalPrice - b.totalPrice;
    if (sortBy === "priceDesc") return b.totalPrice - a.totalPrice;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  if (isTicketsLoading) return <Loading />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
        <h3 className="text-lg font-semibold text-foreground">Có lỗi xảy ra</h3>
        <p className="mt-2 mx-auto max-w-sm text-muted-foreground">Không thể tải danh sách vé. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (!user || ticketCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <TicketIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Chưa có vé nào</h3>
        <p className="mt-2 mx-auto max-w-sm text-muted-foreground">Đặt vé sự kiện để quản lý và xem vé tại đây.</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/events">Khám phá sự kiện</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {sortedCards.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketCardView }) {
  const event = ticket.event;
  const status = getStatusStyle(ticket.status);
  const [showBarcode, setShowBarcode] = useState(false);

  const eventDate = event?.startTime ? new Date(event.startTime) : new Date();

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl dark:bg-zinc-900/40 dark:backdrop-blur-sm">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={event?.thumbnailUrl || event?.bannerUrl || FALLBACK_IMAGE}
          alt={event?.name || "Sự kiện"}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
        
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className={`border-0 shadow-sm backdrop-blur-md font-bold ${status.className} dark:bg-opacity-20`}>
            {status.label}
          </Badge>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="line-clamp-2 text-lg font-bold text-white drop-shadow-md">{event?.name || "Sự kiện"}</h3>
          <div className="mt-2 flex items-center gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-foreground" />
              {format(eventDate, "EEEE, d MMM yyyy", { locale: vi })}
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-4 bg-muted/30 px-4 py-3 dark:bg-zinc-800/30">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
          {ticket.ticketType?.name || "Vé điện tử"}
        </span>
        <div className="h-px flex-1 bg-border/50" />
        
        {/* Ticket punches effect */}
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border bg-background" />
      </div>

      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Mã vé</span>
            <span className="font-mono text-sm font-bold tracking-wider text-foreground">
              #{ticket.id?.substring(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-muted/20 p-2.5 dark:bg-zinc-800/20">
            <Clock className="h-4 w-4 shrink-0 text-primary/70" />
            <span className="text-sm font-medium text-foreground/90">
              {event?.openTime || "Sẽ cập nhật"} - {event?.closedTime || "00:00"}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <span className="text-sm font-medium text-muted-foreground">Giá vé</span>
            <span className="text-lg font-black text-primary dark:text-primary-foreground">
              {ticket.totalPrice === 0 ? "Miễn phí" : `${Number(ticket.totalPrice).toLocaleString("vi-VN")}đ`}
            </span>
          </div>
        </div>

        {showBarcode && (
          <div className="mt-6 animate-in fade-in zoom-in duration-300">
            <div className="rounded-xl border border-border/50 bg-white p-4 shadow-inner dark:bg-zinc-100">
              <div className="mb-2 flex justify-center grayscale transition-all hover:grayscale-0">
                <Barcode
                  value={ticket.id || "000000"}
                  width={1.6}
                  height={50}
                  displayValue={false}
                  background="transparent"
                  lineColor="#000"
                  margin={0}
                />
              </div>
              <p className="break-all text-center font-mono text-[9px] font-medium text-zinc-500">{ticket.id}</p>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3">
          <Button asChild variant="default" className="w-full rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40">
            <Link href={`/events/${ticket.eventId}`}>Chi tiết sự kiện</Link>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowBarcode(!showBarcode)}
            className="w-full justify-center gap-2 rounded-xl text-xs border-border/60 font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5" />
            {showBarcode ? "Ẩn mã vạch" : "Hiện mã vạch"}
          </Button>
        </div>
      </div>
    </article>
  );
}
