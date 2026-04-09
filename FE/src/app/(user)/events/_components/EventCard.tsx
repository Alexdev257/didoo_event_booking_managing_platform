"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Event } from "@/types/event";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800";

interface EventCardProps {
  event: Event;
  badge?: string;
  badgeClassName?: string;
  href?: string;
}

export function EventCard({
  event,
  badge,
  badgeClassName = "bg-primary",
  href,
}: EventCardProps) {
  const imageUrl = event.thumbnailUrl || event.bannerUrl || FALLBACK_IMAGE;
  const location = event.locations?.[0]?.name || event.locations?.[0]?.address || "Sẽ cập nhật";

  return (
    <Link
      href={href || `/events/${event.id}`}
      className="block rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={event.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span
          className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase text-white ${badgeClassName}`}
        >
          {badge || event.category?.name || "Sự kiện"}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(new Date(event.startTime), "EEE, dd MMM • HH:mm", { locale: vi })}
          </div>
          <h3 className="text-lg font-bold text-white line-clamp-2">{event.name}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
