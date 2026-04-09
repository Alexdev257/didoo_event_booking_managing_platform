import {
    CategoryGetListQuery,
    EventGetListQuery,
    EventReviewGetListQuery,
    FavoriteGetListQuery,
    InteractionGetListQuery,
    OrganizerGetListQuery,
} from "@/types/event";
import { TicketGetListQuery, TicketTypeGetListQuery } from "@/types/ticket";
import {
    BookingGetListQuery,
    BookingDetailGetListQuery,
    PaymentMethodGetListQuery,
    PaymentGetListQuery,
    ResaleGetListQuery,
    ResaleTransactionGetListQuery,
} from "@/types/booking";
import { NotificationGetListQuery, CheckInGetListQuery } from "@/types/operation";
import { UserGetListQuery } from "@/types/auth";


export const KEY = {
    users: ['users'],
    roles: ['roles'],
    events: ['events'],
    categories: ['categories'],
    organizers: ['organizers'],
    eventReviews: ['event-reviews'],
    favorites: ['favorites'],
    interactions: ['interactions'],
    tickets: ['tickets'],
    ticketTypes: ['ticket-types'],
    bookings: ['bookings'],
    bookingDetails: ['booking-details'],
    paymentMethods: ['payment-methods'],
    payments: ['payments'],
    resales: ['resales'],
    resaleTransactions: ['resale-transactions'],
    notifications: ['notifications'],
    checkIns: ['check-ins'],
} as const;

export const QUERY_KEY = {
    users: {
        list: (query?: UserGetListQuery) => [...KEY.users, 'list', query] as const,
        detail: (id: string) => [...KEY.users, 'detail', id] as const,
    },
    roles: {
        list: () => [...KEY.roles, 'list'] as const,
    },
    events: {
        list: (query?: EventGetListQuery) => [...KEY.events, 'list', query] as const,
        detail: (id: string) => [...KEY.events, 'detail', id] as const,
    },
    categories: {
        list: (query?: CategoryGetListQuery) => [...KEY.categories, 'list', query] as const,
        detail: (id: string) => [...KEY.categories, 'detail', id] as const,
    },
    organizers: {
        list: (query?: OrganizerGetListQuery) => [...KEY.organizers, 'list', query] as const,
        detail: (id: string) => [...KEY.organizers, 'detail', id] as const,
    },
    eventReviews: {
        list: (query?: EventReviewGetListQuery) => [...KEY.eventReviews, 'list', query] as const,
        detail: (id: string) => [...KEY.eventReviews, 'detail', id] as const,
    },
    favorites: {
        list: (query?: FavoriteGetListQuery) => [...KEY.favorites, 'list', query] as const,
        detail: (id: string) => [...KEY.favorites, 'detail', id] as const,
    },
    interactions: {
        list: (query?: InteractionGetListQuery) => [...KEY.interactions, 'list', query] as const,
        detail: (id: string) => [...KEY.interactions, 'detail', id] as const,
    },
    tickets: {
        list: (query?: TicketGetListQuery) => [...KEY.tickets, 'list', query] as const,
        detail: (id: string) => [...KEY.tickets, 'detail', id] as const,
    },
    ticketTypes: {
        list: (query?: TicketTypeGetListQuery) => [...KEY.ticketTypes, 'list', query] as const,
        detail: (id: string) => [...KEY.ticketTypes, 'detail', id] as const,
    },
    bookings: {
        list: (query?: BookingGetListQuery) => [...KEY.bookings, 'list', query] as const,
        detail: (id: string) => [...KEY.bookings, 'detail', id] as const,
    },
    bookingDetails: {
        list: (query?: BookingDetailGetListQuery) => [...KEY.bookingDetails, 'list', query] as const,
        detail: (id: string) => [...KEY.bookingDetails, 'detail', id] as const,
    },
    paymentMethods: {
        list: (query?: PaymentMethodGetListQuery) => [...KEY.paymentMethods, 'list', query] as const,
        detail: (id: string) => [...KEY.paymentMethods, 'detail', id] as const,
    },
    payments: {
        list: (query?: PaymentGetListQuery) => [...KEY.payments, 'list', query] as const,
        detail: (id: string) => [...KEY.payments, 'detail', id] as const,
    },
    resales: {
        list: (query?: ResaleGetListQuery) => [...KEY.resales, 'list', query] as const,
        detail: (id: string) => [...KEY.resales, 'detail', id] as const,
    },
    resaleTransactions: {
        list: (query?: ResaleTransactionGetListQuery) => [...KEY.resaleTransactions, 'list', query] as const,
        detail: (id: string) => [...KEY.resaleTransactions, 'detail', id] as const,
    },
    notifications: {
        list: (query?: NotificationGetListQuery) => [...KEY.notifications, 'list', query] as const,
        detail: (id: string) => [...KEY.notifications, 'detail', id] as const,
    },
    checkIns: {
        list: (query?: CheckInGetListQuery) => [...KEY.checkIns, 'list', query] as const,
        detail: (id: string) => [...KEY.checkIns, 'detail', id] as const,
    },
} as const;
