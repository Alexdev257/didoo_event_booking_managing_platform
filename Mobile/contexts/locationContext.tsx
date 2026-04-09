import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as Location from "expo-location";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationContextType {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Trả về location hoặc default, dùng cho login/register */
  getLocationForAuth: () => LocationCoords;
}

const DEFAULT_CENTER: LocationCoords = {
  latitude: 10.7769,
  longitude: 106.7009,
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocation(DEFAULT_CENTER);
        setError("Không có quyền truy cập vị trí, sử dụng mặc định");
        setIsLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      setLocation(DEFAULT_CENTER);
      setError(
        err instanceof Error ? err.message : "Không thể lấy vị trí, sử dụng mặc định"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const getLocationForAuth = useCallback((): LocationCoords => {
    if (location) return location;
    return DEFAULT_CENTER;
  }, [location]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        refresh: fetchLocation,
        getLocationForAuth,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context)
    throw new Error("useLocationContext must be used within LocationProvider");
  return context;
}
