"use client";

import { BadgeCheck, CalendarDays, Ticket } from "lucide-react";

interface OrganizerQuickInfoProps {
  eventCount: number;
  createdAt?: string;
  isVerified?: boolean;
}

export function OrganizerQuickInfo({
  eventCount,
  createdAt,
  isVerified = false,
}: OrganizerQuickInfoProps) {
  const joinYear = createdAt
    ? new Date(createdAt).getFullYear()
    : "—";

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">Thông tin nhanh</h2>
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">{eventCount} sự kiện</p>
            <p className="text-xs text-muted-foreground font-medium">Đã tổ chức</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">{joinYear}</p>
            <p className="text-xs text-muted-foreground font-medium">Năm tham gia</p>
          </div>
        </div>
        {isVerified && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">Đã xác minh</p>
              <p className="text-xs text-muted-foreground font-medium">Nhà tổ chức uy tín</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
