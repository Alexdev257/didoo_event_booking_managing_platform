import { create } from 'zustand';

interface TicketState {
  // eventId -> { ticketTypeId -> remainingCount }
  availability: Record<string, Record<string, number>>;
  isHubConnected: boolean;
  updateTicketAvailability: (eventId: string, ticketTypeId: string, count: number) => void;
  setTicketConnectionStatus: (status: boolean) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  availability: {},
  isHubConnected: false,
  updateTicketAvailability: (eventId, ticketTypeId, count) =>
    set((state) => ({
      availability: {
        ...state.availability,
        [eventId]: {
          ...(state.availability[eventId] || {}),
          [ticketTypeId]: count,
        },
      },
    })),
  setTicketConnectionStatus: (status) => set({ isHubConnected: status }),
}));

export const updateTicketAvailability = (eventId: string, ticketTypeId: string, count: number) =>
  useTicketStore.getState().updateTicketAvailability(eventId, ticketTypeId, count);

export const setTicketConnectionStatus = (status: boolean) =>
  useTicketStore.getState().setTicketConnectionStatus(status);
