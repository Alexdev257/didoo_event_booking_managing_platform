"use client";

import { useState, useMemo } from "react";
import { Ticket } from "lucide-react";
import type { Event } from "@/types/event";
import { EventStatus } from "@/utils/enum";
import { OrganizerEventCard } from "./OrganizerEventCard";

interface OrganizerEventsSectionProps {
  events: Event[];
  isLoading?: boolean;
}

type EventTab = EventStatus.OPENED | EventStatus.PUBLISHED | EventStatus.CLOSED;

export function OrganizerEventsSection({
  events,
  isLoading = false,
}: OrganizerEventsSectionProps) {
  const [eventTab, setEventTab] = useState<EventTab>(EventStatus.PUBLISHED);

 
  const filteredEvents = useMemo(() => {
    return events.filter((event) => event.status === eventTab);
  }, [events, eventTab]);

  const getEmptyMessage = () => {
    if (eventTab === EventStatus.PUBLISHED) return "Chưa có sự kiện sắp diễn ra";
    if (eventTab === EventStatus.OPENED) return "Chưa có sự kiện đang mở bán vé";
    return "Chưa có sự kiện đã qua";
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-10">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-foreground">Sự kiện</h2>
        <div className="flex gap-1 rounded-xl bg-muted p-1 overflow-x-auto selection:bg-none">
          <button
            type="button"
            onClick={() => setEventTab(EventStatus.PUBLISHED)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition min-h-[40px] min-w-[20px] ${
              eventTab === EventStatus.PUBLISHED
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            type="button"
            onClick={() => setEventTab(EventStatus.OPENED)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition min-h-[40px] min-w-[20px] ${
              eventTab === EventStatus.OPENED
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đang mở
          </button>
          <button
            type="button"
            onClick={() => setEventTab(EventStatus.CLOSED)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition min-h-[40px] min-w-[20px] ${
              eventTab === EventStatus.CLOSED
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã qua
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {filteredEvents.map((event) => (
            <OrganizerEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 font-bold text-muted-foreground">{getEmptyMessage()}</p>
        </div>
      )}
    </section>
  );
}
