import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  checkInRequest,
  notificationRequest,
} from "@/apiRequest/operationService";
import { KEY, QUERY_KEY } from "@/utils/constant";
import { handleErrorApi } from "@/lib/errors";
import {
  CheckInGetListQuery,
  NotificationGetListQuery,
} from "@/types/operation";
import {
  CheckInCreateBody,
  CheckInUpdateBody,
  NotificationCreateBody,
  NotificationUpdateBody,
} from "@/schemas/operation";

export const useGetCheckIns = (
  params?: CheckInGetListQuery,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: QUERY_KEY.checkIns.list(params),
    queryFn: () => checkInRequest.getList(params || {}).then((r) => r.data),
    enabled: options?.enabled ?? true,
  });

export const useGetCheckIn = (
  id: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: QUERY_KEY.checkIns.detail(id),
    queryFn: () => checkInRequest.getById(id).then((r) => r.data),
    enabled: (options?.enabled ?? true) && !!id,
  });

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: CheckInCreateBody) =>
      (await checkInRequest.create(body)).data.data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.checkIns }),
  });
  const update = useMutation({
    mutationFn: async ({
      id,
      body,
    }: { id: string; body: CheckInUpdateBody }) =>
      (await checkInRequest.update(id, body)).data.data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.checkIns }),
  });
  const deleteCheckIn = useMutation({
    mutationFn: async (id: string) =>
      (await checkInRequest.delete(id)).data.message,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.checkIns }),
    onError: (error) => handleErrorApi({ error }),
  });
  const restore = useMutation({
    mutationFn: async (id: string) =>
      (await checkInRequest.restore(id)).data.message,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.checkIns }),
    onError: (error) => handleErrorApi({ error }),
  });
  return { create, update, deleteCheckIn, restore };
};

export const useGetNotifications = (
  params?: NotificationGetListQuery,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: QUERY_KEY.notifications.list(params),
    queryFn: () =>
      notificationRequest.getList(params || {}).then((r) => r.data),
    enabled: options?.enabled ?? true,
  });

export const useGetMyNotifications = (
  params?: Omit<NotificationGetListQuery, "userId">,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: [...KEY.notifications, "me", params] as const,
    queryFn: () =>
      notificationRequest.getMyList(params || {}).then((r) => r.data),
    enabled: options?.enabled ?? true,
  });

export const useGetNotification = (
  id: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: QUERY_KEY.notifications.detail(id),
    queryFn: () => notificationRequest.getById(id).then((r) => r.data),
    enabled: (options?.enabled ?? true) && !!id,
  });

export const useNotification = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: NotificationCreateBody) =>
      (await notificationRequest.create(body)).data.data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.notifications }),
  });
  const update = useMutation({
    mutationFn: async ({
      id,
      body,
    }: { id: string; body: NotificationUpdateBody }) =>
      (await notificationRequest.update(id, body)).data.data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.notifications }),
  });
  const markAsRead = useMutation({
    mutationFn: async (id: string) =>
      (await notificationRequest.markAsRead(id)).data.data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.notifications }),
  });
  const deleteNotification = useMutation({
    mutationFn: async (id: string) =>
      (await notificationRequest.delete(id)).data.message,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.notifications }),
    onError: (error) => handleErrorApi({ error }),
  });
  const restore = useMutation({
    mutationFn: async (id: string) =>
      (await notificationRequest.restore(id)).data.message,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KEY.notifications }),
    onError: (error) => handleErrorApi({ error }),
  });
  return {
    create,
    update,
    markAsRead,
    deleteNotification,
    restore,
  };
};
