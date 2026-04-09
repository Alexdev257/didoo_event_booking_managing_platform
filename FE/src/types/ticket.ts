import { BasePaginationQuery } from "./base";
import { Event } from "./event";
export interface TicketGetListQuery extends BasePaginationQuery {
    ownerId?: string;
    ticketTypeId?: string;
    eventId?: string;
    zone?: string;
    status?: number;
    hasEvent?: boolean;
    hasType?: boolean;
}

export interface Ticket {
    id: string;
    ticketTypeId?: string;
    ticketType?: Partial<TicketType>;
    event?: Partial<Event>;
    zone?: string;
    status: number; // 1=Available 2=Full 3=Unavailable 4=Locked
    createdAt: string;
}

export interface TicketListingGetListQuery extends BasePaginationQuery {
    sellerUserId?: string;
    ticketId?: string;
    eventId?: string;
    status?: number;
    fromPrice?: number;
    toPrice?: number;
    isDescending?: boolean;
    isDeleted?: boolean;
    fields?: string;
  }

  export interface TicketListingTicket {
    id?: string;
    ticketTypeId?: string;
    zone?: string;
    status?: number;
    ownerId?: string;
  }

  export interface TicketListingUser {
    id?: string;
    fullName?: string;
    avatarUrl?: string;
    gender?: number;
  }

  export interface TicketListingEvent {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    openTime?: string;
    closedTime?: string;
    status?: number;
    thumbnailUrl?: string;
    bannerUrl?: string;
    ageRestriction?: number;
  }
  
  export interface TicketListing {
    id: string;
    // Keep flat ids optional for backward compatibility with legacy FE usage.
    ticketId?: string;
    sellerUserId?: string;
    eventId?: string;
    bookingId?: string;
  // BE now returns grouped tickets as an array.
  ticket?: TicketListingTicket[];
    sellerUser?: TicketListingUser;
    event?: TicketListingEvent;
    askingPrice: number;
    description?: string | null;
    status: number;
    createdAt: string;
    updatedAt?: string | null;
  }

  export interface TicketTypeGetListQuery extends BasePaginationQuery {
    eventId?: string;
    name?: string;
    fromPrice?: number;
    toPrice?: number;
    description?: string;
}

/** Match BE TicketTypeDTO - event nested */
export interface TicketType {
    id: string;
    event?: Partial<Event>;
    name: string;
    price: number;
    totalQuantity: number;
    availableQuantity: number;
    description?: string;
    maxTicketsPerUser?: number | null;
    createdAt?: string;
}
