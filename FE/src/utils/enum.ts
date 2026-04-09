export enum HttpErrorCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Roles {
    ADMIN = "1",
    ORGANIZER = "3",
    USER = "2",
    GUEST = "4",
}

/** Redirect path theo role - dùng cho auth layout và useAuth */
export const ROLE_REDIRECTS: Record<Roles, string> = {
    [Roles.ADMIN]: "/admin/dashboard",
    [Roles.ORGANIZER]: "/organizer/dashboard",
    [Roles.USER]: "/home",
    [Roles.GUEST]: "/home",
};

export function getRedirectPathForRole(roleId: string | undefined): string {
    if (!roleId) return "/home";
    return ROLE_REDIRECTS[roleId as Roles] ?? "/home";
}

export enum Gender {
    MALE = 0,
    FEMALE = 1,
    OTHER = 2,
}

/** api.md: 1=View, 2=Heart, 3=Save */
export enum InteractionType {
    VIEW = 1,
    HEART = 2,
    SAVE = 3,
}

/** api.md: 1=Available, 2=Full, 3=Unavailable, 4=Locked */
export enum TicketStatus {
    AVAILABLE = 1,
    FULL = 2,
    UNAVAILABLE = 3,
    LOCKED = 4,
}

/** api.md: 1=Draft, 2=Published, 3=Cancelled, 4=Opened, 5=Closed */
export enum EventStatus {
    DRAFT = 1,
    PUBLISHED = 2,
    CANCELLED = 3,
    OPENED = 4,
    CLOSED = 5,
}

export enum BookingTypeStatus {
    NORMAL = 1,
    TRADE_PURCHASE = 2,
}
/** api.md: 1=Pending, 2=Verified, 3=Banned */
export enum OrganizerStatus {
    PENDING = 1,
    VERIFIED = 2,
    BANNED = 3,
}


export enum TicketListingStatus {
    ACTIVE = 1,
    PENDING = 2,
    SOLD = 3,
    CANCELLED = 4,
}
/** api.md: 1=Active, 2=Inactive */
export enum CategoryStatus {
    ACTIVE = 1,
    INACTIVE = 2,
}

/** api.md: Booking status - query param */
export enum BookingStatus {
    PENDING = 1,
    PAID = 2,
    CANCELLED = 3,
}

/** api.md: Payment method status - query param */
export enum PaymentMethodStatus {
    ACTIVE = 1,
    INACTIVE = 2,
}