'use client';

import { MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import MapComponent, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getDistanceKm } from "@/utils/helper";
import { Event } from "@/types/event";
import { useLocationContext } from "@/contexts/locationContext";
import envconfig from "../../../../config";

const GOONG_API_KEY = "1kLRnoD5VyIe5cexVMp6fWAEMcAF0LyZSuA7hss5";

interface MapEventProps {
  eventData: Event[];
}

// ================== DISTANCE UTILS ==================

const RADIUS_KM = 25;

// ================== COMPONENT ==================
export default function MapEvent({ eventData }: MapEventProps) {
  const { location, isLoading: isLocationLoading } = useLocationContext();
  const userLocation = location ? { lat: location.latitude, lng: location.longitude } : null;

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Sync loading state with location context (with slight delay for UX)
  useEffect(() => {
    if (!isLocationLoading) {
      const t = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [isLocationLoading]);

  // ================== 2️⃣ INTERSECTION ==================
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ================== 3️⃣ FILTER EVENT <= 5KM ==================
  const nearbyEvents = useMemo(() => {
    if (!userLocation) return [];

    return eventData
      .map((event) => {
        const loc = event.locations?.[0] as any;
        const lat = loc?.latitude ?? loc?.Latitude ?? 0;
        const lng = loc?.longitude ?? loc?.Longitude ?? 0;

        return {
          ...event,
          distance: getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          ),
        };
      })
      .filter((e) => e.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [eventData, userLocation]);

  // ================== 4️⃣ STAGGER ANIMATION ==================
  useEffect(() => {

    if (!isExpanded || !mapVisible) {
      setVisibleEvents([]);
      return;
    }
    console.log(nearbyEvents);

    const timers = nearbyEvents.map((_, idx) =>
      setTimeout(() => {
        setVisibleEvents((prev) =>
          prev.includes(idx) ? prev : [...prev, idx]
        );
      }, 200 * (idx + 1))
    );

    return () => timers.forEach(clearTimeout);
  }, [isExpanded, mapVisible, nearbyEvents]);


  return (
    <section ref={sectionRef} className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* TITLE */}
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Khám phá sự kiện quanh bạn</h2>
          <p className="text-muted-foreground">
            Các sự kiện trong bán kính {RADIUS_KM}km từ vị trí hiện tại
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative min-h-[520px]">

            {/* MAP */}
            <div
              className={`
                relative h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-white/20
                transition-all duration-700
                ${mapVisible ? "opacity-100" : "opacity-0 translate-y-6"}
                ${isExpanded && nearbyEvents.length > 0 ? "lg:w-[70%]" : "w-full"}
              `}
              onClick={() => setIsExpanded(true)}
            >
              {isLoading ? (
                <div className="w-full h-full relative bg-muted">
                  <Skeleton className="w-full h-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Spinner />
                  </div>
                </div>
              ) : (
                userLocation && (
                  <MapComponent
                    mapLib={maplibregl}
                    initialViewState={{
                      longitude: selectedEvent && selectedEvent.locations?.[0] ? ((selectedEvent.locations[0] as any).longitude ?? (selectedEvent.locations[0] as any).Longitude) : userLocation.lng,
                      latitude: selectedEvent && selectedEvent.locations?.[0] ? ((selectedEvent.locations[0] as any).latitude ?? (selectedEvent.locations[0] as any).Latitude) : userLocation.lat,
                      zoom: 13,
                    }}
                    style={{ width: "100%", height: "520px" }}
                    mapStyle="https://tiles.goong.io/assets/goong_map_web.json?api_key=SnGhg9VIWX1fplbNQZkQnVNlUpsxCdViDKvUqtax"
                  >
                    <NavigationControl position="top-right" />

                    {/* USER MARKER */}
                    <Marker
                      longitude={userLocation.lng}
                      latitude={userLocation.lat}
                      anchor="bottom"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg" title="Vị trí của bạn" />
                    </Marker>

                    {/* EVENT MARKERS */}
                    {nearbyEvents.map((event) => {
                      const loc = event.locations?.[0] as any;
                      const lat = loc?.latitude ?? loc?.Latitude ?? 0;
                      const lng = loc?.longitude ?? loc?.Longitude ?? 0;

                      return (
                        <Marker
                          key={event.id}
                          longitude={lng}
                          latitude={lat}
                          anchor="bottom"
                          onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setSelectedEvent(event);
                            setIsExpanded(true);
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all ${selectedEvent?.id === event.id
                              ? 'bg-red-500 scale-125 animate-bounce'
                              : 'bg-orange-500'
                              }`}
                            title={event.name}
                          />
                        </Marker>
                      );
                    })}
                  </MapComponent>
                )
              )}
            </div>

            {/* EVENT LIST */}
            <div
              className={`
                absolute top-0 right-0 h-full flex flex-col justify-center gap-4
                lg:w-[450px] -ml-[15px] z-20 pointer-events-none lg:pointer-events-auto
                transition-all duration-700
                ${isExpanded && nearbyEvents.length > 0
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"}
              `}
            >
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="flex gap-3">
                        <Skeleton className="w-24 h-20 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                nearbyEvents.map((event, idx) => {
                  const show = visibleEvents.includes(idx);

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`
                      flex gap-3 rounded-2xl p-4 cursor-pointer pointer-events-auto
                      bg-white/90 dark:bg-card/90 backdrop-blur-md border border-white/20
                      shadow-lg hover:shadow-xl
                      transition-all duration-500
                      ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}
                    `}
                    >
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={event.thumbnailUrl || "/placeholder.png"}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold uppercase line-clamp-2 text-foreground">
                          {event.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs mt-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {event.locations?.[0]?.address || "Đang cập nhật"}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs font-medium text-primary">
                            Cách {event.distance.toFixed(1)} km
                          </div>
                          <div className="text-xs font-bold text-foreground bg-accent/10 px-2 py-1 rounded-full">
                            Sắp mở bán
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
