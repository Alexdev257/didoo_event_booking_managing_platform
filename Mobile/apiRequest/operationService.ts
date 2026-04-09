import api from "@/lib/interceptor";
import { ENDPOINT } from "@/utils/endpoint";
import {
  CheckInGetListQuery,
  CheckIn,
  NotificationGetListQuery,
  Notification,
} from "@/types/operation";
import {
  CheckInCreateBody,
  CheckInUpdateBody,
  NotificationCreateBody,
  NotificationUpdateBody,
} from "@/schemas/operation";
import { PaginatedData } from "@/types/base";

export const checkInRequest = {
  getList: (params?: CheckInGetListQuery) =>
    api.get<{ data: PaginatedData<CheckIn> }>(ENDPOINT.CHECKINS, {
      params: params ?? {},
    }),
  getById: (id: string) =>
    api.get<{ data: CheckIn }>(ENDPOINT.CHECKIN_DETAIL(id)),
  create: (body: CheckInCreateBody) =>
    api.post<{ data: CheckIn }>(ENDPOINT.CHECKINS, body),
  update: (id: string, body: CheckInUpdateBody) =>
    api.put<{ data: Partial<CheckIn> }>(ENDPOINT.CHECKIN_DETAIL(id), body),
  delete: (id: string) => api.delete(ENDPOINT.CHECKIN_DETAIL(id)),
  restore: (id: string) => api.patch(ENDPOINT.CHECKIN_DETAIL(id), {}),
};

export const notificationRequest = {
  getList: (params?: NotificationGetListQuery) =>
    api.get<{ data: PaginatedData<Notification> }>(ENDPOINT.NOTIFICATIONS, {
      params: params ?? {},
    }),
  getMyList: (params?: NotificationGetListQuery) =>
    api.get<{ data: PaginatedData<Notification> }>(ENDPOINT.NOTIFICATIONS_ME, {
      params: params ?? {},
    }),
  getById: (id: string) =>
    api.get<{ data: Notification }>(ENDPOINT.NOTIFICATION_DETAIL(id)),
  create: (body: NotificationCreateBody) =>
    api.post<{ data: Notification }>(ENDPOINT.NOTIFICATIONS, body),
  update: (id: string, body: NotificationUpdateBody) =>
    api.put<{ data: Partial<Notification> }>(
      ENDPOINT.NOTIFICATION_DETAIL(id),
      body
    ),
  markAsRead: (id: string) =>
    api.patch<{ data: Partial<Notification> }>(
      ENDPOINT.NOTIFICATION_MARK_READ(id),
      {}
    ),
  delete: (id: string) => api.delete(ENDPOINT.NOTIFICATION_DETAIL(id)),
  restore: (id: string) => api.patch(ENDPOINT.NOTIFICATION_DETAIL(id), {}),
};
