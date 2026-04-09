import { CategoryStatus, EventStatus, InteractionType, OrganizerStatus } from "@/utils/enum";
import { BasePaginationQuery } from "./base";
import { TicketType } from "./ticket";

/** Khoảng thời gian sự kiện - gộp startTime và endTime */
export interface EventDateRange {
    startTime?: string;
    endTime?: string;
}

/** Match BE EventGetListQuery */
export interface EventGetListQuery extends BasePaginationQuery {
    name?: string;
    slug?: string;
    subtitle?: string;
    description?: string;
    tags?: string;
    /** Gộp: ngày bắt đầu và kết thúc */
    startTime?: string;
    endTime?: string;
    openTime?: string;
    closedTime?: string;
    status?: EventStatus;
    categoryId?: string;
    organizerId?: string;
    ageRestriction?: number;
    /** Resale: filter theo khoảng giá (nếu BE hỗ trợ) */
    fromPrice?: number;
    toPrice?: number;
    latitude?: number;
    longitude?: number;
    distance?: number;
    hasCategory?: boolean;
    hasOrganizer?: boolean;
    hasLocations?: boolean;
    hasTicketTypes?: boolean;
}

export interface EventTag {
    tagName: string;
}

/** Match BE EventEventLocationDTO */
export interface EventLocation {
    id?: string;
    name?: string;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
    zipcode?: string;
    latitude?: number;
    longitude?: number;
    contactEmail?: string;
    contactPhone?: string;
}

/** Match BE EventDTO */
export interface Event {
    id: string;
    name: string;
    slug: string;
    subtitle?: string;
    description: string;
    tags?: EventTag[];
    startTime: string;
    endTime: string;
    openTime?: string;
    closedTime?: string;
    status: EventStatus;
    thumbnailUrl?: string;
    bannerUrl?: string;
    ticketMapUrl?: string;
    ageRestriction: number;
    category?: Category;
    organizer?: Organizer;
    locations?: EventLocation[];
    ticketTypes?: TicketType[];

}


/** Match BE EventReviewGetListQuery */
export interface EventReviewGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    rating?: number;
}

/** Match BE EventReviewDTO - user, event nested */
export interface EventReviewUser {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    gender?: number;
}

export interface EventReviewEvent {
    id: string;
    name?: string;
    slug?: string;
    subtitle?: string;
    description?: string;
}

export interface EventReview {
    id: string;
    user: EventReviewUser;
    event: EventReviewEvent;
    rating: number;
    comment: string;
    reasonDeleted?: string;
    parentReview?: EventReview | null;
    replies?: EventReview[];
}

export interface InteractionGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    type?: InteractionType;
}

/** Match BE InteractionDTO - user, event nested */
export interface InteractionUser {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    gender?: number;
}

export interface InteractionEvent {
    id: string;
    name?: string;
    slug?: string;
    subtitle?: string;
    description?: string;
}

export interface Interaction {
    id: string;
    type: InteractionType;
    user: InteractionUser;
    event: InteractionEvent;
}

export interface CategoryGetListQuery extends BasePaginationQuery {
    name?: string;
    status?: CategoryStatus;
}

/** Match BE CategoryDTO */
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    status: CategoryStatus;
    parentCategory?: Category | null;
    subCategories?: Category[];
    isDeleted?: boolean;
}


/** Match BE EventReviewGetListQuery */
export interface EventReviewGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
    rating?: number;
}

/** Match BE EventReviewDTO - user, event nested */
export interface EventReviewUser {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    gender?: number;
}

export interface EventReviewEvent {
    id: string;
    name?: string;
    slug?: string;
    subtitle?: string;
    description?: string;
}

export interface EventReview {
    id: string;
    user: EventReviewUser;
    event: EventReviewEvent;
    rating: number;
    comment: string;
    reasonDeleted?: string;
    parentReview?: EventReview | null;
    replies?: EventReview[];
}

/** Match BE FavoriteGetListQuery */
export interface FavoriteGetListQuery extends BasePaginationQuery {
    userId?: string;
    eventId?: string;
}

/** Match BE FavoriteDTO - user, event nested */
export interface FavoriteUser {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    gender?: number;
}

export interface FavoriteEvent {
    id: string;
    name?: string;
    slug?: string;
    subtitle?: string;
    description?: string;
}

export interface Favorite {
    id: string;
    user: FavoriteUser;
    event: FavoriteEvent;
}


export interface OrganizerGetListQuery extends BasePaginationQuery {
    name?: string;
    slug?: string;
    status?: OrganizerStatus;
}

/** Match BE OrganizerDTO */
export interface Organizer {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    email: string;
    phone?: string;
    websiteUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    address?: string;
    isVerified: boolean;
    status: OrganizerStatus;
    createdAt?: string;
    updatedAt?: string;
    events?: Partial<Event>[];
}
