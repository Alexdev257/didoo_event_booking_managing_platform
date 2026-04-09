import { z } from "zod";

export const checkInCreateSchema = z.object({
    UserId: z.string().uuid("User ID không hợp lệ"),
    EventId: z.string().uuid("Event ID không hợp lệ"),
    BookingDetailId: z.string().uuid("Booking Detail ID không hợp lệ"),
    TicketId: z.string().uuid("Ticket ID không hợp lệ").optional().or(z.literal("")),
    CheckInAt: z.string().optional(),
    CheckByUserId: z.string().uuid("Check By User ID không hợp lệ").optional().or(z.literal("")),
});

export const checkInUpdateSchema = z.object({
    UserId: z.string().uuid("User ID không hợp lệ").optional(),
    EventId: z.string().uuid("Event ID không hợp lệ").optional(),
    BookingDetailId: z.string().uuid("Booking Detail ID không hợp lệ").optional(),
    TicketId: z.string().uuid("Ticket ID không hợp lệ").optional().or(z.literal("")),
    CheckByUserId: z.string().uuid("Check By User ID không hợp lệ").optional().or(z.literal("")),
});

export type CheckInCreateBody = z.infer<typeof checkInCreateSchema>;
export type CheckInUpdateBody = z.infer<typeof checkInUpdateSchema>;

export const notificationCreateSchema = z.object({
    UserId: z.string().uuid("User ID không hợp lệ"),
    EventId: z.string().uuid("Event ID không hợp lệ").optional().or(z.literal("")),
    Title: z.string().min(1, "Tiêu đề là bắt buộc"),
    Message: z.string().min(1, "Nội dung là bắt buộc"),
});

export const notificationUpdateSchema = z.object({
    UserId: z.string().uuid("User ID không hợp lệ"),
    EventId: z.string().uuid("Event ID không hợp lệ").optional().or(z.literal("")),
    Title: z.string().min(1, "Tiêu đề là bắt buộc"),
    Message: z.string().min(1, "Nội dung là bắt buộc"),
});

export type NotificationCreateBody = z.infer<typeof notificationCreateSchema>;
export type NotificationUpdateBody = z.infer<typeof notificationUpdateSchema>;
