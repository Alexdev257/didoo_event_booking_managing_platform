'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '@/types/event';
import Image from 'next/image';

interface Props {
    events: Event[];
    onSelect: (id: string) => void;
}

export default function CustomHeroCarousel({ events, onSelect }: Props) {
    return (
        <div className="w-full">
            <p className="text-white/90 text-xs font-bold uppercase tracking-[0.4em] mb-4 ml-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                More Events
            </p>

            <div className="flex gap-4 overflow-visible">
                <AnimatePresence mode="popLayout" initial={false}>
                    {events.map((event) => (
                        <motion.div
                            key={event.id}
                            layout // Tự động dồn hàng sang trái khi có card biến mất
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25
                            }}
                            onClick={() => onSelect(event.id)}
                            className="relative shrink-0 cursor-pointer"
                        >
                            {/* Khung Card đứng - Kích thước cố định để tránh nhảy layout */}
                            <div className="relative w-[150px] h-[210px] md:w-[190px] md:h-[260px] rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">

                                {/* layoutId khớp với nền để tạo hiệu ứng bung hình */}
                                <motion.div
                                    layoutId={`img-${event.id}`}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <Image
                                        src={event.thumbnailUrl || event.bannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'}
                                        alt={event.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </motion.div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70" />

                                <div className="absolute bottom-0 p-4 w-full">
                                    <p className="text-pink-500 text-[10px] font-black uppercase mb-1">
                                        {new Date(event.startTime).toLocaleDateString('vi', { day: 'numeric', month: 'short' })}
                                    </p>
                                    <h4 className="text-white text-xs md:text-sm font-bold uppercase leading-tight line-clamp-2">
                                        {event.name}
                                    </h4>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}