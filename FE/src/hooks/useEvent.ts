import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventRequest, categoryRequest, organizerRequest, eventReviewRequest, favoriteRequest, interactionRequest } from "@/apiRequest/eventService";
import { KEY, QUERY_KEY } from "@/utils/constant";
import { EventStatus } from "@/utils/enum";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/errors";
import { useMemo } from "react";
import { EventGetListQuery, Event, CategoryGetListQuery, Category, OrganizerGetListQuery, Organizer, EventReviewGetListQuery, EventReview, FavoriteGetListQuery, Favorite, InteractionGetListQuery, Interaction } from "@/types/event";
import { EventCreateBody, EventUpdateBody, CategoryCreateBody, CategoryUpdateBody, OrganizerCreateBody, OrganizerUpdateBody, EventReviewCreateBody, EventReviewUpdateBody, FavoriteCreateBody, InteractionCreateBody } from "@/schemas/event";

export const useGetEvents = (params?: EventGetListQuery, enabled = true) => useQuery({
    queryKey: QUERY_KEY.events.list(params),
    queryFn: () => eventRequest.getList(params || {}),
    enabled,
});

export const useGetEvent = (id: string) => useQuery({
    queryKey: QUERY_KEY.events.detail(id),
    queryFn: () => eventRequest.getById(id),
    enabled: !!id,
});

export const useEvent = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: EventCreateBody) => (await eventRequest.create(body)).data,
        onSuccess: () => {
            toast.success("Event created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.events });
        },
    });
    const update = useMutation({
        mutationFn: async ({ id, body }: { id: string; body: EventUpdateBody }) => (await eventRequest.update(id, body)).data,
        onSuccess: (_, variables) => {
            toast.success("Event updated successfully");
            queryClient.invalidateQueries({ queryKey: KEY.events });
            if (variables.id) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.events.detail(variables.id) });
            }
        },
    });
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: EventStatus }) => (await eventRequest.updateStatus(id, { status })).data,
        onSuccess: (_, variables) => {
            if (variables.status === EventStatus.PUBLISHED) toast.success("Đã duyệt và xuất bản sự kiện thành công");
            else if (variables.status === EventStatus.DRAFT) toast.success("Đã từ chối sự kiện");
            else toast.success("Cập nhật trạng thái sự kiện thành công");
            queryClient.invalidateQueries({ queryKey: KEY.events });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const deleteEvent = useMutation({
        mutationFn: async (id: string) => (await eventRequest.delete(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.events });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async (id: string) => (await eventRequest.restore(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.events });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    return { create, update, updateStatus, deleteEvent, restore };
};

export const useGetCategories = (params?: CategoryGetListQuery) => useQuery({
    queryKey: QUERY_KEY.categories.list(params),
    queryFn: () => categoryRequest.getList(params || {}),
    enabled: !!params,
});

export const useGetCategory = (id: string) => useQuery({
    queryKey: QUERY_KEY.categories.detail(id),
    queryFn: () => categoryRequest.getById(id),
    enabled: !!id,
});

export const useCategory = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: CategoryCreateBody) => (await categoryRequest.create(body)).data,
        onSuccess: () => {
            toast.success("Category created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.categories });
        },
    });
    const update = useMutation({
        mutationFn: async ({ id, body }: { id: string; body: CategoryUpdateBody }) => (await categoryRequest.update(id, body)).data,
        onSuccess: () => {
            toast.success("Category updated successfully");
            queryClient.invalidateQueries({ queryKey: KEY.categories });
        },
    });
    const deleteCategory = useMutation({
        mutationFn: async (id: string) => (await categoryRequest.delete(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.categories });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async (id: string) => (await categoryRequest.restore(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.categories });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    return { create, update, deleteCategory, restore };
};

export const useGetOrganizers = (params?: OrganizerGetListQuery) => useQuery({
    queryKey: QUERY_KEY.organizers.list(params),
    queryFn: () => organizerRequest.getList(params || {}),
});

export const useGetOrganizer = (id: string) => useQuery({
    queryKey: QUERY_KEY.organizers.detail(id),
    queryFn: () => organizerRequest.getById(id),
    enabled: !!id,
});

export const useOrganizer = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: OrganizerCreateBody) => (await organizerRequest.create(body)).data,
        onSuccess: async () => {
            toast.success("Organizer created successfully");
            // Thứ tự: user detail trước (có organizerId), rồi mới organizer detail
            await queryClient.invalidateQueries({ queryKey: KEY.users });
            await queryClient.refetchQueries({ queryKey: KEY.users });
            await queryClient.invalidateQueries({ queryKey: KEY.organizers });
            await queryClient.refetchQueries({ queryKey: KEY.organizers });
        },
    });
    const update = useMutation({
        mutationFn: async ({ id, body }: { id: string; body: OrganizerUpdateBody }) => (await organizerRequest.update(id, body)).data,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY.organizers }),
    });
    const verify = useMutation({
        mutationFn: async (id: string) => (await organizerRequest.verify(id)).data,
        onSuccess: () => {
            toast.success("Đã xác minh organizer thành công");
            queryClient.invalidateQueries({ queryKey: KEY.organizers });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const deleteOrganizer = useMutation({
        mutationFn: async (id: string) => (await organizerRequest.delete(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.organizers });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async (id: string) => (await organizerRequest.restore(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.organizers });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    return { create, update, verify, deleteOrganizer, restore };
};

export const useGetEventReviews = (params?: EventReviewGetListQuery) => useQuery({
    queryKey: QUERY_KEY.eventReviews.list(params),
    queryFn: () => eventReviewRequest.getList(params || {}),
});
export const useGetEventReview = (id: string) => useQuery({
    queryKey: QUERY_KEY.eventReviews.detail(id),
    queryFn: () => eventReviewRequest.getById(id),
    enabled: !!id,
});
export const useEventReview = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: EventReviewCreateBody) => (await eventReviewRequest.create(body)).data,
        onSuccess: () => {
            toast.success("Event review created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.eventReviews });
        },
    });
    const update = useMutation({
        mutationFn: async ({ id, body }: { id: string; body: EventReviewUpdateBody }) => (await eventReviewRequest.update(id, body)).data,
        onSuccess: () => {
            toast.success("Event review updated successfully");
            queryClient.invalidateQueries({ queryKey: KEY.eventReviews });
        },
    });
    const deleteReview = useMutation({
        mutationFn: async (id: string) => (await eventReviewRequest.delete(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.eventReviews });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async (id: string) => (await eventReviewRequest.restore(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.eventReviews });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    return { create, update, deleteReview, restore };
};

export const useGetFavorites = (params?: FavoriteGetListQuery) => useQuery({
    queryKey: QUERY_KEY.favorites.list(params),
    queryFn: () => favoriteRequest.getList(params || {}),
});
export const useGetFavorite = (id: string) => useQuery({
    queryKey: QUERY_KEY.favorites.detail(id),
    queryFn: () => favoriteRequest.getById(id),
    enabled: !!id,
});
export const useFavorite = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: FavoriteCreateBody) => (await favoriteRequest.create(body)).data,
        onSuccess: () => {
            toast.success("Favorite created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.favorites });
        },
    });
    const remove = useMutation({
        mutationFn: async ({ userId, eventId }: { userId: string; eventId: string }) => (await favoriteRequest.delete(userId, eventId)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.favorites });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const softRemove = useMutation({
        mutationFn: async ({ userId, eventId }: { userId: string; eventId: string }) => (await favoriteRequest.softDelete(userId, eventId)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.favorites });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async ({ userId, eventId }: { userId: string; eventId: string }) => (await favoriteRequest.restore(userId, eventId)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.favorites });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    return { create, remove, softRemove, restore };
};

export const useGetInteractions = (params?: InteractionGetListQuery) => useQuery({
    queryKey: QUERY_KEY.interactions.list(params),
    queryFn: () => interactionRequest.getList(params || {}),
});
export const useGetInteraction = (id: string) => useQuery({
    queryKey: QUERY_KEY.interactions.detail(id),
    queryFn: () => interactionRequest.getById(id),
    enabled: !!id,
});
export const useInteraction = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: InteractionCreateBody) => (await interactionRequest.create(body)).data,
        onSuccess: () => {
            toast.success("Interaction created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.interactions });
        },
    });
    const remove = useMutation({
        mutationFn: async ({ userId, eventId, type }: { userId: string; eventId: string; type: number }) =>
            (await interactionRequest.delete(userId, eventId, type)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.interactions });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const softRemove = useMutation({
        mutationFn: async ({ userId, eventId, type }: { userId: string; eventId: string; type: number }) =>
            (await interactionRequest.softDelete(userId, eventId, type)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.interactions });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async ({ userId, eventId, type }: { userId: string; eventId: string; type: number }) =>
            (await interactionRequest.restore(userId, eventId, type)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.interactions });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    return { create, remove, softRemove, restore };
};

type TrendDirection = "up" | "down" | "neutral";
type OrganizerDashboardStat = { title: string; value: string; change: string; trend: TrendDirection; icon: string; description: string };
type OrganizerChartPoint = { name: string; sales: number; capacity: number; occupancy: number };
type EventRevenueFields = Event & { revenue?: number; totalRevenue?: number; grossRevenue?: number };

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
const toDateKey = (date: Date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const formatCurrency = (value: number) => `${formatNumber(Math.round(value))} VNĐ`;
const getTrend = (current: number, previous: number): { change: string; trend: TrendDirection } => {
    if (current === 0 && previous === 0) return { change: "0%", trend: "neutral" };
    if (previous === 0) return { change: "+100%", trend: "up" };
    const delta = ((current - previous) / Math.abs(previous)) * 100;
    const roundedDelta = Math.abs(delta) < 0.05 ? 0 : Number(delta.toFixed(1));
    if (roundedDelta === 0) return { change: "0%", trend: "neutral" };
    return { change: `${roundedDelta > 0 ? "+" : ""}${roundedDelta}%`, trend: roundedDelta > 0 ? "up" : "down" };
};
const getEventRevenue = (event: Event) => {
    const revenueSource = event as EventRevenueFields;
    return toNumber(revenueSource.revenue ?? revenueSource.totalRevenue ?? revenueSource.grossRevenue ?? 0);
};
const isActiveEvent = (event: Event, now: Date) => {
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.CLOSED) return false;
    const endTime = new Date(event.endTime || event.startTime);
    return (event.status === EventStatus.OPENED || event.status === EventStatus.PUBLISHED) && endTime >= now;
};

export const useOrganizerStats = (organizerId?: string) => {
    const { data: eventsRes, isLoading } = useGetEvents({ organizerId, pageSize: 200 }, Boolean(organizerId));
    const { stats, chartData, events } = useMemo(() => {
        if (!organizerId) return { stats: [] as OrganizerDashboardStat[], chartData: [] as OrganizerChartPoint[], events: [] as Event[] };
        const eventItems = (eventsRes?.data?.items || []) as Event[];
        const now = new Date();
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - 29);
        currentPeriodStart.setHours(0, 0, 0, 0);
        const previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(currentPeriodStart.getDate() - 30);
        previousPeriodStart.setHours(0, 0, 0, 0);
        const previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setMilliseconds(-1);
        const totals = { sold: 0, capacity: 0, revenue: 0, active: 0 };
        const currentPeriod = { sold: 0, capacity: 0, revenue: 0, active: 0 };
        const previousPeriod = { sold: 0, capacity: 0, revenue: 0, active: 0 };
        for (const event of eventItems) {
            const sold = toNumber(5050);
            const capacity = toNumber(100);
            const revenue = getEventRevenue(event);
            const startTime = new Date(event.startTime);
            totals.sold += sold;
            totals.capacity += capacity;
            totals.revenue += revenue;
            if (isActiveEvent(event, now)) totals.active += 1;
            if (startTime >= currentPeriodStart && startTime <= now) {
                currentPeriod.sold += sold;
                currentPeriod.capacity += capacity;
                currentPeriod.revenue += revenue;
                if (isActiveEvent(event, now)) currentPeriod.active += 1;
            } else if (startTime >= previousPeriodStart && startTime <= previousPeriodEnd) {
                previousPeriod.sold += sold;
                previousPeriod.capacity += capacity;
                previousPeriod.revenue += revenue;
                if (isActiveEvent(event, now)) previousPeriod.active += 1;
            }
        }
        const totalOccupancy = totals.capacity > 0 ? (totals.sold / totals.capacity) * 100 : 0;
        const currentOccupancy = currentPeriod.capacity > 0 ? (currentPeriod.sold / currentPeriod.capacity) * 100 : 0;
        const previousOccupancy = previousPeriod.capacity > 0 ? (previousPeriod.sold / previousPeriod.capacity) * 100 : 0;
        const soldTrend = getTrend(currentPeriod.sold, previousPeriod.sold);
        const occupancyTrend = getTrend(currentOccupancy, previousOccupancy);
        const activeTrend = getTrend(currentPeriod.active, previousPeriod.active);
        const revenueTrend = getTrend(currentPeriod.revenue, previousPeriod.revenue);
        const statCards: OrganizerDashboardStat[] = [
            { title: "Vé đã bán", value: formatNumber(totals.sold), change: soldTrend.change, trend: soldTrend.trend, icon: "Ticket", description: "Tổng vé đã bán từ tất cả sự kiện" },
            { title: "Tỉ lệ lấp đầy", value: `${totalOccupancy.toFixed(1)}%`, change: occupancyTrend.change, trend: occupancyTrend.trend, icon: "Users", description: `${formatNumber(totals.sold)} / ${formatNumber(totals.capacity)} vé` },
            { title: "Sự kiện đang mở", value: formatNumber(totals.active), change: activeTrend.change, trend: activeTrend.trend, icon: "Calendar", description: `${formatNumber(eventItems.length)} sự kiện trong hệ thống` },
            { title: "Doanh thu ước tính", value: formatCurrency(totals.revenue), change: revenueTrend.change, trend: revenueTrend.trend, icon: "Wallet", description: "Tổng doanh thu nhận từ dữ liệu API" },
        ];
        const weekdayFormatter = new Intl.DateTimeFormat("vi-VN", { weekday: "short" });
        const sevenDayPoints: OrganizerChartPoint[] = [];
        const chartMap = new Map<string, OrganizerChartPoint>();
        for (let index = 6; index >= 0; index--) {
            const day = new Date(now);
            day.setDate(now.getDate() - index);
            day.setHours(0, 0, 0, 0);
            const point: OrganizerChartPoint = { name: weekdayFormatter.format(day).replace(/\./g, ""), sales: 0, capacity: 0, occupancy: 0 };
            chartMap.set(toDateKey(day), point);
            sevenDayPoints.push(point);
        }
        for (const event of eventItems) {
            const dayPoint = chartMap.get(toDateKey(new Date(event.startTime)));
            if (!dayPoint) continue;
            dayPoint.sales += toNumber(50);
            dayPoint.capacity += toNumber(100);
        }
        for (const point of sevenDayPoints) {
            point.occupancy = point.capacity > 0 ? Number(((point.sales / point.capacity) * 100).toFixed(1)) : 0;
        }
        return { stats: statCards, chartData: sevenDayPoints, events: eventItems };
    }, [eventsRes, organizerId]);
    return { stats, chartData, events, isLoading };
};

