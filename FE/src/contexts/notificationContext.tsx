"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";
import { createNotificationHubConnection } from "@/lib/notificationHub";
import { refreshTokenForReconnect } from "@/lib/http";
import { useSessionStore } from "@/stores/sesionStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { KEY } from "@/utils/constant";
import { 
  notificationStore$, 
  addNotification, 
  clearNotifications, 
  setNotificationConnection,
  type RealtimeNotification 
} from "@/stores/notificationStore";
import { observer } from "@legendapp/state/react";

interface NotificationContextType {
  notifications: RealtimeNotification[];
  addNotification: (n: RealtimeNotification) => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/** Dedupe: tránh Strict Mode / double-mount gây sự kiện bắn 2 lần */
const lastNotificationRef = { key: "", ts: 0 };
const DEDUPE_MS = 800;

function isDuplicate(title: string, message: string, createdAt: string): boolean {
  const key = `${title}|${message}|${createdAt}`;
  const now = Date.now();
  if (lastNotificationRef.key === key && now - lastNotificationRef.ts < DEDUPE_MS) {
    return true;
  }
  lastNotificationRef.key = key;
  lastNotificationRef.ts = now;
  return false;
}

export const NotificationProvider = observer(({ children }: { children: ReactNode }) => {
  const accessToken = useSessionStore((state) => state.accessToken);
  const user = useSessionStore((state) => state.user);
  const queryClient = useQueryClient();
  const isStartedRef = useRef(false);

  useEffect(() => {
    if (!accessToken || !user?.UserId) return;

    let isMounted = true;
    let conn: signalR.HubConnection | null = null;

    const startConnection = async () => {
      if (isStartedRef.current) return;

      console.log("[NotificationHub] Starting connection, token:", !!useSessionStore.getState().accessToken);

      // Wait for token to be available
      let attempts = 0;
      const maxAttempts = 10;
      while (!useSessionStore.getState().accessToken && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500));
        attempts++;
      }

      const token = useSessionStore.getState().accessToken;
      if (!token) {
        console.log("[NotificationHub] No token after waiting, skip connection");
        // Don't set isStartedRef to true, allow retry when token becomes available
        return;
      }

      isStartedRef.current = true;

      try {
        conn = createNotificationHubConnection();

        conn.on("ReceiveNotification", (data: RealtimeNotification) => {
          if (!isMounted) return;

          const payload = data as any;
          const n: RealtimeNotification = {
            title: payload.title ?? payload.Title ?? "",
            message: payload.message ?? payload.Message ?? "",
            type: payload.type ?? payload.Type ?? "",
            relatedId: payload.relatedId ?? payload.RelatedId ?? null,
            createdAt: payload.createdAt ?? payload.CreatedAt ?? new Date().toISOString(),
          };

          if (isDuplicate(n.title, n.message, n.createdAt)) return;

          addNotification(n);
          const upperType = n.type.toUpperCase();
          const skipToast =
            upperType.includes("BOOKINGSUCCESS") ||
            upperType.includes("RESALESUCCESS");
          if (!skipToast) {
            toast.success(n.title, { description: n.message });
          }

          // Specific handling for business types - Normalize to UPPERCASE for matching

          // 4 real-time areas: TICKET, BOOKING, RESALE, VERIFYORGANIZER
          if (upperType.includes("TICKET")) {
            queryClient.invalidateQueries({ queryKey: KEY.tickets });
          }

          if (upperType.includes("BOOKING")) {
            queryClient.invalidateQueries({ queryKey: KEY.bookings });
          }

          if (upperType.includes("RESALE")) {
            queryClient.invalidateQueries({ queryKey: KEY.resales });
            queryClient.invalidateQueries({ queryKey: KEY.resaleTransactions });
          }

          if (upperType.includes("ORGANIZERVERIFY") || upperType.includes("VERIFYORGANIZER")) {
            // isOrganizer nằm trong JWT - cần refresh token để lấy token mới với IsOrgainizer: true
            // Nếu không refresh, middleware sẽ chặn user vào /organizer vì token cũ vẫn là false
            (async () => {
              try {
                const newToken = await refreshTokenForReconnect();
                if (newToken) {
                  // Token mới đã được decode và update session store (user.IsOrgainizer = true)
                  await queryClient.invalidateQueries({ queryKey: KEY.users });
                  await queryClient.refetchQueries({ queryKey: KEY.users });
                  await queryClient.invalidateQueries({ queryKey: KEY.organizers });
                  await queryClient.refetchQueries({ queryKey: KEY.organizers });
                } else {
                  // Refresh thất bại - vẫn refresh user/organizer data (fallback)
                  await queryClient.invalidateQueries({ queryKey: KEY.users });
                  await queryClient.refetchQueries({ queryKey: KEY.users });
                  await queryClient.invalidateQueries({ queryKey: KEY.organizers });
                  await queryClient.refetchQueries({ queryKey: KEY.organizers });
                }
              } catch {
                await queryClient.invalidateQueries({ queryKey: KEY.users });
                await queryClient.refetchQueries({ queryKey: KEY.users });
                await queryClient.invalidateQueries({ queryKey: KEY.organizers });
                await queryClient.refetchQueries({ queryKey: KEY.organizers });
              }
            })();
          }

          queryClient.invalidateQueries({ queryKey: KEY.notifications });
        });

        await conn.start();

        if (isMounted) {
          setNotificationConnection(true);
        } else {
          conn.stop().catch(() => {});
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const e = err as { name?: string; message?: string };
        const msg = (e?.message || "").toLowerCase();
        const is401 = msg.includes("401") || msg.includes("phiên đăng nhập đã hết hạn");

        if (is401 && useSessionStore.getState().refreshToken) {
          isStartedRef.current = false;
          if (conn) {
            conn.stop().catch(() => {});
            conn = null;
          }
          setNotificationConnection(false);
          try {
            const newToken = await refreshTokenForReconnect();
            if (newToken && isMounted) {
              startConnection();
              return;
            }
          } catch {
            // Refresh failed - user sẽ bị redirect login
          }
        }

        isStartedRef.current = false;
        const isAbort =
          e?.name === "AbortError" ||
          msg.includes("stopped during negotiation") ||
          msg.includes("the connection was stopped") ||
          msg.includes("websocket") ||
          msg.includes("negotiate") ||
          msg.includes("failed to negotiate") ||
          msg.includes("aborted");

        if (!isAbort) {
          console.log(`[NotificationHub] Connection failed: ${e?.name || "Unknown"} - ${e?.message || ""}`);
        }
        setNotificationConnection(false);

        setTimeout(() => {
          if (isMounted && useSessionStore.getState().accessToken) {
            startConnection();
          }
        }, 5000);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      isStartedRef.current = false;
      if (conn) {
        if (conn.state !== signalR.HubConnectionState.Disconnected) {
          conn.stop().catch(() => {});
        }
        setNotificationConnection(false);
      }
    };
  }, [accessToken, user?.UserId, queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: notificationStore$.notifications.get(),
        addNotification,
        clearNotifications,
        isConnected: notificationStore$.isConnected.get(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
});

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return ctx;
}

export function useNotificationContextOptional() {
  return useContext(NotificationContext);
}
