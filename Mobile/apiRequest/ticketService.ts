import api from "@/lib/interceptor";
import { ENDPOINT } from "@/utils/endpoint";
import {
  TicketGetListQuery,
  Ticket,
  TicketTypeGetListQuery,
  TicketType,
  TicketListingGetListQuery,
  TicketListing,
} from "@/types/ticket";
import {
  TicketCreateBody,
  TicketUpdateBody,
  TicketTypeCreateBody,
  TicketTypeUpdateBody,
  TicketTypeCreateArrayBody,
  TicketListingCreateBody,
  TicketListingCancelBody,
  TicketListingMarkSoldBody,
} from "@/schemas/ticket";
import { PaginatedData, ResponseData } from "@/types/base";

export const ticketRequest = {
  getList: (params?: TicketGetListQuery) =>
    api.get<ResponseData<PaginatedData<Ticket>>>(ENDPOINT.TICKETS, { params }),
  getById: (id: string) =>
    api.get<ResponseData<Ticket>>(ENDPOINT.TICKET_DETAIL(id)),
  create: (body: TicketCreateBody) =>
    api.post<ResponseData<Ticket>>(ENDPOINT.TICKETS, body),
  update: (id: string, body: TicketUpdateBody) =>
    api.put<ResponseData<Partial<Ticket>>>(ENDPOINT.TICKET_DETAIL(id), body),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.TICKET_DETAIL(id)),
  restore: (id: string) => api.patch<ResponseData<null>>(ENDPOINT.TICKET_DETAIL(id), {}),
};

export const ticketTypeRequest = {
  getList: (params?: TicketTypeGetListQuery) =>
    api.get<ResponseData<PaginatedData<TicketType>>>(ENDPOINT.TICKET_TYPES, {
      params,
    }),
  getById: (id: string) =>
    api.get<ResponseData<TicketType>>(ENDPOINT.TICKET_TYPE_DETAIL(id)),
  create: (body: TicketTypeCreateBody) =>
    api.post<ResponseData<TicketType>>(ENDPOINT.TICKET_TYPES, body),
  createArray: (body: TicketTypeCreateArrayBody) =>
    api.post<ResponseData<TicketType[]>>(ENDPOINT.TICKET_TYPES_ARRAY, body),
  update: (id: string, body: TicketTypeUpdateBody) =>
    api.put<ResponseData<Partial<TicketType>>>(
      ENDPOINT.TICKET_TYPE_DETAIL(id),
      body
    ),
  decrement: (id: string, quantity: number) =>
    api.patch<ResponseData<Partial<TicketType>>>(
      ENDPOINT.TICKET_TYPE_DECREMENT(id),
      { quantity }
    ),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.TICKET_TYPE_DETAIL(id)),
  restore: (id: string) => api.patch<ResponseData<null>>(ENDPOINT.TICKET_TYPE_DETAIL(id), {}),
};

export const ticketListingRequest = {
  getList: (params?: TicketListingGetListQuery) =>
    api.get<ResponseData<PaginatedData<TicketListing>>>(
      ENDPOINT.TICKET_LISTINGS,
      { params }
    ),
  getById: (id: string) =>
    api.get<ResponseData<TicketListing>>(ENDPOINT.TICKET_LISTING_DETAIL(id)),
  validate: (id: string) =>
    api.get<ResponseData<{ isAvailable: boolean; message?: string }>>(
      ENDPOINT.TICKET_LISTING_VALIDATE(id)
    ),
  create: (body: TicketListingCreateBody) =>
    api.post<ResponseData<TicketListing | TicketListing[]>>(
      ENDPOINT.TICKET_LISTINGS,
      body
    ),
  cancel: (id: string, body: TicketListingCancelBody) =>
    api.patch<ResponseData<TicketListing>>(
      ENDPOINT.TICKET_LISTING_CANCEL(id),
      body
    ),
  markSold: (id: string, body: TicketListingMarkSoldBody) =>
    api.patch<ResponseData<TicketListing>>(
      ENDPOINT.TICKET_LISTING_MARK_SOLD(id),
      body
    ),
};
