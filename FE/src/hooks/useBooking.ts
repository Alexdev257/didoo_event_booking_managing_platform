import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingRequest, bookingDetailRequest, paymentRequest, paymentMethodRequest, tradeBookingRequest, resaleRequest, resaleTransactionRequest } from "@/apiRequest/bookingService";
import { BookingCreateBody, TradeBookingCreateBody } from "@/schemas/booking";
import { BookingGetListQuery, BookingDetailGetListQuery, PaymentGetListQuery, PaymentMethodGetListQuery, ResaleGetListQuery, ResaleTransactionGetListQuery } from "@/types/booking";
import { KEY, QUERY_KEY } from "@/utils/constant";

export const useGetBookings = (params?: BookingGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.bookings.list(params),
  queryFn: () => bookingRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetBooking = (id: string) => useQuery({
  queryKey: QUERY_KEY.bookings.detail(id),
  queryFn: () => bookingRequest.getById(id),
  enabled: !!id,
});
export const useGetBookingDetails = (params?: BookingDetailGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.bookingDetails.list(params),
  queryFn: () => bookingDetailRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetBookingDetail = (id: string) => useQuery({
  queryKey: QUERY_KEY.bookingDetails.detail(id),
  queryFn: () => bookingDetailRequest.getById(id),
  enabled: !!id,
});
export const useBooking = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: BookingCreateBody) => (await bookingRequest.create(body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY.bookings }),
  });
  return { create };
};

export const useGetPayments = (params?: PaymentGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.payments.list(params),
  queryFn: () => paymentRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetPayment = (id: string, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.payments.detail(id),
  queryFn: () => paymentRequest.getById(id),
  enabled: (options?.enabled ?? true) && !!id,
});

export const useGetPaymentMethods = (params?: PaymentMethodGetListQuery) => useQuery({
  queryKey: QUERY_KEY.paymentMethods.list(params),
  queryFn: () => paymentMethodRequest.getList(params || {}),
});
export const useGetPaymentMethod = (id: string) => useQuery({
  queryKey: QUERY_KEY.paymentMethods.detail(id),
  queryFn: () => paymentMethodRequest.getById(id),
  enabled: !!id,
});

export const useTradeBooking = () => {
  const create = useMutation({
    mutationFn: async (body: TradeBookingCreateBody) => (await tradeBookingRequest.create(body)).data,
  });
  return { create };
};

export const useGetResales = (params?: ResaleGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.resales.list(params),
  queryFn: () => resaleRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetResale = (id: string, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.resales.detail(id),
  queryFn: () => resaleRequest.getById(id),
  enabled: (options?.enabled ?? true) && !!id,
});

export const useGetResaleTransactions = (params?: ResaleTransactionGetListQuery, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.resaleTransactions.list(params),
  queryFn: () => resaleTransactionRequest.getList(params || {}),
  enabled: options?.enabled ?? true,
});
export const useGetResaleTransaction = (id: string, options?: { enabled?: boolean }) => useQuery({
  queryKey: QUERY_KEY.resaleTransactions.detail(id),
  queryFn: () => resaleTransactionRequest.getById(id),
  enabled: (options?.enabled ?? true) && !!id,
});
