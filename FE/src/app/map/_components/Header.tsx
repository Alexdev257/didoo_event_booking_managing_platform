"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Search, ArrowUpDown, Filter, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useGetCategories } from "@/hooks/useEvent";
import { EventStatus } from "@/utils/enum";

const sortOptions = [
  { label: "Ngày diễn ra", value: "date" as const },
  { label: "Khoảng cách", value: "distance" as const },
  { label: "Mới nhất", value: "newest" as const },
];

export default function MapHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get("name") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = (searchParams.get("sortBy") as "date" | "distance" | "newest") ?? "date";
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startTime ? new Date(startTime) : undefined,
    to: endTime ? new Date(endTime) : undefined,
  });

  useEffect(() => {
    setDateRange({
      from: startTime ? new Date(startTime) : undefined,
      to: endTime ? new Date(endTime) : undefined,
    });
  }, [startTime, endTime]);

  const { data: categoriesRes } = useGetCategories({ pageSize: 50 });
  const categories = categoriesRes?.data?.items ?? [];

  const updateParams = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === "all") p.delete(k);
      else p.set(k, v);
    });
    p.delete("pageNumber");
    router.push(`/map?${p.toString()}`);
  };

  const [searchInput, setSearchInput] = useState(name);
  useEffect(() => setSearchInput(name), [name]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    updateParams({ name: value });
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      updateParams({
        startTime: format(range.from, "yyyy-MM-dd"),
        endTime: format(range.to, "yyyy-MM-dd"),
      });
    } else if (range?.from) {
      updateParams({
        startTime: format(range.from, "yyyy-MM-dd"),
        endTime: "",
      });
    } else {
      updateParams({ startTime: "", endTime: "" });
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onBlur={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch((e.target as HTMLInputElement).value)}
          placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
          className="pl-9 h-10 rounded-xl bg-background border-border hover:bg-background/80 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm w-full shadow-sm"
        />
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 w-full">
        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={`h-8 px-3 text-xs rounded-full border border-border/50 whitespace-nowrap shadow-sm ${dateRange?.from ? "bg-primary/10 border-primary/30 text-primary font-medium" : "bg-card hover:bg-muted font-normal"
                }`}
            >
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}`
                ) : (
                  format(dateRange.from, "dd/MM")
                )
              ) : (
                <>
                  Ngày <CalendarIcon className="ml-1.5 h-3.5 w-3.5 opacity-70" />
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl border-border/50 backdrop-blur-xl bg-card/95 shadow-xl" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={vi}
            />
          </PopoverContent>
        </Popover>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-8 px-3 text-xs rounded-full border border-border/50 whitespace-nowrap shadow-sm ${categoryId ? "bg-primary/10 border-primary/30 text-primary font-medium" : "bg-card hover:bg-muted font-normal"
                }`}
            >
              {categoryId ? categories.find((c) => c.id === categoryId)?.name ?? "Loại" : "Loại"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 overflow-hidden rounded-xl border-border/50 backdrop-blur-xl bg-card/95">
            <DropdownMenuItem
              onClick={() => updateParams({ categoryId: "" })}
              className={`focus:bg-primary/10 focus:text-primary cursor-pointer my-1 rounded-lg ${!categoryId ? "text-primary font-medium bg-primary/5" : ""}`}
            >
              Tất cả danh mục
            </DropdownMenuItem>
            {categories.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => updateParams({ categoryId: c.id })}
                className={`focus:bg-primary/10 focus:text-primary cursor-pointer my-1 rounded-lg ${categoryId === c.id ? "text-primary font-medium bg-primary/5" : ""}`}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-8 px-3 text-xs rounded-full border border-border/50 whitespace-nowrap shadow-sm ${status ? "bg-primary/10 border-primary/30 text-primary font-medium" : "bg-card hover:bg-muted font-normal"
                }`}
            >
              {status === String(EventStatus.OPENED)
                ? "Đang mở"
                : status === String(EventStatus.PUBLISHED)
                  ? "Đã duyệt"
                  : "Trạng thái"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 overflow-hidden rounded-xl border-border/50 backdrop-blur-xl bg-card/95">
            <DropdownMenuItem
              onClick={() => updateParams({ status: "" })}
              className={`focus:bg-primary/10 focus:text-primary cursor-pointer my-1 rounded-lg ${!status ? "text-primary font-medium bg-primary/5" : ""}`}
            >
              Tất cả trạng thái
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateParams({ status: String(EventStatus.PUBLISHED) })}
              className={`focus:bg-primary/10 focus:text-primary cursor-pointer my-1 rounded-lg ${status === String(EventStatus.PUBLISHED) ? "text-primary font-medium bg-primary/5" : ""}`}
            >
              Đã duyệt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateParams({ status: String(EventStatus.OPENED) })}
              className={`focus:bg-primary/10 focus:text-primary cursor-pointer my-1 rounded-lg ${status === String(EventStatus.OPENED) ? "text-primary font-medium bg-primary/5" : ""}`}
            >
              Đang mở
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Filter - Orange Highlight */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-8 px-3 text-xs rounded-full whitespace-nowrap shadow-sm font-medium bg-[#f97316] hover:bg-[#ea580c] text-white border-0"
            >
              {sortOptions.find((opt) => opt.value === sortBy)?.label ?? "Ngày diễn ra"}
              <ArrowUpDown className="ml-1.5 w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 overflow-hidden rounded-xl border-border/50 backdrop-blur-xl bg-card/95">
            {sortOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => updateParams({ sortBy: opt.value })}
                className={`focus:bg-primary/10 focus:text-primary cursor-pointer my-1 rounded-lg ${sortBy === opt.value ? "text-primary font-medium bg-primary/5" : ""
                  }`}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(startTime || endTime) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs text-muted-foreground whitespace-nowrap rounded-full shrink-0 border border-transparent shadow-none"
            onClick={() => handleDateSelect(undefined)}
          >
            Xóa lọc ngày
          </Button>
        )}
      </div>
    </div>
  );
}
