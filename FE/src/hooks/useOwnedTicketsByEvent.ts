import { useMemo } from "react";
import { useGetTickets } from "@/hooks/useTicket";
import type { Ticket } from "@/types/ticket";

/**
 * Đếm số vé đã mua theo từng ticketTypeId cho user hiện tại trong 1 sự kiện.
 * Dùng cho: booking (giới hạn maxTicketsPerUser) và resale (check trước khi mua).
 */
export function useOwnedTicketsCountByTicketType(
  eventId: string,
  ownerId: string | undefined,
  options?: { enabled?: boolean }
) {
  const { data: ticketsRes } = useGetTickets(
    {
      ownerId,
      eventId,
      pageNumber: 1,
      pageSize: 500,
      hasEvent: true,
      hasType: true,
    },
    { enabled: (options?.enabled ?? true) && !!ownerId && !!eventId }
  );

  const countByTicketTypeId = useMemo(() => {
    const map = new Map<string, number>();
    const items: Ticket[] = ticketsRes?.data?.items ?? [];
    for (const ticket of items) {
      const ttId = ticket.ticketTypeId ?? ticket.ticketType?.id;
      if (ttId) {
        map.set(ttId, (map.get(ttId) ?? 0) + 1);
      }
    }
    return map;
  }, [ticketsRes?.data?.items]);

  return countByTicketTypeId;
}
