import { z } from "zod";
import { TicketStatus } from "@/utils/enum";

export const ticketCreateSchema = z.object({
    ticketTypeId: z.string().uuid(),
    eventId: z.string().uuid(),
    zone: z.string().optional(),
    status: z.nativeEnum(TicketStatus).default(TicketStatus.AVAILABLE),
});

export const ticketUpdateSchema = z.object({
    ticketTypeId: z.string().uuid().optional(),
    zone: z.string().optional(),
    status: z.nativeEnum(TicketStatus).optional(),
});



export const TICKET_SALE_TYPES = ["paid", "free"] as const;
export type TicketSaleType = (typeof TICKET_SALE_TYPES)[number];

const ticketTypeRowSchema = z
    .object({
        saleType: z.enum(TICKET_SALE_TYPES, { message: "Chọn loại vé" }),
        name: z.string().min(1, "Tên loại vé là bắt buộc"),
        price: z.number().min(0, "Giá phải >= 0").optional(),
        maxTicketsPerUser: z.union([
            z.number().int().min(1, "Số vé tối đa/người phải >= 1"),
            z.null(),
        ]).optional().nullable(),
        totalQuantity: z.number().int().min(0, "Số lượng phải >= 0"),
        description: z.string().optional(),
        enableMaxTicketsPerUser: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.saleType === "paid") {
            if (data.price == null || data.price < 0) {
                ctx.addIssue({ code: "custom", message: "Vui lòng nhập giá vé", path: ["price"] });
            }
            if (data.enableMaxTicketsPerUser === true) {
                const val = data.maxTicketsPerUser;
                if (val == null || typeof val !== "number" || Number.isNaN(val) || val < 1) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Vui lòng nhập số vé tối đa mỗi người (>= 1)",
                        path: ["maxTicketsPerUser"],
                    });
                }
            }
        }
        if (data.saleType === "free") {
            if (data.maxTicketsPerUser == null || typeof data.maxTicketsPerUser !== "number" || data.maxTicketsPerUser < 1) {
                ctx.addIssue({
                    code: "custom",
                    message: "Vui lòng nhập số vé free tối đa mỗi người",
                    path: ["maxTicketsPerUser"],
                });
            }
        }
    });

export const ticketTypeCreateSchema = z.object({
    eventId: z.uuid(),
    name: z.string().min(1),
    price: z.number().min(0).default(0),
    totalQuantity: z.number().int().min(0),
    availableQuantity: z.number().int().min(0),
    maxTicketsPerUser: z.number().int().min(0).optional().nullable(),
    description: z.string().optional(),
});

/** Schema cho form thêm nhiều loại vé (BE chỉ tạo 1/lần → FE gửi tuần tự) */
export const ticketTypesBatchSchema = z.object({
    items: z.array(ticketTypeRowSchema).min(1, "Thêm ít nhất một loại vé"),
});

const ticketTypeArrayItemSchema = z.object({
    eventId: z.string().uuid(),
    name: z.string().min(1),
    price: z.number().min(0),
    totalQuantity: z.number().int().min(0),
    availableQuantity: z.number().int().min(0),
    maxTicketsPerUser: z.number().int().min(0).optional().nullable(),
    description: z.string().optional(),
});

export const ticketTypeCreateArraySchema = z.object({
    ticketTypes: z.array(ticketTypeArrayItemSchema).min(1, "Thêm ít nhất một loại vé"),
});

const ticketTypeUpdateBaseSchema = z.object({
    saleType: z.enum(TICKET_SALE_TYPES).optional(),
    name: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    maxTicketsPerUser: z.union([
        z.number().int().min(1, "Số vé tối đa/người phải >= 1"),
        z.null(),
    ]).optional().nullable(),
    totalQuantity: z.number().int().min(0).optional(),
    availableQuantity: z.number().int().min(0).optional(),
    description: z.string().optional(),
    enableMaxTicketsPerUser: z.boolean().optional(),
});

export const ticketTypeUpdateSchema = ticketTypeUpdateBaseSchema.superRefine((data, ctx) => {
    if (data.saleType === "paid" && data.enableMaxTicketsPerUser === true) {
        const val = data.maxTicketsPerUser;
        if (val == null || typeof val !== "number" || Number.isNaN(val) || val < 1) {
            ctx.addIssue({
                code: "custom",
                message: "Vui lòng nhập số vé tối đa mỗi người (>= 1)",
                path: ["maxTicketsPerUser"],
            });
        }
    }
});



export type TicketTypeCreateBody = z.input<typeof ticketTypeCreateSchema>;
export type TicketTypeUpdateBody = z.input<typeof ticketTypeUpdateSchema>;
export type TicketTypesBatchBody = z.input<typeof ticketTypesBatchSchema>;
export type TicketTypeCreateArrayBody = z.input<typeof ticketTypeCreateArraySchema>;





export type TicketCreateBody = z.input<typeof ticketCreateSchema>;
export type TicketUpdateBody = z.input<typeof ticketUpdateSchema>;


export const ticketListingCreateSchema = z.object({
    ticketIds: z.array(z.string().uuid()).min(1, "Vui lòng chọn ít nhất 1 vé"),
    sellerUserId: z.string().uuid(),
    askingPrice: z.number().min(0).default(0),
    description: z.string().optional(),
  });
  
  export const ticketListingCancelSchema = z.object({
    SellerUserId: z.string().uuid(),
  });
  
  export const ticketListingMarkSoldSchema = z.object({
    NewOwnerUserId: z.string().uuid(),
  });
  
  export type TicketListingCreateBody = z.input<typeof ticketListingCreateSchema>;
  export type TicketListingCancelBody = z.input<typeof ticketListingCancelSchema>;
  export type TicketListingMarkSoldBody = z.input<typeof ticketListingMarkSoldSchema>;
  



