import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { createTicketHubConnection } from "@/lib/ticketHub";
import { toast } from "sonner";
import { updateTicketAvailability, setTicketConnectionStatus } from "@/stores/ticketStore";

/** Payload từ BE: ReceiveZoneUpdate - ASP.NET serialize camelCase */
type ZoneUpdatePayload = {
  ticketTypeId: string;
  remainingCount: number;
};

export const useTicketHub = (eventId: string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const isStartedRef = useRef(false);

  const selectTicket = useCallback(
    async (ticketTypeId: string, quantityChange: number) => {
      if (!connection || connection.state !== signalR.HubConnectionState.Connected || !eventId) return;
      try {
        await connection.invoke("SelectTicket", eventId, ticketTypeId, quantityChange);
      } catch (err) {
        console.error("SignalR SelectTicket error:", err);
        toast.error("Không thể cập nhật vé. Vui lòng thử lại.");
      }
    },
    [eventId, connection]
  );

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;
    let conn: signalR.HubConnection | null = null;

    const startConnection = async () => {
      if (isStartedRef.current) return;
      isStartedRef.current = true;

      try {
        conn = createTicketHubConnection();

        conn.on("ReceiveZoneUpdate", (data: ZoneUpdatePayload) => {
          if (!isMounted) return;
          // Handle both camelCase and PascalCase just in case
          const id = data.ticketTypeId ?? (data as any).TicketTypeId;
          const count = data.remainingCount ?? (data as any).RemainingCount;
          if (id != null && typeof count === "number") {
            updateTicketAvailability(eventId, id, count);
          }
        });

        conn.on("ReceiveTicketUpdateFailed", (ticketTypeId: string, errorMessage: string) => {
          if (!isMounted) return;
          toast.error(errorMessage || "Không thể chọn thêm vé. Vé có thể đã hết.");
        });

        await conn.start();

        if (!isMounted) {
          await conn.stop().catch(() => {});
          return;
        }

        await conn.invoke("JoinEventGroup", eventId);
        setConnection(conn);
        setTicketConnectionStatus(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        isStartedRef.current = false;
        
        const e = err as { name?: string; message?: string };
        const isAbort = e?.name === "AbortError" || e?.message?.includes("stopped during negotiation");

        // Log error details for debugging
        console.log(`[TicketHub] Connection failed: ${e?.name || "Unknown error"} - ${e?.message || "No message"}`);

        if (!isAbort) {
          console.error("SignalR TicketHub connection error:", err);
        }
        setTicketConnectionStatus(false);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      isStartedRef.current = false;
      if (conn) {
        const c = conn;
        if (c.state !== signalR.HubConnectionState.Disconnected) {
          c.invoke("LeaveEventGroup", eventId)
           .catch(() => {})
           .finally(() => {
             c.stop().catch(() => {});
           });
        }
        setTicketConnectionStatus(false);
      }
    };
  }, [eventId]);

  return {
    selectTicket,
    isConnected: connection?.state === signalR.HubConnectionState.Connected,
  };
};
