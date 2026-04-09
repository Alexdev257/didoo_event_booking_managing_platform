import http from "@/lib/http";
import { ENDPOINT_CLIENT } from "@/utils/endpoint";
import { CheckInGetListQuery, CheckIn, NotificationGetListQuery, Notification } from "@/types/operation";
import { CheckInCreateBody, CheckInUpdateBody, NotificationCreateBody, NotificationUpdateBody } from "@/schemas/operation";
import { PaginatedData, ResponseData } from "@/types/base";
import { AdminOverviewResponse, OrganizerOverviewResponse } from "@/types/operation";

/** BE OperationService trả data là mảng phẳng, FE expect data.items. Normalize để tương thích. */
async function getNotificationList(
  url: string,
  params?: NotificationGetListQuery
): Promise<ResponseData<PaginatedData<Notification>>> {
  const res = await http.get<PaginatedData<Notification> | Notification[]>(url, { query: params || {} });
  const rawData = res.data;
  if (!rawData) {
    return { ...res, data: { totalItems: 0, pageNumber: 1, pageSize: 10, totalPages: 0, items: [] } };
  }
  if (Array.isArray(rawData)) {
    return {
      ...res,
      data: {
        totalItems: rawData.length,
        pageNumber: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 10,
        totalPages: Math.ceil(rawData.length / (params?.pageSize ?? 10)) || 1,
        items: rawData as Notification[],
      },
    };
  }
  return res as ResponseData<PaginatedData<Notification>>;
}

export const checkInRequest = {
  getList: (params?: CheckInGetListQuery) =>
    http.get<PaginatedData<CheckIn>>(ENDPOINT_CLIENT.CHECKINS, { query: params || {} }),
  getById: (id: string) => http.get<CheckIn>(ENDPOINT_CLIENT.CHECKIN_DETAIL(id)),
  create: (body: CheckInCreateBody) => http.post<CheckIn>(ENDPOINT_CLIENT.CHECKINS, body),
  update: (id: string, body: CheckInUpdateBody) => http.put<Partial<CheckIn>>(ENDPOINT_CLIENT.CHECKIN_DETAIL(id), body),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.CHECKIN_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.CHECKIN_DETAIL(id), {}),
};

export const notificationRequest = {
  getList: (params?: NotificationGetListQuery) =>
    getNotificationList(ENDPOINT_CLIENT.NOTIFICATIONS, params),
  getMyList: (params?: NotificationGetListQuery) =>
    getNotificationList(ENDPOINT_CLIENT.NOTIFICATIONS_ME, params),
  getById: (id: string) => http.get<Notification>(ENDPOINT_CLIENT.NOTIFICATION_DETAIL(id)),
  create: (body: NotificationCreateBody) => http.post<Notification>(ENDPOINT_CLIENT.NOTIFICATIONS, body),
  update: (id: string, body: NotificationUpdateBody) =>
    http.put<Partial<Notification>>(ENDPOINT_CLIENT.NOTIFICATION_DETAIL(id), body),
  markAsRead: (id: string) => http.patch<Partial<Notification>>(ENDPOINT_CLIENT.NOTIFICATION_MARK_READ(id), {}),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.NOTIFICATION_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.NOTIFICATION_DETAIL(id), {}),
};

export const analyticsRequest = {
  getAdminOverview: (params?: { fromDate?: string; toDate?: string; period?: string }) =>
    http.get<AdminOverviewResponse>(ENDPOINT_CLIENT.ANALYTICS_ADMIN_OVERVIEW, { query: params }),
  getOrganizerOverview: (params?: { organizerId?: string; period?: string }) =>
    http.get<OrganizerOverviewResponse>(ENDPOINT_CLIENT.ANALYTICS_ORGANIZER_OVERVIEW, { query: params }),
};
