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

/** Redirect path theo role - dùng cho auth */
export const ROLE_REDIRECTS: Record<Roles, string> = {
  [Roles.ADMIN]: "/(main)/(tabs)",
  [Roles.ORGANIZER]: "/(main)/(tabs)",
  [Roles.USER]: "/(main)/(tabs)",
  [Roles.GUEST]: "/(main)/(tabs)",
};

export function getRedirectPathForRole(roleId: string | undefined): string {
  if (!roleId) return "/(main)/(tabs)";
  return ROLE_REDIRECTS[roleId as Roles] ?? "/(main)/(tabs)";
}

export enum Gender {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
}

export enum InteractionType {
  VIEW = 1,
  HEART = 2,
  SAVE = 3,
}

export enum TicketStatus {
  AVAILABLE = 1,
  FULL = 2,
  UNAVAILABLE = 3,
  LOCKED = 4,
}

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

export enum CategoryStatus {
  ACTIVE = 1,
  INACTIVE = 2,
}

export enum BookingStatus {
  PENDING = 1,
  PAID = 2,
  CANCELLED = 3,
}

export enum PaymentMethodStatus {
  ACTIVE = 1,
  INACTIVE = 2,
}
