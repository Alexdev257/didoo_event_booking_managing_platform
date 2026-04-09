"use client";

import { Sparkles } from "lucide-react";

interface EventsPageHeroProps {
  totalEvents: number;
  totalCategories: number;
}

export function EventsPageHero({ totalEvents, totalCategories }: EventsPageHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pt-8 pb-8 md:pt-12 md:pb-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-primary/5 blur-[80px]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          Khám phá sự kiện
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Sự kiện sắp diễn ra
        </h1>
        <p className="mt-2 text-muted-foreground font-medium">
          {totalEvents} sự kiện • {totalCategories} danh mục
        </p>
      </div>
    </section>
  );
}
