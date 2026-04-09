import http from "@/lib/http";
import { ENDPOINT_CLIENT } from "@/utils/endpoint";
import { TicketGetListQuery, Ticket, TicketTypeGetListQuery, TicketType, TicketListingGetListQuery, TicketListing } from "@/types/ticket";
import { TicketCreateBody, TicketUpdateBody, TicketTypeCreateBody, TicketTypeUpdateBody, TicketTypeCreateArrayBody, TicketListingCreateBody, TicketListingCancelBody, TicketListingMarkSoldBody } from "@/schemas/ticket";
import { PaginatedData } from "@/types/base";

export const ticketRequest = {
  getList: (params: TicketGetListQuery) => http.get<PaginatedData<Ticket>>(ENDPOINT_CLIENT.TICKETS, { query: params }),
  getById: (id: string) => http.get<Ticket>(ENDPOINT_CLIENT.TICKET_DETAIL(id)),
  create: (body: TicketCreateBody) => http.post<Ticket>(ENDPOINT_CLIENT.TICKETS, body),
  update: (id: string, body: TicketUpdateBody) => http.put<Partial<Ticket>>(ENDPOINT_CLIENT.TICKET_DETAIL(id), body),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.TICKET_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.TICKET_DETAIL(id), {}),
};

export const ticketTypeRequest = {
  getList: (params: TicketTypeGetListQuery) =>
    http.get<PaginatedData<TicketType>>(ENDPOINT_CLIENT.TICKET_TYPES, { query: params }),
  getById: (id: string) => http.get<TicketType>(ENDPOINT_CLIENT.TICKET_TYPE_DETAIL(id)),
  create: (body: TicketTypeCreateBody) => http.post<TicketType>(ENDPOINT_CLIENT.TICKET_TYPES, body),
  createArray: (body: TicketTypeCreateArrayBody) => http.post<TicketType[]>(ENDPOINT_CLIENT.TICKET_TYPES_ARRAY, body),
  update: (id: string, body: TicketTypeUpdateBody) =>
    http.put<Partial<TicketType>>(ENDPOINT_CLIENT.TICKET_TYPE_DETAIL(id), body),
  decrement: (id: string, quantity: number) =>
    http.patch<Partial<TicketType>>(ENDPOINT_CLIENT.TICKET_TYPE_DECREMENT(id), { quantity }),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.TICKET_TYPE_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.TICKET_TYPE_DETAIL(id), {}),
};

export const ticketListingRequest = {
  getList: (params: TicketListingGetListQuery) =>
    http.get<PaginatedData<TicketListing>>(ENDPOINT_CLIENT.TICKET_LISTINGS, { query: params }),
  getById: (id: string) => http.get<TicketListing>(ENDPOINT_CLIENT.TICKET_LISTING_DETAIL(id)),
  validate: (id: string) => http.get<{ isAvailable: boolean; message?: string }>(ENDPOINT_CLIENT.TICKET_LISTING_VALIDATE(id)),
  create: (body: TicketListingCreateBody) => http.post<TicketListing | TicketListing[]>(ENDPOINT_CLIENT.TICKET_LISTINGS, body),
  cancel: (id: string, body: TicketListingCancelBody) =>
    http.patch<TicketListing>(ENDPOINT_CLIENT.TICKET_LISTING_CANCEL(id), body),
  markSold: (id: string, body: TicketListingMarkSoldBody) =>
    http.patch<TicketListing>(ENDPOINT_CLIENT.TICKET_LISTING_MARK_SOLD(id), body),
};
