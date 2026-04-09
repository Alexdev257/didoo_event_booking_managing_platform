"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "./_components/Header";
import List from "./_components/List";
import Map from "./_components/Map";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Event } from "@/types/event";
import { useGetEvents } from "@/hooks/useEvent";
import { EventStatus } from "@/utils/enum";
import { useLocationContext } from "@/contexts/locationContext";
import { envconfig } from "../../config";
const AnimatedDoubleArrow = ({
  direction,
  isAnimating,
}: {
  direction: "left" | "right";
  isAnimating?: boolean;
}) => (
  <motion.svg
    width="22"
    height="22"
    viewBox="0 0 511.801 511.801"
    className="text-primary drop-shadow-sm"
    animate={{
      rotate: direction === "left" ? -90 : 90,
      x: isAnimating ? (direction === "left" ? [0, -4, 0] : [0, 4, 0]) : 0,
    }}
    transition={{
      x: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
      rotate: { duration: 0 },
    }}
  >
    <g fill="currentColor">
      <path d="M263.535,248.453c-4.16-4.16-10.88-4.16-15.04,0L3.054,493.787c-4.053,4.267-3.947,10.987,0.213,15.04 c4.16,3.947,10.667,3.947,14.827,0l237.867-237.76l237.76,237.76c4.267,4.053,10.987,3.947,15.04-0.213 c3.947-4.16,3.947-10.667,0-14.827L263.535,248.453z" />
      <path d="M18.201,263.493l237.76-237.76l237.76,237.76c4.267,4.053,10.987,3.947,15.04-0.213c3.947-4.16,3.947-10.667,0-14.827 L263.535,3.12c-4.16-4.16-10.88-4.16-15.04,0L3.054,248.453c-4.053,4.267-3.947,10.987,0.213,15.04 C7.534,267.547,14.041,267.547,18.201,263.493z" />
    </g>
  </motion.svg>
);



const mapStyleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${envconfig.NEXT_PUBLIC_MAP_TILES_KEY}`;

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location } = useLocationContext();
  const coordinates = location ? { lat: location.latitude, lng: location.longitude } : null;
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter state from URL
  const name = searchParams.get("name") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const sortBy = (searchParams.get("sortBy") as "date" | "distance" | "price") ?? "date";
  const pageNumber = Number(searchParams.get("pageNumber") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";
  const status = searchParams.get("status") ?? "";

  const query = useMemo(() => {
    const q: Record<string, string | number | boolean> = {
      pageNumber,
      pageSize,
      hasCategory: true,
      hasOrganizer: true,
      hasLocations: true,
      isDeleted: false,
      isDescending: false,
    };
    if (name) q.name = name;
    if (categoryId) q.categoryId = categoryId;
    if (startTime) q.startTime = startTime;
    if (endTime) q.endTime = endTime;
    if (status) q.status = Number(status);
    if (sortBy === "date") q.isDescending = false;
    return q;
  }, [pageNumber, pageSize, name, categoryId, sortBy, startTime, endTime, status]);

  const { data, isLoading } = useGetEvents(query);

  const events = data?.data?.items ?? [];
  const totalItems = data?.data?.totalItems ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => {
      const isVisible = status
        ? e.status === Number(status)
        : e.status === EventStatus.PUBLISHED || e.status === EventStatus.OPENED;
      const hasLocation =
        e.locations?.[0]?.latitude != null && e.locations?.[0]?.longitude != null;
      return isVisible && hasLocation;
    });

    if (sortBy === "distance" && coordinates) {
      result = [...result].sort((a, b) => {
        const aLat = a.locations?.[0]?.latitude ?? 0;
        const aLng = a.locations?.[0]?.longitude ?? 0;
        const bLat = b.locations?.[0]?.latitude ?? 0;
        const bLng = b.locations?.[0]?.longitude ?? 0;
        const distA = Math.sqrt(
          Math.pow(aLat - coordinates.lat, 2) + Math.pow(aLng - coordinates.lng, 2)
        );
        const distB = Math.sqrt(
          Math.pow(bLat - coordinates.lat, 2) + Math.pow(bLng - coordinates.lng, 2)
        );
        return distA - distB;
      });
    }

    return result;
  }, [events, sortBy, coordinates?.lat, coordinates?.lng]);



  const isMapLoading = !coordinates;

  return (
    <div className="relative w-full h-full overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <Map
          coordinates={coordinates}
          events={filteredEvents}
          isLoading={isMapLoading}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          mapStyle={mapStyleUrl}
        />
      </div>

      <motion.div
        initial={{ x: -460 }}
        animate={{ x: isSidebarOpen ? 0 : -460 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="absolute top-24 left-4 w-[90%] md:w-105 bottom-4 z-10 pointer-events-none"
      >
        <div className="relative flex flex-col h-full bg-background/60 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2rem] p-5 pointer-events-auto">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Khám phá sự kiện</h1>
          </div>

          <Header />

          <div className="flex-1 min-h-0 relative mt-4">
            <List
              eventsData={filteredEvents}
              isLoading={isLoading}
              setSelectedEvent={setSelectedEvent}
              currentPage={pageNumber}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={(p) => {
                const p2 = new URLSearchParams(searchParams.toString());
                p2.set("pageNumber", String(p));
                router.push(`/map?${p2.toString()}`);
              }}
            />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 -right-3 cursor-pointer p-2 hover:scale-125 transition-transform"
            onClick={() => setIsSidebarOpen(false)}
          >
            <AnimatedDoubleArrow direction="left" isAnimating />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="absolute top-1/2 -translate-y-1/2 left-0 z-20 pointer-events-auto flex items-center"
          >
            <div
              className="bg-background/80 backdrop-blur-md p-3 pr-4 rounded-r-2xl border border-l-0 border-white/20 cursor-pointer shadow-lg group"
              onClick={() => setIsSidebarOpen(true)}
            >
              <AnimatedDoubleArrow direction="right" isAnimating />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
