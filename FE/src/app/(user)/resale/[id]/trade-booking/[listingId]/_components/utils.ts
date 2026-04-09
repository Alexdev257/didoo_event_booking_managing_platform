import type { TicketListing, TicketType } from "@/types/ticket";

export function getTicketTypeGroups(
  listing: TicketListing,
  ticketTypes: TicketType[]
): { name: string; count: number; price: number }[] {
  const tickets = listing.ticket ?? [];
  const ttById = new Map(ticketTypes.map((tt) => [tt.id, tt]));
  const countByTtId = new Map<string, number>();
  for (const t of tickets) {
    const ttId = t.ticketTypeId;
    if (!ttId) continue;
    countByTtId.set(ttId, (countByTtId.get(ttId) ?? 0) + 1);
  }
  return Array.from(countByTtId.entries()).map(([ttId, count]) => ({
    name: ttById.get(ttId)?.name ?? "Loại vé",
    count,
    price: Number(ttById.get(ttId)?.price ?? 0),
  }));
}

export function wouldExceedMaxTicketsPerUser(
  listing: TicketListing,
  ticketTypes: TicketType[],
  ownedCountByTicketType: Map<string, number>
): boolean {
  const tickets = listing.ticket ?? [];
  const ttById = new Map(ticketTypes.map((tt) => [tt.id, tt]));

  for (const t of tickets) {
    const ttId = t.ticketTypeId;
    if (!ttId) continue;
    const tt = ttById.get(ttId);
    const maxPerUser = tt?.maxTicketsPerUser;
    if (maxPerUser == null || Number(maxPerUser) <= 0) continue;

    const listingCountForType = tickets.filter((x) => x.ticketTypeId === ttId).length;
    const owned = ownedCountByTicketType.get(ttId) ?? 0;
    if (listingCountForType + owned > Number(maxPerUser)) return true;
  }
  return false;
}
