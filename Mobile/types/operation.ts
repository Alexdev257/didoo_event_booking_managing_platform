import { BasePaginationQuery } from "./base";

export interface CheckInGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    bookingDetailId?: string;
    ticketId?: string;
    checkInAt?: string;
    checkByUserId?: string;
    hasUser?: boolean;
    hasEvent?: boolean;
    hasBooking?: boolean;
    hasTicket?: boolean;
}

export interface CheckInUser {
    id?: string;
    fullName?: string;
    email?: string;
}

export interface CheckInEvent {
    id?: string;
    name?: string;
}

export interface CheckInBookingDetail {
    id?: string;
    bookingId?: string;
    ticketId?: string;
}

export interface CheckInTicket {
    id?: string;
    zone?: string;
}

export interface CheckIn {
    user?: CheckInUser;
    event?: CheckInEvent;
    bookingDetail?: CheckInBookingDetail;
    ticket?: CheckInTicket;
    checkInAt?: string;
    checkByUser?: CheckInUser;
    createdAt?: string;
}


export interface NotificationGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    title?: string;
    message?: string;
    isRead?: boolean;
    hasUser?: boolean;
    hasEvent?: boolean;
}

export interface NotificationUser {
    id?: string;
    fullName?: string;
    email?: string;
}

export interface NotificationEvent {
    id?: string;
    name?: string;
}

export interface Notification {
    id?: string;
    user?: NotificationUser;
    event?: NotificationEvent;
    title?: string;
    message?: string;
    isRead: boolean;
}
