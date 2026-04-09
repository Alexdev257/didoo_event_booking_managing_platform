import http from "@/lib/http";
import { ENDPOINT_CLIENT } from "@/utils/endpoint";
import { EventGetListQuery, Event,  CategoryGetListQuery, Category, OrganizerGetListQuery, Organizer, EventReviewGetListQuery, EventReview, FavoriteGetListQuery, Favorite, InteractionGetListQuery, Interaction } from "@/types/event";
import { PaginatedData } from "@/types/base";
import { EventCreateBody, EventUpdateBody, CategoryCreateBody, CategoryUpdateBody, OrganizerCreateBody, OrganizerUpdateBody, EventReviewCreateBody, EventReviewUpdateBody, FavoriteCreateBody, InteractionCreateBody } from "@/schemas/event";

export const eventRequest = {
  getList: (params: EventGetListQuery) =>
    http.get<PaginatedData<Event>>(ENDPOINT_CLIENT.EVENTS, { query: params, skipAuth: true }),
  getById: (id: string) => http.get<Event>(ENDPOINT_CLIENT.EVENT_DETAIL(id), { skipAuth: true }),
  create: (body: EventCreateBody) => http.post<Event>(ENDPOINT_CLIENT.EVENTS, body),
  update: (id: string, body: EventUpdateBody) => http.put<Partial<Event>>(ENDPOINT_CLIENT.EVENT_DETAIL(id), body),
  updateStatus: (id: string, body: { status: number }) =>
    http.patch<Partial<Event>>(ENDPOINT_CLIENT.EVENT_STATUS(id), body),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.EVENT_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.EVENT_DETAIL(id), {}),
};

export const categoryRequest = {
  getList: (params: CategoryGetListQuery) =>
    http.get<PaginatedData<Category>>(ENDPOINT_CLIENT.CATEGORIES, { query: params, skipAuth: true }),
  getById: (id: string) => http.get<Category>(ENDPOINT_CLIENT.CATEGORY_DETAIL(id), { skipAuth: true }),
  create: (body: CategoryCreateBody) => http.post<Category>(ENDPOINT_CLIENT.CATEGORIES, body),
  update: (id: string, body: CategoryUpdateBody) =>
    http.put<Partial<Category>>(ENDPOINT_CLIENT.CATEGORY_DETAIL(id), body),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.CATEGORY_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.CATEGORY_DETAIL(id), {}),
};

export const organizerRequest = {
  getList: (params: OrganizerGetListQuery) =>
    http.get<PaginatedData<Organizer>>(ENDPOINT_CLIENT.ORGANIZERS, { query: params, skipAuth: true }),
  getById: (id: string) => http.get<Organizer>(ENDPOINT_CLIENT.ORGANIZER_DETAIL(id), { skipAuth: true }),
  create: (body: OrganizerCreateBody) => http.post<Organizer>(ENDPOINT_CLIENT.ORGANIZERS, body),
  update: (id: string, body: OrganizerUpdateBody) =>
    http.put<Partial<Organizer>>(ENDPOINT_CLIENT.ORGANIZER_DETAIL(id), body),
  verify: (id: string) => http.patch<Partial<Organizer>>(ENDPOINT_CLIENT.ORGANIZER_VERIFY(id), {}),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.ORGANIZER_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.ORGANIZER_DETAIL(id), {}),
};

export const eventReviewRequest = {
  getList: (params: EventReviewGetListQuery) =>
    http.get<PaginatedData<EventReview>>(ENDPOINT_CLIENT.EVENT_REVIEWS, { query: params }),
  getById: (id: string) => http.get<EventReview>(ENDPOINT_CLIENT.EVENT_REVIEW_DETAIL(id)),
  create: (body: EventReviewCreateBody) => http.post<EventReview>(ENDPOINT_CLIENT.EVENT_REVIEWS, body),
  update: (id: string, body: EventReviewUpdateBody) =>
    http.put<Partial<EventReview>>(ENDPOINT_CLIENT.EVENT_REVIEW_DETAIL(id), body),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.EVENT_REVIEW_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.EVENT_REVIEW_DETAIL(id), {}),
};

export const favoriteRequest = {
  getList: (params: FavoriteGetListQuery) => http.get<PaginatedData<Favorite>>(ENDPOINT_CLIENT.FAVORITES, { query: params }),
  getById: (id: string) => http.get<Favorite>(ENDPOINT_CLIENT.FAVORITE_DETAIL(id)),
  create: (body: FavoriteCreateBody) => http.post<Favorite>(ENDPOINT_CLIENT.FAVORITES, body),
  delete: (userId: string, eventId: string) => http.delete<null>(ENDPOINT_CLIENT.FAVORITE_DELETE(userId, eventId)),
  softDelete: (userId: string, eventId: string) => http.delete<null>(ENDPOINT_CLIENT.FAVORITE_SOFT_DELETE(userId, eventId)),
  restore: (userId: string, eventId: string) => http.patch<null>(ENDPOINT_CLIENT.FAVORITE_DELETE(userId, eventId), {}),
};

export const interactionRequest = {
  getList: (params: InteractionGetListQuery) =>
    http.get<PaginatedData<Interaction>>(ENDPOINT_CLIENT.INTERACTIONS, { query: params }),
  getById: (id: string) => http.get<Interaction>(ENDPOINT_CLIENT.INTERACTION_DETAIL(id)),
  create: (body: InteractionCreateBody) => http.post<Interaction>(ENDPOINT_CLIENT.INTERACTIONS, body),
  delete: (userId: string, eventId: string, type: number) =>
    http.delete<null>(ENDPOINT_CLIENT.INTERACTION_DELETE(userId, eventId, type)),
  softDelete: (userId: string, eventId: string, type: number) =>
    http.delete<null>(ENDPOINT_CLIENT.INTERACTION_SOFT_DELETE(userId, eventId, type)),
  restore: (userId: string, eventId: string, type: number) =>
    http.patch<null>(ENDPOINT_CLIENT.INTERACTION_DELETE(userId, eventId, type), {}),
};
