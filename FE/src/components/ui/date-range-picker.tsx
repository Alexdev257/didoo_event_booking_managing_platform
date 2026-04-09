"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  disabled = false,
  className,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setRange(value);
  }, [value]);

  const handleSelect = (r: DateRange | undefined) => {
    setRange(r);
    onChange?.(r);
    if (r?.from && r?.to) {
      setOpen(false);
    }
  };

  const displayValue = range?.from
    ? range.to
      ? `${format(range.from, "dd/MM/yyyy", { locale: vi })} - ${format(range.to, "dd/MM/yyyy", { locale: vi })}`
      : format(range.from, "dd/MM/yyyy", { locale: vi })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal min-h-[40px]",
            !displayValue && "text-muted-foreground",
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
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          defaultMonth={range?.from}
          numberOfMonths={numberOfMonths}
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  );
}
