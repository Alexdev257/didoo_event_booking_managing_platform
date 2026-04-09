"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketCard from "@/components/ui/TicketCard";
import { Event } from "@/types/event";

interface ListEventProps {
  title: string;
  eventData: Event[];
  relatedEvent?: boolean;
}

export default function ListEvent({ title, eventData, relatedEvent }: ListEventProps) {
  if (!eventData?.length) return null;

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {relatedEvent ? "Related Events" : "Khuyen nghi"}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-full border-border bg-card text-foreground hover:bg-muted"
        >
          <Link href="/events">
            Xem them
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {eventData.map((event) => (
          <TicketCard key={event.id} {...event} />
        ))}
      </div>
    </section>
  );
}
