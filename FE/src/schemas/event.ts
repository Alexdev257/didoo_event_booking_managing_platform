import { z } from "zod";
import { EventStatus } from "@/utils/enum";
import { CategoryStatus } from "@/utils/enum";
import { OrganizerStatus } from "@/utils/enum";
export const tagSchema = z.object({
    Name: z.string().min(1, "Tên tag là bắt buộc"),
});

export const locationSchema = z.object({
    Id: z.string().optional(),
    Name: z.string().optional().or(z.literal("")),
    Address: z.string().min(1, "Địa chỉ là bắt buộc"),
    Province: z.string().optional().or(z.literal("")),
    District: z.string().optional().or(z.literal("")),
    Ward: z.string().optional().or(z.literal("")),
    Zipcode: z.union([z.string().min(1), z.literal("")]).optional(),
    Latitude: z.number().nullable().optional(),
    Longitude: z.number().nullable().optional(),
    ContactEmail: z.union([z.string().email("Email không hợp lệ"), z.literal("")]).optional(),
    ContactPhone: z.union([
        z.string().min(10, "Số điện thoại phải có ít nhất 10 số").regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
        z.literal(""),
    ]).optional(),
});

export const eventCreateSchema = z.object({
    Name: z.string().min(1, "Tên sự kiện là bắt buộc"),
    Slug: z.string().min(1, "Slug là bắt buộc"),
    Subtitle: z.string().optional().or(z.literal("")),
    Description: z.string().min(1, "Mô tả là bắt buộc"),
    Tags: z.array(tagSchema).optional(),
    StartTime: z.coerce.date({ message: "Thời gian bắt đầu không hợp lệ" }),
    EndTime: z.coerce.date({ message: "Thời gian kết thúc không hợp lệ" }),
    OpenTime: z.string().optional().or(z.literal("")), // format "HH:mm"
    ClosedTime: z.string().optional().or(z.literal("")),
    ThumbnailUrl: z.string().url("Link ảnh không hợp lệ").optional().or(z.literal("")),
    BannerUrl: z.string().url("Link banner không hợp lệ").optional().or(z.literal("")),
    TicketMapUrl: z.string().url("Link map vé không hợp lệ").optional().or(z.literal("")),
    AgeRestriction: z.number().int().min(0).default(0),
    CategoryId: z.string().min(1, "Danh mục là bắt buộc"),
    OrganizerId: z.string().min(1, "OrganizerId là bắt buộc"),
    Locations: z.array(locationSchema).min(1, "Phải có ít nhất một địa điểm"),
});

export const eventUpdateSchema = z.object({
    Name: z.string().min(1).optional(),
    Slug: z.string().min(1).optional(),
    Subtitle: z.string().optional().or(z.literal("")),
    Description: z.string().min(1).optional(),
    Tags: z.array(tagSchema).optional(),
    StartTime: z.coerce.date().optional(),
    EndTime: z.coerce.date().optional(),
    OpenTime: z.string().optional().or(z.literal("")),
    ClosedTime: z.string().optional().or(z.literal("")),
    Status: z.nativeEnum(EventStatus).optional(),
    ThumbnailUrl: z.string().url().optional().or(z.literal("")),
    BannerUrl: z.string().url().optional().or(z.literal("")),
    TicketMapUrl: z.string().url().optional().or(z.literal("")),
    AgeRestriction: z.number().int().min(0).optional(),
    CategoryId: z.string().min(1).optional(),
    OrganizerId: z.string().min(1).optional(),
    Locations: z.array(locationSchema).optional(),
});



export const categoryCreateSchema = z.object({
    Name: z.string().min(1, "Tên danh mục là bắt buộc"),
    Slug: z.string().min(1, "Slug là bắt buộc"),
    Description: z.string().optional().or(z.literal("")),
    IconUrl: z.string().url("Link icon không hợp lệ").optional().or(z.literal("")),
    Status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE),
    ParentCategoryId: z.string().nullable().optional(),
});

export const categoryUpdateSchema = z.object({
    Name: z.string().min(1).optional(),
    Slug: z.string().optional(),
    Description: z.string().optional(),
    IconUrl: z.string().url().optional().or(z.literal("")),
    Status: z.nativeEnum(CategoryStatus).optional(),
    ParentCategoryId: z.string().nullable().optional(),
});


export type CategoryCreateBody = z.input<typeof categoryCreateSchema>;
export type CategoryUpdateBody = z.input<typeof categoryUpdateSchema>;





export type EventCreateBody = z.input<typeof eventCreateSchema>;
export type EventUpdateBody = z.input<typeof eventUpdateSchema>;




/** Match BE InteractionCreateCommand - type 1=View 2=Heart 3=Save */
export const interactionCreateSchema = z.object({
    type: z.number().int().min(1).max(3),
    eventId: z.string().uuid(),
    userId: z.string().uuid(),
});

export type InteractionCreateBody = z.input<typeof interactionCreateSchema>;


export const eventReviewCreateSchema = z.object({
    EventId: z.string().uuid(),
    UserId: z.string().uuid(),
    Rating: z.number().int().min(1).max(5),
    Comment: z.string().min(1),
    ParentReviewId: z.string().uuid().nullable().optional(),
});

export const eventReviewUpdateSchema = z.object({
    Rating: z.number().int().min(1).max(5).optional(),
    Comment: z.string().min(1).optional(),
    IsDeleted: z.boolean().optional(),
});

export type EventReviewCreateBody = z.input<typeof eventReviewCreateSchema>;
export type EventReviewUpdateBody = z.input<typeof eventReviewUpdateSchema>;




/** Match BE FavoriteCreateCommand - camelCase */
export const favoriteCreateSchema = z.object({
    userId: z.string().uuid(),
    eventId: z.string().uuid(),
});

export type FavoriteCreateBody = z.input<typeof favoriteCreateSchema>;



/** api.md: status 1=Pending 2=Verified 3=Banned */
export const organizerCreateSchema = z.object({
    Name: z.string().min(1, "Tên tổ chức là bắt buộc"),
    Slug: z.string().min(1, "Slug là bắt buộc"),
    Description: z.string().optional().or(z.literal("")),
    LogoUrl: z.string().url("Link Logo không hợp lệ").optional().or(z.literal("")),
    BannerUrl: z.string().url("Link Banner không hợp lệ").optional().or(z.literal("")),
    Email: z.string().email("Email không hợp lệ"),
    Phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
    WebsiteUrl: z.string().url("Link Website không hợp lệ").optional().or(z.literal("")),
    FacebookUrl: z.string().url("Link Facebook không hợp lệ").optional().or(z.literal("")),
    InstagramUrl: z.string().url("Link Instagram không hợp lệ").optional().or(z.literal("")),
    TiktokUrl: z.string().url("Link TikTok không hợp lệ").optional().or(z.literal("")),
    Address: z.string().optional().or(z.literal("")),
    IsVerified: z.boolean().default(false),
    /** User become organizer: true (gửi email tới admin). Admin tạo: false (không cần) */
    HasSendEmail: z.boolean().optional().default(true),
    UserId: z.string().uuid("User ID không hợp lệ"),
    Status: z.nativeEnum(OrganizerStatus).default(OrganizerStatus.PENDING),
});

export const organizerUpdateSchema = z.object({
    id: z.string().optional(),
    Name: z.string().min(1).optional(),
    Slug: z.string().optional(),
    Description: z.string().optional(),
    LogoUrl: z.string().url().optional().or(z.literal("")),
    BannerUrl: z.string().url().optional().or(z.literal("")),
    Email: z.string().email().optional(),
    Phone: z.string().optional().or(z.literal("")),
    WebsiteUrl: z.string().url().optional().or(z.literal("")),
    FacebookUrl: z.string().url().optional().or(z.literal("")),
    InstagramUrl: z.string().url().optional().or(z.literal("")),
    TiktokUrl: z.string().url().optional().or(z.literal("")),
    Address: z.string().optional().or(z.literal("")),
    HasSendEmail: z.boolean().optional().default(true),
    Status: z.nativeEnum(OrganizerStatus).default(OrganizerStatus.PENDING),
    IsVerified: z.boolean().optional().default(false),
});



export type OrganizerCreateBody = z.input<typeof organizerCreateSchema>;
export type OrganizerUpdateBody = z.input<typeof organizerUpdateSchema>;


