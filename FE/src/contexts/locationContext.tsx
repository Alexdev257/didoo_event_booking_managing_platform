"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationContextType {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const DEFAULT_CENTER: LocationCoords = {
  latitude: 10.7769,
  longitude: 106.7009,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocation(DEFAULT_CENTER);
      setError("Trình duyệt không hỗ trợ định vị");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      () => {
        setLocation(DEFAULT_CENTER);
        setError("Không thể lấy vị trí, sử dụng mặc định");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return (
    <LocationContext.Provider value={{ location, isLoading, error, refresh: fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocationContext must be used within LocationProvider");
  return context;
}
