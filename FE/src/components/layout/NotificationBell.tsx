"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationContextOptional } from "@/contexts/notificationContext";
import { useGetMyNotifications } from "@/hooks/useOperation";
import { useSessionStore } from "@/stores/sesionStore";

export function NotificationBell() {
  const ctx = useNotificationContextOptional();
  const notifications = ctx?.notifications ?? [];
  const user = useSessionStore((state) => state.user);
  const { data: apiRes } = useGetMyNotifications(
    { pageNumber: 1, pageSize: 10, isRead: false },
    { enabled: !!user?.UserId }
  );
  const apiItems = apiRes?.data?.items ?? [];
  // Dedupe theo nội dung: title+message+type (createdAt/relatedId có thể khác giữa API vs SignalR)
  const toKey = (t: string, m: string, ty: string) => `${t}|${m}|${ty}`;
  const seenKeys = new Set<string>();
  const displayItems = [
    ...apiItems.map((n) => ({
      title: n.title ?? "",
      message: n.message ?? "",
      type: n.type ?? "",
      relatedId: n.relatedId ?? n.event?.id ?? null,
      createdAt: n.createdAt ?? "",
      source: "api" as const,
    })),
    ...notifications.map((n) => ({ ...n, source: "realtime" as const })),
  ]
    .filter((item) => {
      const k = toKey(item.title, item.message, item.type ?? "");
      if (seenKeys.has(k)) return false;
      seenKeys.add(k);
      return true;
    })
    .slice(0, 10);
  const unreadCount = displayItems.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl border border-border/70 bg-card hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl border border-border bg-popover text-popover-foreground p-2">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
          <span className="text-sm font-semibold text-foreground">Thông báo</span>
          <Link
            href="/user/dashboard/notifications"
            className="text-xs font-medium text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {displayItems.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Chưa có thông báo</div>
        ) : (
          displayItems.map((n, i) => (
            <DropdownMenuItem key={i} asChild>
              <Link
                href={
                  n.type === "OrganizerVerify"
                    ? "/organizer/dashboard"
                    : n.type === "BookingSuccess"
                      ? "/user/dashboard/tickets"
                      : n.type === "ResaleSuccess"
                        ? "/user/dashboard/resales"
                        : "/user/dashboard/notifications"
                }
                className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">{n.title}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
