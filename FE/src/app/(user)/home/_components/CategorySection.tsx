"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarClock, Sparkles } from "lucide-react";
import { Event } from "@/types/event";

interface CategorySectionProps {
  openedEvents: Event[];
}

export default function CategorySection({ openedEvents }: CategorySectionProps) {
  if (!openedEvents?.length) return null;
  const items = openedEvents.slice(0, 3);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Đang mở
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Sự kiện đang mở bán
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Theo dõi các sự kiện đang mở để đặt vé ngay hôm nay.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Xem tất cả sự kiện
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {items.map((event) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <Link
                href={`/events/${event.id}`}
                className="group block rounded-2xl border border-border bg-muted p-5 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{event.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.category?.name || "Sự kiện"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    ĐANG MỞ
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {new Date(event.startTime).toLocaleString("vi-VN")}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
