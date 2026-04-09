"use client";

import { useState } from "react";
import { useGetMe } from "@/hooks/useAuth";
import { useGetMyNotifications, useNotification } from "@/hooks/useOperation";
import { useSessionStore } from "@/stores/sesionStore";
import { useNotificationContextOptional } from "@/contexts/notificationContext";
import Loading from "@/components/loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

type StatusTab = "unread" | "read";

export default function NotificationsPage() {
  const user = useSessionStore((state) => state.user);
  const { data: meRes, isLoading: isMeLoading } = useGetMe();
  const ctx = useNotificationContextOptional();
  const realtimeNotifications = ctx?.notifications ?? [];
  const [statusTab, setStatusTab] = useState<StatusTab>("unread");

  const { data: unreadRes, isLoading: isUnreadLoading } = useGetMyNotifications(
    { pageNumber: 1, pageSize: 50, isRead: false },
    { enabled: !!(user?.UserId ?? meRes?.data?.id) }
  );
  const { data: readRes, isLoading: isReadLoading } = useGetMyNotifications(
    { pageNumber: 1, pageSize: 50, isRead: true },
    { enabled: !!(user?.UserId ?? meRes?.data?.id) }
  );
  const { markAsRead } = useNotification();

  const unreadApiItems = unreadRes?.data?.items ?? [];
  const readApiItems = readRes?.data?.items ?? [];

  // Dedupe theo nội dung: title+message+type (createdAt/relatedId khác nhau giữa API vs SignalR)
  const seenKeys = new Set<string>();
  const toKey = (t: string, m: string, ty: string) => `${t}|${m}|${ty}`;

  // API trước, realtime sau - khi dedupe ưu tiên giữ item có id (để mark-as-read)
  const unreadItems = [
    ...unreadApiItems.map((n) => ({
      id: n.id ?? "",
      title: n.title ?? "",
      message: n.message ?? "",
      isRead: n.isRead ?? false,
      type: n.type ?? "",
      relatedId: n.relatedId ?? n.event?.id ?? null,
      createdAt: n.createdAt ?? "",
    })),
    ...realtimeNotifications.map((n) => ({
      id: `rt-${n.createdAt}`,
      title: n.title,
      message: n.message,
      isRead: false,
      type: n.type,
      relatedId: n.relatedId,
      createdAt: n.createdAt,
    })),
  ]
    .filter((item) => {
      const k = toKey(item.title, item.message, item.type ?? "");
      if (seenKeys.has(k)) return false;
      seenKeys.add(k);
      return true;
    })
    .slice(0, 50);

  const readSeenKeys = new Set<string>();
  const readItems = readApiItems
    .map((n) => ({
      id: n.id ?? "",
      title: n.title ?? "",
      message: n.message ?? "",
      isRead: true,
      type: n.type ?? "",
      relatedId: n.relatedId ?? n.event?.id ?? null,
      createdAt: n.createdAt ?? "",
    }))
    .filter((item) => {
      const k = item.id || toKey(item.title, item.message, item.type ?? "");
      if (readSeenKeys.has(k)) return false;
      readSeenKeys.add(k);
      return true;
    });

  type NotificationItem = (typeof unreadItems)[0];
  const getLink = (item: NotificationItem) => {
    if (item.type === "OrganizerVerify") return "/organizer/dashboard";
    if (item.type === "BookingSuccess") return "/user/dashboard/tickets";
    if (item.type === "ResaleSuccess") return "/user/dashboard/resales";
    return "#";
  };

  const handleMarkRead = async (id: string) => {
    if (id.startsWith("rt-") || !id) return;
    try {
      await markAsRead.mutateAsync(id);
    } catch {
      // ignore
    }
  };

  if (isMeLoading) return <Loading />;

  if (!user && !meRes?.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card className="max-w-md border-border bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Vui lòng đăng nhập để xem thông báo.</p>
            <Button asChild className="mt-4">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">Thông báo của tôi</span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={statusTab}
            onValueChange={(v) => setStatusTab(v as StatusTab)}
            className="w-full"
          >
            <TabsList className="mb-4 grid w-full max-w-xs grid-cols-2 rounded-xl bg-muted p-1">
              <TabsTrigger value="unread" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Chưa đọc
              </TabsTrigger>
              <TabsTrigger value="read" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Đã đọc
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="mt-0">
              {isUnreadLoading && unreadItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground font-medium">Đang tải...</div>
              ) : unreadItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground font-medium">Chưa có thông báo chưa đọc</div>
              ) : (
                <ul className="divide-y divide-border">
                  {unreadItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={getLink(item)}
                        onClick={() => handleMarkRead(item.id)}
                        className="flex gap-4 rounded-lg bg-primary/5 p-4 transition hover:bg-primary/10"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground font-medium">{item.message}</p>
                        </div>
                        {!item.id.startsWith("rt-") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleMarkRead(item.id);
                            }}
                            className="shrink-0"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="read" className="mt-0">
              {isReadLoading && readItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground font-medium">Đang tải...</div>
              ) : readItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground font-medium">Chưa có thông báo đã đọc</div>
              ) : (
                <ul className="divide-y divide-border">
                  {readItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={getLink(item)}
                        className="flex gap-4 rounded-lg p-4 transition hover:bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-muted-foreground">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground/80 font-medium">{item.message}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
