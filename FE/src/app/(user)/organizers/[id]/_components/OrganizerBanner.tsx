"use client";

import Image from "next/image";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop";

interface OrganizerBannerProps {
  bannerUrl?: string;
  name: string;
}

export function OrganizerBanner({ bannerUrl, name }: OrganizerBannerProps) {
  return (
    <section className="relative h-[280px] md:h-[340px] w-full overflow-hidden">
      <Image
        src={bannerUrl || FALLBACK_BANNER}
        alt={name}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/40 to-transparent" />
    </section>
  );
}
