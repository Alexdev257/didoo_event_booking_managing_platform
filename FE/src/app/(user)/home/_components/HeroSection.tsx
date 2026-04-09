'use client';

import { useState, useCallback, useEffect } from 'react';
import { Event } from '@/types/event';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CustomHeroCarousel from './CustomHeroCarousel';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection({ events: initialEvents }: { events: Event[] }) {
    // Quản lý danh sách sự kiện, phần tử đầu tiên (index 0) luôn là ảnh nền active
    const [eventList, setEventList] = useState(initialEvents);

    // Update local state when prop changes
    useEffect(() => {
        setEventList(initialEvents);
    }, [initialEvents]);

    if (!eventList || eventList.length === 0) return null;

    const activeEvent = eventList[0];

    // Hàm xử lý khi click chọn ảnh: 
    // Ảnh được chọn bung lên làm nền, ảnh nền cũ được đẩy xuống cuối danh sách.
    const handleSelectEvent = useCallback((selectedId: string) => {
        setEventList((prev) => {
            const selectedIndex = prev.findIndex(e => e.id === selectedId);
            if (selectedIndex === -1) return prev;

            const selectedItem = prev[selectedIndex];
            const remainingBefore = prev.slice(0, selectedIndex);
            const remainingAfter = prev.slice(selectedIndex + 1);

            // Thứ tự mới: [Ảnh mới chọn, ...Các ảnh phía sau, ...Các ảnh phía trước (bao gồm cả ảnh nền cũ)]
            return [selectedItem, ...remainingAfter, ...remainingBefore];
        });
    }, []);

    // Slider chỉ hiển thị từ phần tử thứ 2 trở đi
    const sliderEvents = eventList.slice(1);

    return (
        <section className="relative w-full h-[85vh] min-h-[580px] md:h-screen overflow-hidden bg-black">

            {/* BACKGROUND LAYER - Hiệu ứng bung từ dưới lên */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={activeEvent.id}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8 } }}
                    >
                        {/* layoutId khớp với card để tạo hiệu ứng bung hình */}
                        <motion.div
                            layoutId={`img-${activeEvent.id}`}
                            className="absolute inset-0 w-full h-full"
                            transition={{ type: "spring", stiffness: 120, damping: 25 }}
                        >
                            <Image
                                src={activeEvent.thumbnailUrl || activeEvent.bannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'}
                                alt={activeEvent.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>

                        {/* Overlay làm tối nền - giảm opacity để dễ nhìn hơn */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* CONTENT LAYER */}
            <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 flex flex-col justify-end pb-12 md:pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">

                    {/* LEFT CONTENT: Title & Buttons */}
                    <div className="lg:col-span-7 pb-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeEvent.id}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                                    },
                                    exit: { opacity: 0, transition: { duration: 0.3 } }
                                }}
                            >
                                <motion.h1
                                    variants={{
                                        hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
                                        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                                    }}
                                    className="text-4xl sm:text-6xl lg:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter mb-6 md:mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                >
                                    {activeEvent.name}
                                </motion.h1>
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                                    }}
                                    className="flex gap-4"
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Link href={`/events/${activeEvent.id}/booking`}> 
                                      <Button className="h-14 px-10 rounded-full bg-white text-black font-bold uppercase hover:bg-gray-200 transition-colors shadow-lg">
                                            Get Tickets
                                        </Button>
                                      </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link href={`/events/${activeEvent.id}`}> 
                                        <Button variant="outline" className="h-14 px-8 rounded-full !bg-white/10 !text-white !border-2 !border-white/50 backdrop-blur-md uppercase font-bold hover:!bg-white/30 hover:!border-white transition-colors shadow-lg">
                                            More Info
                                        </Button>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT CONTENT: Slider */}
                    <div className="lg:col-span-5 overflow-visible hidden sm:block">
                        <CustomHeroCarousel
                            events={sliderEvents}
                            onSelect={handleSelectEvent}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}