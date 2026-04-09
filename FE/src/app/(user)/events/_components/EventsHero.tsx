"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { format, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";

interface EventsHeroProps {
  featuredEvent?: Event;
  totalEvents: number;
  totalCategories: number;
}

export default function EventsHero({
  featuredEvent,
  totalEvents,
  totalCategories,
}: EventsHeroProps) {
  const featuredDate =
    featuredEvent?.startTime && isValid(new Date(featuredEvent.startTime))
      ? format(new Date(featuredEvent.startTime), "dd MMM yyyy", { locale: vi })
      : "Đang cập nhật";

  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-16 md:pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-12 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 lg:col-span-6 xl:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Khám phá sự kiện
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Tìm sự kiện
              <span className="block text-primary mt-1">phù hợp với bạn</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Khám phá sự kiện sắp diễn ra. Từ concert đến hội nghị, đặt vé dễ dàng.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">Sự kiện</p>
              <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">Danh mục</p>
              <p className="text-2xl font-bold text-foreground">{totalCategories}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="h-12 rounded-xl font-semibold">
              <Link href="#events-grid">
                Khám phá ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl">
              <Link href="/map">Xem bản đồ</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-6 xl:col-span-5"
        >
          {featuredEvent ? (
            <Link href={`/events/${featuredEvent.id}`} className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={
                      featuredEvent.thumbnailUrl ||
                      featuredEvent.bannerUrl ||
                      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800"
                    }
                    alt={featuredEvent.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />

                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground">
                    Nổi bật
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    <h2 className="line-clamp-2 text-2xl font-bold text-white">
                      {featuredEvent.name}
                    </h2>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        {featuredDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">
                          {featuredEvent.locations?.[0]?.name || featuredEvent.locations?.[0]?.address || "Địa điểm sẽ cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted p-12 text-center">
              <p className="text-muted-foreground font-medium">Chưa có sự kiện nổi bật.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
