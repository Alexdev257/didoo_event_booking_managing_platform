import api from "@/lib/interceptor";
import { ENDPOINT } from "@/utils/endpoint";
import { PaginatedData, ResponseData } from "@/types/base";
import { BookingCreateBody, TradeBookingCreateBody } from "@/schemas/booking";
import {
  BookingGetListQuery,
  Booking,
  BookingDetailGetListQuery,
  BookingDetail,
  PaymentGetListQuery,
  Payment,
  PaymentMethodGetListQuery,
  PaymentMethod,
  ResaleGetListQuery,
  Resale,
  ResaleTransactionGetListQuery,
  ResaleTransaction,
} from "@/types/booking";

export const bookingRequest = {
  getList: (params?: BookingGetListQuery) =>
    api.get<ResponseData<PaginatedData<Booking>>>(ENDPOINT.BOOKINGS, { params }),
  getById: (id: string) =>
    api.get<ResponseData<Booking>>(ENDPOINT.BOOKING_DETAIL(id)),
  create: (body: BookingCreateBody) =>
    api.post<ResponseData<Booking>>(ENDPOINT.BOOKINGS, body),
};

export const bookingDetailRequest = {
  getList: (params?: BookingDetailGetListQuery) =>
    api.get<ResponseData<PaginatedData<BookingDetail>>>(
      ENDPOINT.BOOKING_DETAILS,
      { params }
    ),
  getById: (id: string) =>
    api.get<ResponseData<BookingDetail>>(ENDPOINT.BOOKING_DETAIL_ITEM(id)),
};

export const paymentRequest = {
  getList: (params?: PaymentGetListQuery) =>
    api.get<ResponseData<PaginatedData<Payment>>>(ENDPOINT.PAYMENTS, {
      params: params ?? {},
    }),
  getById: (id: string) =>
    api.get<ResponseData<Payment>>(ENDPOINT.PAYMENT_DETAIL(id)),
  callback: (params: Record<string, string | number | boolean>) =>
    api.get<ResponseData<unknown>>(ENDPOINT.PAYMENT_CALLBACK, { params }),
};

export const paymentMethodRequest = {
  getList: (params?: PaymentMethodGetListQuery) =>
    api.get<ResponseData<PaginatedData<PaymentMethod>>>(
      ENDPOINT.PAYMENT_METHODS,
      { params: params ?? {} }
    ),
  getById: (id: string) =>
    api.get<ResponseData<PaymentMethod>>(ENDPOINT.PAYMENT_METHOD_DETAIL(id)),
};

export const tradeBookingRequest = {
  create: (body: TradeBookingCreateBody) =>
    api.post<ResponseData<Booking>>(ENDPOINT.TRADE_BOOKINGS, body),
};

export const resaleRequest = {
  getList: (params?: ResaleGetListQuery) =>
    api.get<ResponseData<PaginatedData<Resale>>>(ENDPOINT.RESALES, {
      params: params ?? {},
    }),
  getById: (id: string) =>
    api.get<ResponseData<Resale>>(ENDPOINT.RESALE_DETAIL(id)),
};

export const resaleTransactionRequest = {
  getList: (params?: ResaleTransactionGetListQuery) =>
    api.get<ResponseData<PaginatedData<ResaleTransaction>>>(
      ENDPOINT.RESALE_TRANSACTIONS,
      { params: params ?? {} }
    ),
  getById: (id: string) =>
    api.get<ResponseData<ResaleTransaction>>(
      ENDPOINT.RESALE_TRANSACTION_DETAIL(id)
    ),
};
