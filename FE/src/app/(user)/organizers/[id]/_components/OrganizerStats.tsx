"use client";

import { Ticket, Users, Star } from "lucide-react";

interface OrganizerStatsProps {
  eventCount: number;
}

export function OrganizerStats({ eventCount }: OrganizerStatsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-0">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ticket className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-foreground leading-tight">{eventCount}</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Sự kiện</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-foreground leading-tight">—</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Người theo dõi</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Star className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-foreground leading-tight">—</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Đánh giá</p>
          </div>
        </div>
      </div>
    </div>
  );
}
