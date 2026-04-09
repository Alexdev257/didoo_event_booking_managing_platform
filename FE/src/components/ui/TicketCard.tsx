"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Event } from "@/types/event";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

const TicketCard = ({
  id,
  name,
  startTime,
  locations,
  thumbnailUrl,
  bannerUrl,
  category,
}: Event) => {
  const dateLabel =
    startTime && isValid(new Date(startTime))
      ? format(new Date(startTime), "dd MMM yyyy", { locale: vi })
      : "Đang cập nhật";

  const locationLabel = locations?.[0]?.name || "Địa điểm sắp cập nhật";

  return (
    <Link href={`/events/${id}`} className="group block h-full">
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-[0_20px_40px_-30px_rgba(14,116,144,0.55)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={thumbnailUrl || bannerUrl || FALLBACK_IMAGE}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
            {category?.name || "Event"}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <h3 className="line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-sky-700">
            {name}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-sky-600" />
              <span>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-600" />
              <span className="line-clamp-1">{locationLabel}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-sm font-semibold text-muted-foreground">Xem chi tiết</span>
            <span className="rounded-full bg-sky-50 p-2 text-sky-700 transition-colors group-hover:bg-sky-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

export default TicketCard;
