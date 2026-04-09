import http from "@/lib/http";
import { ENDPOINT_CLIENT } from "@/utils/endpoint";
import { PaginatedData } from "@/types/base";
import { BookingCreateBody, TradeBookingCreateBody } from "@/schemas/booking";
import { BookingGetListQuery, Booking, BookingDetailGetListQuery, BookingDetail, PaymentGetListQuery, Payment, PaymentMethodGetListQuery, PaymentMethod, ResaleGetListQuery, Resale, ResaleTransactionGetListQuery, ResaleTransaction } from "@/types/booking";
export const bookingRequest = {
  getList: (params: BookingGetListQuery) => http.get<PaginatedData<Booking>>(ENDPOINT_CLIENT.BOOKINGS, { query: params }),
  getById: (id: string) => http.get<Booking>(ENDPOINT_CLIENT.BOOKING_DETAIL(id)),
  create: (body: BookingCreateBody) => http.post<Booking>(ENDPOINT_CLIENT.BOOKINGS, body),
};

export const bookingDetailRequest = {
  getList: (params: BookingDetailGetListQuery) =>
    http.get<PaginatedData<BookingDetail>>(ENDPOINT_CLIENT.BOOKING_DETAILS, { query: params }),
  getById: (id: string) => http.get<BookingDetail>(ENDPOINT_CLIENT.BOOKING_DETAIL_ITEM(id)),
};

export const paymentRequest = {
  getList: (params: PaymentGetListQuery) => http.get<PaginatedData<Payment>>(ENDPOINT_CLIENT.PAYMENTS, { query: params || {} }),
  getById: (id: string) => http.get<Payment>(ENDPOINT_CLIENT.PAYMENT_DETAIL(id)),
  callback: (params: Record<string, string | number | boolean>) =>
    http.get<unknown>(ENDPOINT_CLIENT.PAYMENT_CALLBACK, { query: params, skipAuth: true }),
};

export const paymentMethodRequest = {
  getList: (params?: PaymentMethodGetListQuery) =>
    http.get<PaginatedData<PaymentMethod>>(ENDPOINT_CLIENT.PAYMENT_METHODS, { query: params || {} }),
  getById: (id: string) => http.get<PaymentMethod>(ENDPOINT_CLIENT.PAYMENT_METHOD_DETAIL(id)),
};

export const tradeBookingRequest = {
  create: (body: TradeBookingCreateBody) => http.post<Booking>(ENDPOINT_CLIENT.TRADE_BOOKINGS, body),
};

export const resaleRequest = {
  getList: (params?: ResaleGetListQuery) => http.get<PaginatedData<Resale>>(ENDPOINT_CLIENT.RESALES, { query: params || {} }),
  getById: (id: string) => http.get<Resale>(ENDPOINT_CLIENT.RESALE_DETAIL(id)),
};

export const resaleTransactionRequest = {
  getList: (params?: ResaleTransactionGetListQuery) =>
    http.get<PaginatedData<ResaleTransaction>>(ENDPOINT_CLIENT.RESALE_TRANSACTIONS, { query: params || {} }),
  getById: (id: string) => http.get<ResaleTransaction>(ENDPOINT_CLIENT.RESALE_TRANSACTION_DETAIL(id)),
};
