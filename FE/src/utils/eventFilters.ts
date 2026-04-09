import { addDays, isSameDay } from "date-fns";
import type { Event } from "@/types/event";

export type DateFilter = "all" | "today" | "tomorrow" | "weekend" | "custom";

export function filterByDate(
  events: Event[],
  dateFilter: DateFilter,
  customDate: Date | undefined
): Event[] {
  if (dateFilter === "all") return events;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return events.filter((e) => {
    const start = new Date(e.startTime);
    if (dateFilter === "today") return isSameDay(start, todayStart);
    if (dateFilter === "tomorrow") return isSameDay(start, addDays(todayStart, 1));
    if (dateFilter === "weekend") {
      const day = start.getDay();
      return day === 0 || day === 6;
    }
    if (dateFilter === "custom" && customDate) return isSameDay(start, customDate);
    return true;
  });
}

export function filterByEventType(events: Event[], type: string): Event[] {
  if (type === "all") return events;
  return events.filter((e) => {
    const loc = e.locations?.[0];
    const name = (loc?.name || "").toLowerCase();
    const addr = (loc?.address || "").toLowerCase();
    const isOnline =
      name.includes("online") ||
      addr.includes("online") ||
      addr.includes("trực tuyến");
    if (type === "online") return isOnline;
    if (type === "inperson") return !isOnline;
    return true;
  });
}
