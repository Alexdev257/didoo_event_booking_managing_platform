"use client";

import Image from "next/image";
import { format, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { Share2, CalendarDays, MapPin } from "lucide-react";
import { Event } from "@/types/event";
import { EventStatus } from "@/utils/enum";
import { toast } from "sonner";

interface HeroSectionProps {
  event: Event;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2070&auto=format&fit=crop";

export default function HeroSection({ event }: HeroSectionProps) {
  const startDate = event.startTime ? new Date(event.startTime) : null;
  const endDate = event.endTime ? new Date(event.endTime) : null;

  const dateLabel =
    startDate && isValid(startDate)
      ? endDate && isValid(endDate) && startDate.getTime() !== endDate.getTime()
        ? `${format(startDate, "d", { locale: vi })} - ${format(endDate, "d 'Tháng' M, yyyy", { locale: vi })}`
        : format(startDate, "d 'Tháng' M, yyyy", { locale: vi })
      : "Đang cập nhật";

  const locationLabel =
    event.locations?.[0]?.name || event.locations?.[0]?.address || "Địa điểm sẽ cập nhật";

  const isHot = event.status === EventStatus.OPENED;

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

  return (
    <section className="relative h-[450px] md:h-[600px] w-full overflow-hidden">
      <Image
        src={event.bannerUrl || event.thumbnailUrl || FALLBACK_IMAGE}
        alt={event.name}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="mx-auto max-w-7xl relative h-full flex flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {isHot && (
              <span className="inline-flex rounded-md bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20">
                Hot event
              </span>
            )}
            <span className="inline-flex rounded-md bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {event.category?.name || "Sự kiện"}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl tracking-tight">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-white/90 font-medium">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm md:text-base">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm md:text-base">{locationLabel}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="absolute right-4 top-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 active:scale-95 group"
          aria-label="Chia sẻ"
        >
          <Share2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
        </button>
      </div>
    </section>
  );
}
