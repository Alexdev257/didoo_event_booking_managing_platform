import { observable } from "@legendapp/state";

export interface RealtimeNotification {
  title: string;
  message: string;
  type: string;
  relatedId?: string | null;
  createdAt: string;
}

export const notificationStore$ = observable({
  notifications: [] as RealtimeNotification[],
  isConnected: false,
});

// Dedupe theo nội dung: title+message+type (tránh trùng khi SignalR bắn 2 lần hoặc API+realtime)
const toKey = (n: RealtimeNotification) =>
  `${n.title}|${n.message}|${n.type ?? ""}`;

export const addNotification = (n: RealtimeNotification) => {
  notificationStore$.notifications.set((prev) => {
    const k = toKey(n);
    if (prev.some((p) => toKey(p) === k)) return prev;
    return [n, ...prev].slice(0, 50);
  });
};

export const clearNotifications = () => {
  notificationStore$.notifications.set([]);
};

export const setNotificationConnection = (connected: boolean) => {
  notificationStore$.isConnected.set(connected);
};
