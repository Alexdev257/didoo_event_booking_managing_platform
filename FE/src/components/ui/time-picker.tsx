"use client";

import * as React from "react";
import { ClockIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  error?: boolean;
}

export function TimePicker({
  value = "",
  onChange,
  placeholder = "HH:mm",
  disabled = false,
  className,
  id,
  error,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeStr, setTimeStr] = React.useState(value);

  React.useEffect(() => {
    setTimeStr(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTimeStr(v);
    onChange?.(v);
  };

  const displayValue = timeStr || null;

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
            <ClockIcon className="h-4 w-4 shrink-0" />
            {displayValue ?? placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Input
          type="time"
          value={timeStr}
          onChange={handleChange}
          className="w-full [&::-webkit-calendar-picker-indicator]:opacity-100"
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverContent>
    </Popover>
  );
}
