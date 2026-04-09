"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Event } from "@/types/event";

const FALLBACK_EVENT =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070";

interface OrganizerEventCardProps {
  event: Event;
}

export function OrganizerEventCard({ event }: OrganizerEventCardProps) {
  const startDate = new Date(event.startTime);
  const location =
    event.locations?.[0]?.name || event.locations?.[0]?.address || "Sẽ cập nhật";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={event.thumbnailUrl || event.bannerUrl || FALLBACK_EVENT}
          alt={event.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <span className="absolute left-4 top-4 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground">
          {format(startDate, "dd MMM", { locale: vi })}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground line-clamp-2">{event.name}</h3>
        <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
            {event.openTime || "Sẽ cập nhật"} - {event.closedTime || "Sẽ cập nhật"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
            {location}
          </span>
        </div>
        <span className="mt-4 flex w-full items-center justify-center rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground transition group-hover:border-primary group-hover:text-primary">
          Xem sự kiện
        </span>
      </div>
    </Link>
  );
}
