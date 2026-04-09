"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Loader2, Navigation } from "lucide-react";

// --- CHỖ NHÉT KEY CỦA BẠN ---
const GOONG_API_KEY = "gGZrdLC21Off63di237Ldiy17egCN6EeSD3KsUcA"; 

// --- Interfaces ---
export interface GoongSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  compound?: {
    province?: string;
    district?: string;
    commune?: string;
  };
}

export interface AddressResult {
  address: string;
  latitude: number;
  longitude: number;
  province?: string;
  district?: string;
  ward?: string;
}

interface AddressAutocompleteInputProps {
  value: string | undefined;
  onChange: (result: AddressResult) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
}

const DEBOUNCE_MS = 300;

export function AddressAutocompleteInput({
  value,
  onChange,
  placeholder = "Nhập số nhà, tên đường...",
  error = false,
  className,
  disabled = false,
  id,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [suggestions, setSuggestions] = useState<GoongSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  // 1. Tìm kiếm gợi ý
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!GOONG_API_KEY || !query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(query)}`;
      console.log("🔍 Fetching suggestions from Goong:", query);
      const res = await fetch(url);

      if (!res.ok) {
        console.error("Goong API error:", res.status, res.statusText);
        setSuggestions([]);
        return;
      }

      const data = await res.json();
      console.log("📍 Goong response:", data);

      if (data.status === "OK") {
        setSuggestions(data.predictions || []);
      } else {
        console.warn("Goong API status not OK:", data.status);
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Goong Autocomplete Error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    // Cập nhật form khi nhập tay
    onChange({ address: v, latitude: 0, longitude: 0, province: "", district: "", ward: "" });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(v);
      setIsOpen(true);
    }, DEBOUNCE_MS);
  };

  // 2. Lấy tọa độ và địa chỉ chi tiết (Dùng Place Detail để có số nhà chuẩn)
  const selectSuggestion = async (suggestion: GoongSuggestion) => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      const detailUrl = `https://rsapi.goong.io/Place/Detail?api_key=${GOONG_API_KEY}&place_id=${suggestion.place_id}`;
      const res = await fetch(detailUrl);
      const data = await res.json();

      if (data.status === "OK" && data.result) {
        const { lat, lng } = data.result.geometry.location;
        const fullAddress = data.result.formatted_address;

        console.log("📍 Place Detail response:", JSON.stringify(data.result, null, 2));

        // Parse province/district/ward từ Place Detail response
        // Ưu tiên: address_components > compound của suggestion
        let province = "";
        let district = "";
        let ward = "";

        // Thử parse từ address_components (nếu có)
        if (data.result.address_components && Array.isArray(data.result.address_components)) {
          for (const comp of data.result.address_components) {
            const types = comp.types || [];
            if (types.includes("administrative_area_level_1")) {
              province = comp.long_name || "";
            } else if (types.includes("administrative_area_level_2")) {
              district = comp.long_name || "";
            } else if (types.includes("administrative_area_level_3") || types.includes("ward")) {
              ward = comp.long_name || "";
            }
          }
          console.log("📍 Parsed from address_components:", { province, district, ward });
        }

        // Nếu không có address_components hoặc không parse được, dùng compound từ suggestion
        if (!province && suggestion.compound?.province) {
          province = suggestion.compound.province;
          district = suggestion.compound.district || "";
          ward = suggestion.compound.commune || "";
          console.log("📍 Using compound from suggestion:", { province, district, ward });
        }

        // Chuẩn hóa tên tỉnh/thành phố
        if (province) {
          // Loại bỏ "Thành phố " hoặc "Tỉnh " prefix
          province = province.replace(/^(Thành phố|Tỉnh)\s+/i, "").trim();
        }

        setInputValue(fullAddress);
        setSuggestions([]);
        onChange({
          address: fullAddress,
          latitude: lat,
          longitude: lng,
          province,
          district,
          ward,
        });
      }
    } catch (error) {
      console.error("Goong Detail Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Định vị hiện tại
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Trình duyệt không hỗ trợ");
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`);
        const data = await res.json();
        if (data.results?.[0]) {
          const result = data.results[0];
          const addr = result.formatted_address;

          // Parse address components
          let province = "";
          let district = "";
          let ward = "";

          if (result.address_components) {
            for (const comp of result.address_components) {
              if (comp.types?.includes("administrative_area_level_1")) {
                province = comp.long_name;
              } else if (comp.types?.includes("administrative_area_level_2")) {
                district = comp.long_name;
              } else if (comp.types?.includes("ward") || comp.types?.includes("administrative_area_level_3")) {
                ward = comp.long_name;
              }
            }
          }

          setInputValue(addr);
          onChange({ address: addr, latitude, longitude, province, district, ward });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsGettingLocation(false);
      }
    }, () => setIsGettingLocation(false));
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-9 pr-10", error && "border-red-500", className)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
          <button type="button" onClick={getCurrentLocation} className="text-zinc-400 hover:text-zinc-600">
            {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-60 overflow-auto py-1">
          {isLoading ? (
            <li className="px-3 py-2 text-sm text-zinc-400">Đang tìm kiếm...</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((s) => (
              <li
                key={s.place_id}
                className="px-3 py-2 text-sm hover:bg-zinc-100 cursor-pointer flex flex-col"
                onClick={() => selectSuggestion(s)}
              >
                <span className="font-medium text-zinc-900">{s.structured_formatting.main_text}</span>
                <span className="text-xs text-zinc-500">{s.structured_formatting.secondary_text}</span>
              </li>
            ))
          ) : inputValue.trim() ? (
            <li className="px-3 py-2 text-sm text-zinc-400">Không tìm thấy địa chỉ. Kiểm tra API key Goong.</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}