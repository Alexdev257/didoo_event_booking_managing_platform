import { BookingTypeStatus,BookingStatus } from "@/utils/enum";
import { BasePaginationQuery } from "./base";

/** Match BE BookingGetListQuery */
export interface BookingGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    status?: BookingStatus;
    bookingType?: BookingTypeStatus;
    fields?: string;
}

/** Match BE BookingGetByIdQuery */
export interface BookingGetByIdQuery {
    fields?: string;
}

/** Match BE BookingDetail - nested in booking */
export interface BookingDetailItem {
    id: string;
    seatId?: string | null;
    ticketId?: string | null;
    ticketTypeId?: string | null;
    resaleId?: string | null;
    quantity: number;
    pricePerTicket: number;
    totalPrice: number;
}

/** Match BE BookingDTO */
export interface Booking {
    id: string;
    userId: string;
    eventId: string;
    fullname: string;
    email: string;
    phone: string;
    amount: number;
    totalPrice: number;
    status: string; // Pending, Paid, Cancelled, etc.
    bookingType?: number | string; // BE may return 1/2 or "Normal"/"TradePurchase"
    paidAt?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
    paymentUrl?: string;
    bookingDetails?: BookingDetailItem[];
}

export interface BookingDetailGetListQuery extends BasePaginationQuery {
    bookingId?: string;
    ticketId?: string;
    seatId?: string;
    fields?: string;
}

export interface BookingDetailGetByIdQuery {
    fields?: string;
}

/** Match BE BookingDetailDTO */
export interface BookingDetail {
    id: string;
    bookingId: string;
    seatId?: string | null;
    ticketId: string;
    quantity: number;
    pricePerTicket: number;
    totalPrice: number;
    createdAt?: string;
    updatedAt?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
}

/** Match BE PaymentGetListQuery */
export interface PaymentGetListQuery extends BasePaginationQuery {
    userId?: string;
    bookingId?: string;
    paymentMethodId?: string;
    transactionCode?: string;
    fields?: string;
}

export interface PaymentGetByIdQuery {
    fields?: string;
}

/** Match BE PaymentDTO */
export interface Payment {
    id: string;
    userId: string;
    bookingId?: string | null;
    resaleTransactionId?: string | null;
    paymentMethodId?: string | null;
    cost: number;
    currency: string;
    transactionCode?: string | null;
    providerResponse?: string | null;
    paidAt: string;
    createdAt: string;
    updatedAt?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
}

export interface PaymentMethodGetListQuery extends BasePaginationQuery {
    name?: string;
    status?: number;
    fields?: string;
}

export interface PaymentMethodGetByIdQuery {
    fields?: string;
}

/** Match BE PaymentMethodDTO */
export interface PaymentMethod {
    id: string;
    name: string;
    description?: string;
    status: string; // Active, Inactive
    createdAt?: string;
}

/** Match BE ResaleGetListQuery */
export interface ResaleGetListQuery extends BasePaginationQuery {
    salerUserId?: string;
    bookingDetailId?: string;
    status?: number;
    fromPrice?: number;
    toPrice?: number;
    fields?: string;
}

export interface ResaleGetByIdQuery {
    fields?: string;
}

/** Match BE ResaleDTO */
export interface Resale {
    id: string;
    salerUserId: string;
    bookingDetailId: string;
    description?: string | null;
    price?: number | null;
    status?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
}

/** Match BE ResaleTransactionGetListQuery */
export interface ResaleTransactionGetListQuery extends BasePaginationQuery {
    resaleId?: string;
    buyerUserId?: string;
    status?: number;
    fields?: string;
}

export interface ResaleTransactionGetByIdQuery {
    fields?: string;
}

/** Match BE ResaleTransactionDTO */
export interface ResaleTransaction {
    id: string;
    resaleId: string;
    buyerUserId: string;
    cost: number;
    feeCost: number;
    status: string;
    transactionDate: string;
    createdAt: string;
    updatedAt?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
}
