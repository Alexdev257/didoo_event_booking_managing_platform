"use client";

import { useEffect, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { getDistanceKm } from "@/utils/helper";
import { useLocationContext } from "@/contexts/locationContext";
import envconfig from "../../../../../config";

interface EventLocationProps {
  event: Event;
}

interface ResolvedLocation {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

const DEFAULT_CENTER = {
  latitude: 10.7769,
  longitude: 106.7009,
};

export default function EventLocation({ event }: EventLocationProps) {
  const router = useRouter();
  const { location } = useLocationContext();
  const [resolvedLocations, setResolvedLocations] = useState<ResolvedLocation[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(true);

  const userLocation = location ? { lat: location.latitude, lng: location.longitude } : null;
  const rawLocations = event.locations || [];
  const categoryIcon = event.category?.iconUrl;

  // 2. Geocode missing coordinates
  useEffect(() => {
    async function resolveCoordinates() {
      setIsGeocoding(true);
      const GOONG_API_KEY = "1kLRnoD5VyIe5cexVMp6fWAEMcAF0LyZSuA7hss5";
      const updatedLocations: ResolvedLocation[] = [];

      for (const loc of rawLocations) {
        let lat = (loc as any).latitude ?? (loc as any).Latitude;
        let lng = (loc as any).longitude ?? (loc as any).Longitude;
        let addr = (loc as any).address || (loc as any).Address || "";
        let name = (loc as any).name || (loc as any).Name || "";

        // If coordinates are missing/zero but we have an address, geocode it
        if ((!lat || !lng || (lat === 0 && lng === 0)) && addr && GOONG_API_KEY) {
          try {
            const res = await fetch(`https://rsapi.goong.io/Geocode?address=${encodeURIComponent(addr)}&api_key=${GOONG_API_KEY}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const { lat: resolvedLat, lng: resolvedLng } = data.results[0].geometry.location;
              lat = resolvedLat;
              lng = resolvedLng;
            }
          } catch (error) {
            console.error("Goong geocoding failed for address:", addr, error);
          }
        }

        updatedLocations.push({
          name: name,
          address: addr,
          latitude: lat || null,
          longitude: lng || null
        });
      }

      setResolvedLocations(updatedLocations);
      setIsGeocoding(false);
    }

    if (rawLocations.length > 0) {
      resolveCoordinates();
    } else {
      setIsGeocoding(false);
    }
  }, [rawLocations]);

  const firstLocation = resolvedLocations[0];
  const firstLat = firstLocation?.latitude;
  const firstLng = firstLocation?.longitude;

  const mapCenter = {
    latitude: firstLat || DEFAULT_CENTER.latitude,
    longitude: firstLng || DEFAULT_CENTER.longitude,
  };

  const distance =
    userLocation && firstLat && firstLng
      ? getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        firstLat,
        firstLng,
      )
      : null;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Địa điểm sự kiện
        </h2>
        <p className="text-sm text-muted-foreground">
          Xem vị trí trên bản đồ và chỉ đường.
        </p>
      </div>

      <div className="relative w-full group mb-8 md:mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm h-[420px] md:h-[480px] w-full">
          {isGeocoding ? (
            <div className="flex h-full w-full items-center justify-center p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Đang định vị địa điểm...</span>
              </div>
            </div>
          ) : resolvedLocations.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
              Đang cập nhật thông tin địa điểm.
            </div>
          ) : (
            <>
              {/* Goong Map Implementation */}
              <Map
                mapLib={maplibregl}
                initialViewState={{
                  latitude: mapCenter.latitude,
                  longitude: mapCenter.longitude,
                  zoom: 14,
                }}
                mapStyle="https://tiles.goong.io/assets/goong_map_web.json?api_key=SnGhg9VIWX1fplbNQZkQnVNlUpsxCdViDKvUqtax"
                style={{ width: "100%", height: "100%" }}
              >
                <NavigationControl position="top-right" />

                {resolvedLocations.map((loc, idx) => {
                  const lat = loc.latitude;
                  const lng = loc.longitude;

                  if (!lat || !lng) return null;

                  return (
                    <Marker
                      key={`${idx}-${lat}-${lng}`}
                      latitude={lat}
                      longitude={lng}
                      anchor="bottom"
                    >
                      <div className="relative rounded-full border-2 border-primary/20 bg-primary p-1 text-white shadow-lg motion-safe:animate-bounce flex items-center justify-center w-10 h-10 overflow-hidden">
                        {categoryIcon ? (
                          <img src={categoryIcon} alt="Biểu tượng vị trí" className="w-full h-full object-cover" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </div>
                    </Marker>
                  );
                })}

                {userLocation && (
                  <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
                    <div className="h-4 w-4 rounded-full border-[3px] border-primary/40 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </Marker>
                )}
              </Map>

              {firstLat && firstLng && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer bg-transparent hover:bg-black/10 dark:hover:bg-white/5 transition-colors duration-300"
                  onClick={() => {
                    router.push(`/map?eventId=${event.id}&lat=${firstLat}&lng=${firstLng}`);
                  }}
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl bg-background/95 border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                    Mở bản đồ
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Right Floating Info Card */}
        {!isGeocoding && resolvedLocations.length > 0 && firstLocation && (
          <div className="absolute bottom-4 left-4 right-4 z-20 md:left-auto md:right-6 md:w-[320px] pointer-events-none">
            <article className="rounded-2xl border border-border bg-card p-5 shadow-lg pointer-events-auto transition-all hover:shadow-xl duration-300">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground line-clamp-1">{firstLocation.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground font-semibold line-clamp-2">{firstLocation.address || "Địa chỉ sẽ cập nhật"}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                  <MapPin className="h-4 w-4" />
                </span>
              </div>

              {distance !== null && (
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted/80 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card shadow-sm text-primary">
                    <Navigation className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Khoảng cách ước tính
                    </p>
                    <p className="text-sm font-black text-foreground">{distance.toFixed(1)} km</p>
                  </div>
                </div>
              )}

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!firstLat || !firstLng) return;
                  router.push(`/map?eventId=${event.id}&lat=${firstLat}&lng=${firstLng}`);
                }}
                disabled={!firstLat || !firstLng}
                className="h-11 w-full rounded-xl font-semibold"
              >
                Chỉ đường
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </article>
          </div>
        )}
      </div>

      {!userLocation && (
        <p className="text-xs font-medium text-muted-foreground text-center md:text-left mt-2 pl-4">Bật quyền vị trí để xem khoảng cách đến sự kiện.</p>
      )}
    </section>
  );
}
