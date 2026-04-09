"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { EventStatus } from "@/utils/enum";

interface DetailPlaceProps {
  eventData: Event;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;
}

export default function DetailPlace({ eventData, setSelectedEvent }: DetailPlaceProps) {
  const eventDate = new Date(eventData.startTime);
  const isValidDate = !isNaN(eventDate.getTime());
  const isActive = eventData.status === EventStatus.OPENED;

  return (
    <div
      onClick={() => setSelectedEvent(eventData)}
      className="group relative flex gap-4 p-4 rounded-[1.5rem] bg-card/30 dark:bg-card/20 border border-white/40 dark:border-white/15 hover:border-primary/60 hover:bg-card/50 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-lg shadow-sm hover:shadow-xl hover:-translate-y-1 w-full max-w-full"
    >
      <div className="flex flex-col gap-3 shrink-0 w-28">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-md">
          <Image
            src={eventData.thumbnailUrl || "/placeholder.png"}
            alt={eventData.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="112px"
          />
          {eventData.category && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-md border border-white/20">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                {eventData.category.name}
              </span>
            </div>
          )}
        </div>

        <Button className="w-full h-8 text-xs rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 shadow-none" asChild>
          <Link href={`/events/${eventData.id}`} onClick={(e) => e.stopPropagation()}>
            Xem chi tiết
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-w-0 py-0.5 gap-2">
        <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {eventData.name}
        </h3>

        {eventData.organizer && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-muted overflow-hidden relative border border-border">
              {eventData.organizer.logoUrl ? (
                <Image
                  src={eventData.organizer.logoUrl}
                  alt={eventData.organizer.name}
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              ) : (
                <div className="w-full h-full bg-primary/20" />
              )}
            </div>
            <span className="text-xs font-medium text-foreground/80 truncate">
              {eventData.organizer.name}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 text-xs text-muted-foreground pt-3 border-t border-dashed border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium">
              {isValidDate ? format(eventDate, "dd MMM, yyyy", { locale: vi }) : "Sẽ cập nhật"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="truncate max-w-[180px]">
              {eventData.locations?.[0]?.address || "Chưa cập nhật"}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`absolute top-4 right-4 w-2 h-2 rounded-full ring-4 ring-background/50 ${
          isActive ? "bg-emerald-500" : "bg-zinc-400"
        }`}
      />
    </div>
  );
}
