"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EventsGridProps {
  title: string;
  eventData: Event[];
  description?: string;
  icon?: ReactNode;
  viewAllLink?: string;
}

export default function EventsGrid({
  title,
  eventData,
  description,
  icon,
  viewAllLink = "/events",
}: EventsGridProps) {
  if (!eventData?.length) return null;

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            {icon}
            <span>{title}</span>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-xl w-fit">
          <Link href={viewAllLink}>
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {eventData.map((event) => (
          <motion.div
            key={event.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <Link
              href={`/events/${event.id}`}
              className="block relative h-[360px] rounded-2xl overflow-hidden group border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={
                  event.thumbnailUrl ||
                  event.bannerUrl ||
                  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800"
                }
                alt={event.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/40 to-transparent" />

              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <span className="inline-flex w-fit px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-3">
                  {event.category?.name || "Sự kiện"}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-3">
                  {event.name}
                </h3>
                <div className="flex flex-col gap-1.5 text-muted-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    {format(new Date(event.startTime), "dd MMM yyyy", { locale: vi })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      {event.locations?.[0]?.name || event.locations?.[0]?.address || "Sẽ cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
