
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Event } from '@/types/event';

const EventCard = ({
  id,
  name,
  startTime,
  locations,
  thumbnailUrl,
  category,
}: Event) => {
  const address = locations && locations.length > 0 ? locations[0].address : "N/A";
  const price = "N/A"; // price not in Event type, using placeholder or handle accordingly
  return (
    <Link href={`/events/${id}`} className="block group">
      <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative h-full"
      >
        <div className='relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 backdrop-blur-xl transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]'>

          {/* Image Container */}
          <div className='relative h-[220px] overflow-hidden'>
            <Image
              src={thumbnailUrl || "/placeholder.png"}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {category?.name && (
                <div className="bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                  {category.name}
                </div>
              )}
              <motion.div
                whileHover={{ rotate: 45 }}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              >
                <ArrowUpRight className="w-5 h-5" />
              </motion.div>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="bg-background/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
                <Ticket className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-white uppercase">{price}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium translate-y-0 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center border border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span>{new Date(startTime).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium translate-y-0 group-hover:-translate-y-1 transition-transform duration-300 delay-150">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center border border-border">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="truncate">{address}</span>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-border bg-secondary flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="attendee" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-border bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                  +12
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary group-hover:underline underline-offset-4">Chi tiết</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link >
  );
};

export default EventCard;