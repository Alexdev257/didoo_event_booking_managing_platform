import api from "@/lib/interceptor";
import { ENDPOINT } from "@/utils/endpoint";
import {
  EventGetListQuery,
  Event,
  CategoryGetListQuery,
  Category,
  OrganizerGetListQuery,
  Organizer,
  EventReviewGetListQuery,
  EventReview,
  FavoriteGetListQuery,
  Favorite,
  InteractionGetListQuery,
  Interaction,
} from "@/types/event";
import { PaginatedData, ResponseData } from "@/types/base";
import {
  EventCreateBody,
  EventUpdateBody,
  CategoryCreateBody,
  CategoryUpdateBody,
  OrganizerCreateBody,
  OrganizerUpdateBody,
  EventReviewCreateBody,
  EventReviewUpdateBody,
  FavoriteCreateBody,
  InteractionCreateBody,
} from "@/schemas/event";

export const eventRequest = {
  getList: (params?: EventGetListQuery) =>
    api.get<ResponseData<PaginatedData<Event>>>(ENDPOINT.EVENTS, { params }),
  getById: (id: string, params?: { hasTicketTypes?: boolean; hasLocations?: boolean }) =>
    api.get<ResponseData<Event>>(ENDPOINT.EVENT_DETAIL(id), { params }),
  create: (body: EventCreateBody) =>
    api.post<ResponseData<Event>>(ENDPOINT.EVENTS, body),
  update: (id: string, body: EventUpdateBody) =>
    api.put<ResponseData<Partial<Event>>>(ENDPOINT.EVENT_DETAIL(id), body),
  updateStatus: (id: string, body: { status: number }) =>
    api.patch<ResponseData<Partial<Event>>>(ENDPOINT.EVENT_STATUS(id), body),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.EVENT_DETAIL(id)),
  restore: (id: string) => api.patch<ResponseData<null>>(ENDPOINT.EVENT_DETAIL(id), {}),
};

export const categoryRequest = {
  getList: (params?: CategoryGetListQuery) =>
    api.get<ResponseData<PaginatedData<Category>>>(ENDPOINT.CATEGORIES, {
      params,
    }),
  getById: (id: string) =>
    api.get<ResponseData<Category>>(ENDPOINT.CATEGORY_DETAIL(id)),
  create: (body: CategoryCreateBody) =>
    api.post<ResponseData<Category>>(ENDPOINT.CATEGORIES, body),
  update: (id: string, body: CategoryUpdateBody) =>
    api.put<ResponseData<Partial<Category>>>(ENDPOINT.CATEGORY_DETAIL(id), body),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.CATEGORY_DETAIL(id)),
  restore: (id: string) => api.patch<ResponseData<null>>(ENDPOINT.CATEGORY_DETAIL(id), {}),
};

export const organizerRequest = {
  getList: (params?: OrganizerGetListQuery) =>
    api.get<ResponseData<PaginatedData<Organizer>>>(ENDPOINT.ORGANIZERS, {
      params,
    }),
  getById: (id: string) =>
    api.get<ResponseData<Organizer>>(ENDPOINT.ORGANIZER_DETAIL(id)),
  create: (body: OrganizerCreateBody) =>
    api.post<ResponseData<Organizer>>(ENDPOINT.ORGANIZERS, body),
  update: (id: string, body: OrganizerUpdateBody) =>
    api.put<ResponseData<Partial<Organizer>>>(ENDPOINT.ORGANIZER_DETAIL(id), body),
  verify: (id: string) =>
    api.patch<ResponseData<Partial<Organizer>>>(ENDPOINT.ORGANIZER_VERIFY(id), {}),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.ORGANIZER_DETAIL(id)),
  restore: (id: string) => api.patch<ResponseData<null>>(ENDPOINT.ORGANIZER_DETAIL(id), {}),
};

export const eventReviewRequest = {
  getList: (params?: EventReviewGetListQuery) =>
    api.get<ResponseData<PaginatedData<EventReview>>>(ENDPOINT.EVENT_REVIEWS, {
      params,
    }),
  getById: (id: string) =>
    api.get<ResponseData<EventReview>>(ENDPOINT.EVENT_REVIEW_DETAIL(id)),
  create: (body: EventReviewCreateBody) =>
    api.post<ResponseData<EventReview>>(ENDPOINT.EVENT_REVIEWS, body),
  update: (id: string, body: EventReviewUpdateBody) =>
    api.put<ResponseData<Partial<EventReview>>>(
      ENDPOINT.EVENT_REVIEW_DETAIL(id),
      body
    ),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.EVENT_REVIEW_DETAIL(id)),
  restore: (id: string) => api.patch<ResponseData<null>>(ENDPOINT.EVENT_REVIEW_DETAIL(id), {}),
};

export const favoriteRequest = {
  getList: (params?: FavoriteGetListQuery) =>
    api.get<ResponseData<PaginatedData<Favorite>>>(ENDPOINT.FAVORITES, {
      params,
    }),
  getById: (id: string) =>
    api.get<ResponseData<Favorite>>(ENDPOINT.FAVORITE_DETAIL(id)),
  create: (body: FavoriteCreateBody) =>
    api.post<ResponseData<Favorite>>(ENDPOINT.FAVORITES, body),
  delete: (userId: string, eventId: string) =>
    api.delete<ResponseData<null>>(ENDPOINT.FAVORITE_DELETE(userId, eventId)),
  softDelete: (userId: string, eventId: string) =>
    api.delete<ResponseData<null>>(ENDPOINT.FAVORITE_SOFT_DELETE(userId, eventId)),
  restore: (userId: string, eventId: string) =>
    api.patch<ResponseData<null>>(ENDPOINT.FAVORITE_DELETE(userId, eventId), {}),
};

export const interactionRequest = {
  getList: (params?: InteractionGetListQuery) =>
    api.get<ResponseData<PaginatedData<Interaction>>>(ENDPOINT.INTERACTIONS, {
      params,
    }),
  getById: (id: string) =>
    api.get<ResponseData<Interaction>>(ENDPOINT.INTERACTION_DETAIL(id)),
  create: (body: InteractionCreateBody) =>
    api.post<ResponseData<Interaction>>(ENDPOINT.INTERACTIONS, body),
  delete: (userId: string, eventId: string, type: number) =>
    api.delete<ResponseData<null>>(ENDPOINT.INTERACTION_DELETE(userId, eventId, type)),
  softDelete: (userId: string, eventId: string, type: number) =>
    api.delete<ResponseData<null>>(ENDPOINT.INTERACTION_SOFT_DELETE(userId, eventId, type)),
  restore: (userId: string, eventId: string, type: number) =>
    api.patch<ResponseData<null>>(ENDPOINT.INTERACTION_DELETE(userId, eventId, type), {}),
};
