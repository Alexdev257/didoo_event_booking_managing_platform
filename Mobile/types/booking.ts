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
    Id: string;
    SeatId?: string | null;
    TicketId?: string | null;
    ResaleId?: string | null;
    Quantity: number;
    PricePerTicket: number;
    TotalPrice: number;
}

/** Match BE BookingDTO */
export interface Booking {
    Id: string;
    UserId: string;
    EventId: string;
    Fullname: string;
    Email: string;
    Phone: string;
    Amount: number;
    TotalPrice: number;
    Status: string; // Pending, Paid, Cancelled, etc.
    BookingType?: number | string; // BE may return 1/2 or "Normal"/"TradePurchase"
    PaidAt?: string | null;
    CreatedAt?: string;
    UpdatedAt?: string | null;
    IsDeleted?: boolean;
    DeletedAt?: string | null;
    PaymentUrl?: string;
    BookingDetails?: BookingDetailItem[];
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
    Id: string;
    BookingId: string;
    SeatId?: string | null;
    TicketId: string;
    Quantity: number;
    PricePerTicket: number;
    TotalPrice: number;
    CreatedAt?: string;
    UpdatedAt?: string | null;
    IsDeleted?: boolean;
    DeletedAt?: string | null;
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
    Id: string;
    UserId: string;
    BookingId?: string | null;
    ResaleTransactionId?: string | null;
    PaymentMethodId?: string | null;
    Cost: number;
    Currency: string;
    TransactionCode?: string | null;
    ProviderResponse?: string | null;
    PaidAt: string;
    CreatedAt: string;
    UpdatedAt?: string | null;
    IsDeleted?: boolean;
    DeletedAt?: string | null;
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
    Id: string;
    Name: string;
    Description?: string;
    Status: string; // Active, Inactive
    CreatedAt?: string;
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
    Id: string;
    SalerUserId: string;
    BookingDetailId: string;
    Description?: string | null;
    Price?: number | null;
    Status?: string | null;
    CreatedAt: string;
    UpdatedAt?: string | null;
    IsDeleted?: boolean;
    DeletedAt?: string | null;
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
    Id: string;
    ResaleId: string;
    BuyerUserId: string;
    Cost: number;
    FeeCost: number;
    Status: string;
    TransactionDate: string;
    CreatedAt: string;
    UpdatedAt?: string | null;
    IsDeleted?: boolean;
    DeletedAt?: string | null;
}
