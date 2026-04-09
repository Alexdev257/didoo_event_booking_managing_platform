"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Search, Tag, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { vi } from "date-fns/locale";
import { Category } from "@/types/event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  categories?: Category[];
}

export default function SearchFilter({ categories = [] }: SearchFilterProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState<Date>();
  const [categoryId, setCategoryId] = useState<string>("all");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("name", keyword.trim());
    if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
    if (date) params.set("startTime", format(date, "yyyy-MM-dd"));
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="relative z-20 max-w-4xl mx-auto px-4 -mt-16 sm:-mt-12">
      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tìm sự kiện, nghệ sĩ..."
              className="flex h-12 w-full pl-11 pr-4 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 rounded-xl border border-border bg-muted">
                <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start rounded-xl border border-border bg-muted font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} locale={vi} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2">
            <Button
              onClick={handleSearch}
              className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
