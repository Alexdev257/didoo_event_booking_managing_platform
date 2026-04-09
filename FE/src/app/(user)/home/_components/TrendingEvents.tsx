"use client";

import { Organizer } from "@/types/event";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

interface TrendingEventsProps {
  organizers: Organizer[];
}

export function TrendingEvents({ organizers }: TrendingEventsProps) {
  if (!organizers?.length) return null;

  const duplicated = [...organizers, ...organizers];

  return (
    <section className="py-12 lg:py-24 bg-muted border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary font-semibold text-sm">Đối tác</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Nhà tổ chức nổi bật
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Các đối tác uy tín mang đến những sự kiện chất lượng.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-muted to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-muted to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex gap-6 py-4">
          {duplicated.map((org, idx) => (
            <div
              key={`${org.id}-${idx}`}
              className="shrink-0 w-[220px] sm:w-[280px] group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                <Image
                  src={org.logoUrl || org.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800"}
                  alt={org.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <h3 className="text-white font-bold text-lg mb-1">{org.name}</h3>
                  <p className="text-zinc-300 text-sm line-clamp-2 mb-4">
                    {org.description || "Nhà tổ chức sự kiện"}
                  </p>
                  <Button asChild size="sm" className="rounded-xl w-full bg-white text-zinc-900 hover:bg-zinc-100">
                    <Link href={`/organizers/${org.id}`}>Xem trang</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (max-width: 640px) {
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        }
      `}</style>
    </section>
  );
}
