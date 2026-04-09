"use client";

import { Event } from "@/types/event";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SpecialEventsProps {
  events: Event[];
}

export function SpecialEvents({ events }: SpecialEventsProps) {
  const gridEvents = events.slice(0, 4);
  const getLocation = (event: Event) =>
    event.locations?.[0]?.name || event.locations?.[0]?.address || "Địa điểm sẽ cập nhật";

  return (
    <section className="py-12 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-semibold text-sm">Nổi bật</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
              Sự kiện sắp diễn ra
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-bold text-sm text-primary md:text-muted-foreground md:hover:text-primary transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
          {gridEvents[0] && (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <Link
                href={`/events/${gridEvents[0].id}`}
                className="block relative h-full min-h-[320px] rounded-2xl overflow-hidden group"
              >
                <Image
                  src={
                    gridEvents[0].thumbnailUrl ||
                    gridEvents[0].bannerUrl ||
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070"
                  }
                  alt={gridEvents[0].name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent" />

                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                  <span className="inline-flex w-fit px-3 py-1 rounded-full bg-white text-zinc-900 text-xs font-semibold">
                    Nổi bật
                  </span>
                  <div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                      {gridEvents[0].name}
                    </h3>
                    <div className="flex items-center gap-3 text-white/90 text-xs sm:text-sm font-semibold">
                      <span>
                        {format(new Date(gridEvents[0].startTime), "dd MMM, yyyy", { locale: vi })}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
                      <span className="truncate">{gridEvents[0].category?.name || "Sự kiện"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="lg:col-span-5 flex flex-col gap-4">
            {gridEvents.slice(1).map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  href={`/events/${event.id}`}
                  className="flex gap-4 p-4 rounded-2xl bg-muted border border-border/60 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="w-20 h-20 shrink-0 rounded-xl bg-secondary flex flex-col items-center justify-center text-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <span className="text-xs font-semibold">
                      {format(new Date(event.startTime), "MMM", { locale: vi })}
                    </span>
                    <span className="text-2xl font-bold leading-none">
                      {format(new Date(event.startTime), "dd", { locale: vi })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                      {event.category?.name || "Sự kiện"}
                    </span>
                    <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {event.name}
                    </h4>
                    <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {format(new Date(event.startTime), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                      <p className="flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {getLocation(event)}
                      </p>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      Đã phát hành
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
