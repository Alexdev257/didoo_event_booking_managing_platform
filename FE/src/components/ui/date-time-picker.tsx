"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function toTimeString(date: Date | undefined): string {
  if (!date) return "";
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function mergeDateWithTime(date: Date | undefined, timeStr: string): Date | undefined {
  if (!date) return undefined;
  if (!timeStr || !timeStr.includes(":")) return date;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return date;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  error?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày và giờ",
  disabled = false,
  className,
  id,
  error,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [timeStr, setTimeStr] = React.useState(toTimeString(value));

  React.useEffect(() => {
    setDate(value);
    setTimeStr(toTimeString(value));
  }, [value]);

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d && timeStr) {
      const merged = mergeDateWithTime(d, timeStr);
      onChange?.(merged);
    } else {
      onChange?.(d);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTimeStr(v);
    if (date && v) {
      const merged = mergeDateWithTime(date, v);
      onChange?.(merged);
    } else if (date) {
      onChange?.(date);
    }
  };

  const displayValue = date
    ? `${format(date, "dd/MM/yyyy", { locale: vi })} ${timeStr || "00:00"}`
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal min-h-[40px]",
            !displayValue && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {displayValue ?? placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            defaultMonth={date}
            locale={vi}
          />
          <div className="flex items-center gap-2 border-t pt-3">
            <span className="text-sm font-medium text-zinc-600 shrink-0">Giờ:</span>
            <Input
              type="time"
              value={timeStr}
              onChange={handleTimeChange}
              className="flex-1 [&::-webkit-calendar-picker-indicator]:opacity-100"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
