import { observable } from "@legendapp/state";

/**
 * Store for realtime ticket availability and connection status.
 */
export const ticketStore$ = observable({
  availability: {} as Record<string, Record<string, number>>,
  isConnected: false,
});

/**
 * Update availability for a specific ticket type in an event.
 */
export const updateTicketAvailability = (eventId: string, ticketTypeId: string, remainingCount: number) => {
  if (!ticketStore$.availability[eventId].get()) {
    ticketStore$.availability[eventId].set({});
  }
  ticketStore$.availability[eventId][ticketTypeId].set(remainingCount);
};

/**
 * Clear availability for an event when no longer needed.
 */
export const clearEventAvailability = (eventId: string) => {
  ticketStore$.availability[eventId].delete();
};

export const setTicketConnectionStatus = (status: boolean) => {
  ticketStore$.isConnected.set(status);
};
