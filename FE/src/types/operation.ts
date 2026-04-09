import { BasePaginationQuery } from "./base";

export interface CheckInGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    bookingDetailId?: string;
    ticketId?: string;
    checkInAt?: string;
    checkByUserId?: string;
    hasUser?: boolean;
    hasEvent?: boolean;
    hasBooking?: boolean;
    hasTicket?: boolean;
}

export interface CheckInUser {
    id?: string;
    fullName?: string;
    email?: string;
}

export interface CheckInEvent {
    id?: string;
    name?: string;
}

export interface CheckInBookingDetail {
    id?: string;
    bookingId?: string;
    ticketId?: string;
}

export interface CheckInTicket {
    id?: string;
    zone?: string;
}

export interface CheckIn {
    user?: CheckInUser;
    event?: CheckInEvent;
    bookingDetail?: CheckInBookingDetail;
    ticket?: CheckInTicket;
    checkInAt?: string;
    checkByUser?: CheckInUser;
    createdAt?: string;
}


export interface NotificationGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    title?: string;
    message?: string;
    isRead?: boolean;
    hasUser?: boolean;
    hasEvent?: boolean;
}

export interface NotificationUser {
    id?: string;
    fullName?: string;
    email?: string;
}

export interface NotificationEvent {
    id?: string;
    name?: string;
}

export interface Notification {
    id?: string;
    user?: NotificationUser;
    event?: NotificationEvent;
    title?: string;
    message?: string;
    type?: string;
    relatedId?: string | null;
    isRead?: boolean;
    createdAt?: string;
}

export interface ChartDataItem {
    name: string;
    sales: number;
    capacity: number;
    occupancy: number;
}

export interface RecentEventItem {
    id: string;
    name: string;
    startTime?: string;
    status: string;
    revenue: number;
    soldCount: number;
    totalCapacity: number;
    occupancyPercent: number;
}

export interface RevenueTrendItem {
    date: string;
    revenue: number;
    orders: number;
}

export interface OrderStatusBreakdownItem {
    status: string;
    count: number;
    percent: number;
}

export interface AdminOverviewResponse {
    totalUsers: number;
    usersGrowthPercent: number;
    totalOrganizers: number;
    pendingOrganizers: number;
    totalEvents: number;
    activeEvents: number;
    pendingEvents: number;
    totalRevenue: number;
    avgOrderValue: number;
    revenueGrowthPercent: number;
    totalResaleRevenue: number;
    activeListings: number;
    totalListings: number;
    totalResaleTransactions: number;
    revenueTrend: RevenueTrendItem[];
    orderStatusBreakdown: OrderStatusBreakdownItem[];
}

export interface OrganizerOverviewResponse {
    organizerId: string;
    totalRevenue: number;
    revenueGrowthPercent: number;
    ticketsSold: number;
    ticketsSoldGrowthPercent: number;
    occupancyRate: number;
    occupancyGrowthPercent: number;
    openedEventsCount: number;
    upcomingPublishedCount: number;
    chartData: ChartDataItem[];
    recentEvents: RecentEventItem[];
}
