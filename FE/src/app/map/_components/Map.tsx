'use client';

import { useRef, useEffect, useState } from 'react';
import MapComponent, { Marker, NavigationControl, useMap, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import Image from 'next/image';
import { Event } from '@/types/event';
import { Spinner } from '@/components/ui/spinner';
import { envconfig } from '../../../config';


// User location pin - địa điểm hiện tại
const UserLocationPin = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="user-pin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="8" fill="url(#user-pin-gradient)" opacity="0.9" />
    <circle cx="12" cy="12" r="4" fill="white" />
    <circle cx="12" cy="12" r="2" fill="#1d4ed8" />
  </svg>
);

interface MapProps {
  coordinates: { lat: number; lng: number } | null;
  events: Event[];
  isLoading: boolean;
  selectedEvent: Event | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  mapStyle?: string;
}

// Utility to decode Goong/Google polyline
const decodePolyline = (encoded: string) => {
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lng * 1e-5, lat * 1e-5]); // Goong uses [lng, lat] for GeoJSON
  }
  return poly;
};

// ================== COMPONENT ==================
const Map = ({ coordinates, events, isLoading, selectedEvent, setSelectedEvent, mapStyle }: MapProps) => {
  const mapRef = useRef<any>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Fetch route from Goong Directions API
  const fetchRoute = async (start: { lat: number, lng: number }, end: { lat: number, lng: number }) => {
    setIsLoadingRoute(true);
    console.log('Fetching route from:', start, 'to:', end);
    try {
      // Use MAP_TILES_KEY as it's the one we know is currently valid for the user
      const response = await fetch(
        `https://rsapi.goong.io/Direction?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&vehicle=car&api_key=${envconfig.NEXT_PUBLIC_MAP_TILES_KEY}`
      );
      const data = await response.json();
      console.log('Goong Directions Data:', data);

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // 1. Decode polyline
        if (route.overview_polyline && route.overview_polyline.points) {
          const decodedCoords = decodePolyline(route.overview_polyline.points);
          console.log('Decoded Polyline Coords:', decodedCoords);

          setRouteData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: decodedCoords
            },
            properties: {}
          });
        }

        // 2. Set distance and duration
        const distanceText = route.legs[0].distance.text;
        const durationText = route.legs[0].duration.text;

        setRouteInfo({
          distance: distanceText,
          duration: durationText
        });
      } else {
        console.warn('No routes found in Goong response:', data);
      }
    } catch (error) {
      console.error('Error fetching route from Goong:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Animate camera to selected event
  useEffect(() => {
    if (!mapRef.current || !selectedEvent || !coordinates) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    // Fetch route
    const eventLng = (selectedEvent.locations?.[0] as any)?.longitude ?? (selectedEvent.locations?.[0] as any)?.Longitude ?? 0;
    const eventLat = (selectedEvent.locations?.[0] as any)?.latitude ?? (selectedEvent.locations?.[0] as any)?.Latitude ?? 0;
    fetchRoute({ lat: coordinates.lat, lng: coordinates.lng }, { lat: eventLat, lng: eventLng });

    // Smooth camera animation
    map.easeTo({
      zoom: 14,
      pitch: 60,
      duration: 800
    });

    setTimeout(() => {
      // Calculate bounds to fit both points
      const bounds = [
        [Math.min(coordinates.lng, eventLng), Math.min(coordinates.lat, eventLat)],
        [Math.max(coordinates.lng, eventLng), Math.max(coordinates.lat, eventLat)]
      ];

      map.fitBounds(bounds as any, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        duration: 2000,
        pitch: 65,
        essential: true
      });

      // Subtle rotation
      setTimeout(() => {
        map.rotateTo(map.getBearing() + 10, {
          duration: 1500,
          easing: (t: number) => 1 - Math.pow(1 - t, 3)
        });
      }, 2000);
    }, 800);
  }, [selectedEvent, coordinates]);

  // Clear route when no event is selected
  useEffect(() => {
    if (!selectedEvent) {
      setRouteData(null);
      setRouteInfo(null);
    }
  }, [selectedEvent]);

  if (isLoading || !coordinates) {
    return (
      <div className="relative w-full h-full bg-background rounded-none overflow-hidden flex items-center justify-center">
        <svg
          className="w-16 h-16 text-primary"
          viewBox="0 0 80 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M10,40c0,0,0-0.4,0-1.1c0-0.3,0-0.8,0-1.3c0-0.3,0-0.5,0-0.8c0-0.3,0.1-0.6,0.1-0.9c0.1-0.6,0.1-1.4,0.2-2.1c0.2-0.8,0.3-1.6,0.5-2.5c0.2-0.9,0.6-1.8,0.8-2.8c0.3-1,0.8-1.9,1.2-3c0.5-1,1.1-2,1.7-3.1c0.7-1,1.4-2.1,2.2-3.1c1.6-2.1,3.7-3.9,6-5.6c2.3-1.7,5-3,7.9-4.1c0.7-0.2,1.5-0.4,2.2-0.7c0.7-0.3,1.5-0.3,2.3-0.5c0.8-0.2,1.5-0.3,2.3-0.4l1.2-0.1l0.6-0.1l0.3,0l0.1,0l0.1,0l0,0c0.1,0-0.1,0,0.1,0c1.5,0,2.9-0.1,4.5,0.2c0.8,0.1,1.6,0.1,2.4,0.3c0.8,0.2,1.5,0.3,2.3,0.5c3,0.8,5.9,2,8.5,3.6c2.6,1.6,4.9,3.4,6.8,5.4c1,1,1.8,2.1,2.7,3.1c0.8,1.1,1.5,2.1,2.1,3.2c0.6,1.1,1.2,2.1,1.6,3.1c0.4,1,0.9,2,1.2,3c0.3,1,0.6,1.9,0.8,2.7c0.2,0.9,0.3,1.6,0.5,2.4c0.1,0.4,0.1,0.7,0.2,1c0,0.3,0.1,0.6,0.1,0.9c0.1,0.6,0.1,1,0.1,1.4C74,39.6,74,40,74,40c0.2,2.2-1.5,4.1-3.7,4.3s-4.1-1.5-4.3-3.7c0-0.1,0-0.2,0-0.3l0-0.4c0,0,0-0.3,0-0.9c0-0.3,0-0.7,0-1.1c0-0.2,0-0.5,0-0.7c0-0.2-0.1-0.5-0.1-0.8c-0.1-0.6-0.1-1.2-0.2-1.9c-0.1-0.7-0.3-1.4-0.4-2.2c-0.2-0.8-0.5-1.6-0.7-2.4c-0.3-0.8-0.7-1.7-1.1-2.6c-0.5-0.9-0.9-1.8-1.5-2.7c-0.6-0.9-1.2-1.8-1.9-2.7c-1.4-1.8-3.2-3.4-5.2-4.9c-2-1.5-4.4-2.7-6.9-3.6c-0.6-0.2-1.3-0.4-1.9-0.6c-0.7-0.2-1.3-0.3-1.9-0.4c-1.2-0.3-2.8-0.4-4.2-0.5l-2,0c-0.7,0-1.4,0.1-2.1,0.1c-0.7,0.1-1.4,0.1-2,0.3c-0.7,0.1-1.3,0.3-2,0.4c-2.6,0.7-5.2,1.7-7.5,3.1c-2.2,1.4-4.3,2.9-6,4.7c-0.9,0.8-1.6,1.8-2.4,2.7c-0.7,0.9-1.3,1.9-1.9,2.8c-0.5,1-1,1.9-1.4,2.8c-0.4,0.9-0.8,1.8-1,2.6c-0.3,0.9-0.5,1.6-0.7,2.4c-0.2,0.7-0.3,1.4-0.4,2.1c-0.1,0.3-0.1,0.6-0.2,0.9c0,0.3-0.1,0.6-0.1,0.8c0,0.5-0.1,0.9-0.1,1.3C10,39.6,10,40,10,40z"
          >
            <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="0.8s" repeatCount="indefinite" />
          </path>
          <path
            fill="currentColor"
            d="M62,40.1c0,0,0,0.2-0.1,0.7c0,0.2,0,0.5-0.1,0.8c0,0.2,0,0.3,0,0.5c0,0.2-0.1,0.4-0.1,0.7c-0.1,0.5-0.2,1-0.3,1.6c-0.2,0.5-0.3,1.1-0.5,1.8c-0.2,0.6-0.5,1.3-0.7,1.9c-0.3,0.7-0.7,1.3-1,2.1c-0.4,0.7-0.9,1.4-1.4,2.1c-0.5,0.7-1.1,1.4-1.7,2c-1.2,1.3-2.7,2.5-4.4,3.6c-1.7,1-3.6,1.8-5.5,2.4c-2,0.5-4,0.7-6.2,0.7c-1.9-0.1-4.1-0.4-6-1.1c-1.9-0.7-3.7-1.5-5.2-2.6c-1.5-1.1-2.9-2.3-4-3.7c-0.6-0.6-1-1.4-1.5-2c-0.4-0.7-0.8-1.4-1.2-2c-0.3-0.7-0.6-1.3-0.8-2c-0.2-0.6-0.4-1.2-0.6-1.8c-0.1-0.6-0.3-1.1-0.4-1.6c-0.1-0.5-0.1-1-0.2-1.4c-0.1-0.9-0.1-1.5-0.1-2c0-0.5,0-0.7,0-0.7s0,0.2,0.1,0.7c0.1,0.5,0,1.1,0.2,2c0.1,0.4,0.2,0.9,0.3,1.4c0.1,0.5,0.3,1,0.5,1.6c0.2,0.6,0.4,1.1,0.7,1.8c0.3,0.6,0.6,1.2,0.9,1.9c0.4,0.6,0.8,1.3,1.2,1.9c0.5,0.6,1,1.3,1.6,1.8c1.1,1.2,2.5,2.3,4,3.2c1.5,0.9,3.2,1.6,5,2.1c1.8,0.5,3.6,0.6,5.6,0.6c1.8-0.1,3.7-0.4,5.4-1c1.7-0.6,3.3-1.4,4.7-2.4c1.4-1,2.6-2.1,3.6-3.3c0.5-0.6,0.9-1.2,1.3-1.8c0.4-0.6,0.7-1.2,1-1.8c0.3-0.6,0.6-1.2,0.8-1.8c0.2-0.6,0.4-1.1,0.5-1.7c0.1-0.5,0.2-1,0.3-1.5c0.1-0.4,0.1-0.8,0.1-1.2c0-0.2,0-0.4,0.1-0.5c0-0.2,0-0.4,0-0.5c0-0.3,0-0.6,0-0.8c0-0.5,0-0.7,0-0.7c0-1.1,0.9-2,2-2s2,0.9,2,2C62,40,62,40.1,62,40.1z"
          >
            <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 40 40" to="-360 40 40" dur="0.6s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    );
  }

  // Route layer styles
  const routeLayerStyle: any = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#3b82f6',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        12, 3,
        16, 6,
        22, 12
      ],
      'line-opacity': 0.8,
      'line-blur': 1
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  };

  const routeOutlineLayerStyle: any = {
    id: 'route-outline',
    type: 'line',
    paint: {
      'line-color': '#1d4ed8',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        12, 5,
        16, 8,
        22, 14
      ],
      'line-opacity': 0.4,
      'line-blur': 2
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-none">
      <MapComponent
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: coordinates.lng,
          latitude: coordinates.lat,
          zoom: 13,
          pitch: 45,
          bearing: 0
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle || `https://tiles.goong.io/assets/goong_map_web.json?api_key=${envconfig.NEXT_PUBLIC_MAP_TILES_KEY}`}
      >
        {/* Route layers */}
        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            <Layer {...routeOutlineLayerStyle} />
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Enhanced Navigation Control */}
        <NavigationControl
          position="top-right"
          showCompass={true}
          showZoom={true}
          visualizePitch={true}
        />

        {/* User Location Marker - Enhanced Design */}
        <Marker
          longitude={coordinates.lng}
          latitude={coordinates.lat}
          anchor="center"
        >
          <div className="relative group cursor-pointer">
            {/* Animated pulsing rings */}
            <div className="absolute inset-0 -m-3">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-40" />
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-30 animation-delay-300" />
            </div>

            {/* Main location pin */}
            <div className="relative z-10 transform transition-transform group-hover:scale-110">
              <UserLocationPin className="w-10 h-10 drop-shadow-lg" />
            </div>

            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold">
                Vị trí của bạn
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-700 rotate-45" />
              </div>
            </div>
          </div>
        </Marker>

        {/* Event Markers - Chưa chọn: ghim đơn giản | Đang chọn: ảnh + popup */}
        {events.map((event) => {
          const isSelected = selectedEvent?.id === event.id;
          const loc = event.locations?.[0] as any;
          const lat = loc?.latitude ?? loc?.Latitude ?? 0;
          const lng = loc?.longitude ?? loc?.Longitude ?? 0;

          if (lat === 0 || lng === 0) return null;

          return (
            <Marker
              key={event.id}
              longitude={lng}
              latitude={lat}
              anchor={isSelected ? "center" : "bottom"}
            >
              <div
                className="relative group cursor-pointer"
                onClick={() => setSelectedEvent(isSelected ? null : event)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedEvent(isSelected ? null : event)}
              >
                {/* Chưa chọn: ghim vị trí đơn giản */}
                {!isSelected && (
                  <div className="relative z-10 transform transition-all duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 drop-shadow-lg">
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                        fill="#f97316"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                )}

                {/* Đang chọn: ảnh tròn + popup */}
                {isSelected && (
                  <>
                    <div className="absolute -inset-2 z-0">
                      <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-primary" />
                      <div className="absolute inset-0 rounded-full animate-pulse opacity-40 bg-primary animation-delay-300" />
                    </div>
                    <div className="relative z-10 w-12 h-12 rounded-full overflow-hidden border-2 border-primary ring-4 ring-primary/30 shadow-lg">
                      <Image
                        src={event.thumbnailUrl || "/placeholder.png"}
                        alt={event.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    {/* Popup: Chỉ hiển thị khi ấn/selected */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-300 pointer-events-none z-20 opacity-100">
                      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-white/20 min-w-[200px] max-w-[240px]">
                        <div className="flex justify-center pt-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                            <Image
                              src={event.thumbnailUrl || "/placeholder.png"}
                              alt={event.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        </div>
                        <div className="px-4 py-3 text-center">
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{event.name}</p>
                          {loc?.address && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{loc.address}</p>
                          )}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 rotate-45 border-r border-b border-white/20" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Marker>
          );
        })}
      </MapComponent>

      {/* Route Info Panel - Bên phải */}
      {routeInfo && selectedEvent && (
        <div className="absolute bottom-20 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl px-6 py-4 z-10 border border-gray-200 dark:border-border/50 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Lộ trình đến {selectedEvent?.name}</p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{routeInfo?.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{routeInfo?.duration}</span>
                </div>
              </div>
            </div>
            {isLoadingRoute && (
              <Spinner className="w-5 h-5 text-blue-600 ml-auto" />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Map;