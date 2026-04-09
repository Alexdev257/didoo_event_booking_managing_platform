"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Share2,
  ShoppingCart,
  Tag,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { TicketType } from "@/types/ticket";
import { EventStatus } from "@/utils/enum";
import { useGetOrganizer } from "@/hooks/useEvent";
import { toast } from "sonner";
import EventLocation from "./EventLocation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSessionStore } from "@/stores/sesionStore";
interface EventDetailContentProps {
  event: Event;
  ticketTypes: TicketType[];
  eventRelated?: Event[];
}

const FALLBACK_ORGANIZER_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";

const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800";

function getStatusLabel(status: EventStatus) {
  if (status === EventStatus.OPENED) return "Đang mở bán";
  if (status === EventStatus.PUBLISHED) return "Đã công bố (chưa mở bán)";
  if (status === EventStatus.CLOSED) return "Đã đóng";
  if (status === EventStatus.CANCELLED) return "Đã hủy";
  return "Sắp diễn ra";
}

function formatDate(s: string | undefined) {
  if (!s) return "Đang cập nhật";
  return new Date(s).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type TabId = "details" | "venue";

export default function EventDetailContent({
  event,
  ticketTypes,
  eventRelated = [],
}: EventDetailContentProps) {
  const { data: orgData } = useGetOrganizer(event.organizer?.id || "");
  const organizer = orgData?.data;
  const { user } = useSessionStore();
  const minPrice =
    ticketTypes.length > 0
      ? Math.min(...ticketTypes.map((t) => Number(t.price || 0)))
      : 0;
  const totalTickets = ticketTypes.reduce((s, t) => s + (t.totalQuantity ?? 0), 0);
  const soldTickets = ticketTypes.reduce(
    (s, t) => s + ((t.totalQuantity ?? 0) - (t.availableQuantity ?? 0)),
    0
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: event.name, url: window.location.href });
        toast.success("Đã chia sẻ");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link");
      }
    } catch {
      toast.info("Đã hủy chia sẻ");
    }
  };

  const quickInfoItems = [
    { label: "Thể loại", value: event.category?.name || "Sự kiện", icon: Tag },
    {
      label: "Độ tuổi",
      value: event.ageRestriction > 0 ? `${event.ageRestriction}+` : "Mọi lứa tuổi",
      icon: Users,
    },
    { label: "Trạng thái", value: getStatusLabel(event.status), icon: Zap },
    {
      label: "Thời gian",
      value: `${event.openTime || "Sẽ cập nhật"} - ${event.closedTime || "Sẽ cập nhật"}`,
      icon: Clock3,
    },
  ];

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
      <span className="h-5 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-6 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Quick Info Grid (Original Style) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickInfoItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {item.label}
                </p>
                <p className={`mt-0.5 text-sm font-bold ${item.label === "Trạng thái" ? "text-primary" : "text-foreground"}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Location Summary & Map - Kept at Top per user request 'chỉ đổi cái chỗ th' */}
          <section id="event-map" className="space-y-6">
            <SectionHeading>Địa điểm</SectionHeading>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm border border-border text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-foreground leading-tight">
                      {event.locations?.[0]?.name || "Địa điểm chưa xác định"}
                    </p>
                    <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                      {event.locations?.[0]?.address || "Thông tin địa chỉ đang được cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border overflow-hidden shadow-md h-[400px]">
                <EventLocation event={event} />
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section>
            <SectionHeading>Về sự kiện</SectionHeading>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>
            {event.subtitle && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                <p className="text-xs font-medium text-foreground/80">{event.subtitle}</p>
              </div>
            )}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {event.tags.map((tag, i) => (
                  <span
                    key={`${tag.tagName}-${i}`}
                    className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                  >
                    #{tag.tagName}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Ticket Map Section */}
          {(event.ticketMapUrl || (event as any).TicketMapUrl) && (
            <section>
              <SectionHeading>Sơ đồ vé</SectionHeading>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden">
                <div className="relative aspect-[16/9] w-full bg-muted/30 rounded-xl overflow-hidden">
                  <Image
                    src={event.ticketMapUrl || (event as any).TicketMapUrl}
                    alt="Sơ đồ vé"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Organizer Section */}
          <section>
            <SectionHeading>Nhà tổ chức</SectionHeading>
            <Link
              href={`/organizers/${event.organizer?.id || ""}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {organizer?.name || event.organizer?.name || "Nhà tổ chức"}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground italic">
                  {organizer?.description || "Bấm để xem thêm thông tin về nhà tổ chức"}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </section>
        </div>

        {/* Right: Sidebar */}
        <aside className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="sticky top-24 space-y-8">
            {/* Ticket Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              {/* <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Giá vé từ</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-zinc-900">
                    {ticketTypes.length > 0
                      ? minPrice === 0
                        ? "Miễn phí"
                        : `${minPrice.toLocaleString("vi-VN")}`
                      : "---"}
                  </span>
                  {ticketTypes.length > 0 && minPrice > 0 && (
                    <span className="text-lg font-bold text-zinc-900">₫</span>
                  )}
                </div>
              </div> */}

              {ticketTypes.length > 0 && (
                <div className="space-y-3 mb-6">
                  {ticketTypes.map((tt) => {
                    const total = tt.totalQuantity ?? 0;
                    const available = tt.availableQuantity ?? 0;
                    const sold = total - available;
                    const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
                    return (
                      <div key={tt.id} className="rounded-lg border border-border bg-muted/50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{tt.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(tt.price ?? 0) === 0 ? "Miễn phí" : `${Number(tt.price).toLocaleString("vi-VN")}₫`}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-foreground shrink-0">{sold}/{total}</span>
                        </div>
                        <div className="mt-1.5 h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-xs font-medium text-muted-foreground">Đã bán {totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0}%</span>
                    <span className="text-xs font-bold text-foreground">{soldTickets}/{totalTickets}</span>
                  </div>
                </div>
              )}

              {ticketTypes.length > 0 ? (
                event.status === EventStatus.OPENED ? (
                  user ? (
                    <Button
                      asChild
                      className="h-12 w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
                    >
                      <Link href={`/events/${event.id}/booking`}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Mua vé ngay
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="h-12 w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
                    >
                      <Link href={`/login?redirect=${encodeURIComponent(`/events/${event.id}/booking`)}`}>
                        Đăng nhập ngay
                      </Link>
                    </Button>
                  )
                ) : (
                  <div className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-muted text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {event.status === EventStatus.PUBLISHED
                        ? "Chưa mở bán vé"
                        : event.status === EventStatus.CLOSED
                          ? "Đã đóng đăng ký"
                          : "Không thể mua vé"}
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chưa mở bán</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 h-10 rounded-lg text-xs font-bold border-border bg-card hover:bg-muted text-foreground">
                  <Heart className="mr-2 h-3.5 w-3.5" />
                  Lưu
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-lg text-xs font-bold border-border bg-card hover:bg-muted text-foreground"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-3.5 w-3.5" />
                  Chia sẻ
                </Button>
              </div>
            </div>

            {/* Similar Events */}
            {eventRelated.length > 0 && (
              <div className="space-y-4">
                <SectionHeading>Sự kiện tương tự</SectionHeading>
                <div className="grid gap-4">
                  {eventRelated.slice(0, 3).map((ev) => (
                    <Link
                      key={ev.id}
                      href={`/events/${ev.id}`}
                      className="flex gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-md hover:border-primary/20 group"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={ev.thumbnailUrl || ev.bannerUrl || FALLBACK_EVENT_IMAGE}
                          alt={ev.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {ev.name}
                        </h4>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(ev.startTime), "dd/MM/yyyy", { locale: vi })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
