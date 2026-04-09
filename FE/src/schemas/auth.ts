import { z } from "zod";

export const locationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.email("Email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu là bắt buộc"),
    location: locationSchema,
});

export const loginGoogleSchema = z.object({
    GoogleToken: z.string(),
    Location: locationSchema,
});

export const registerSchema = z.object({
    fullName: z.string().min(1, "Họ tên là bắt buộc"),
    email: z.email("Email không hợp lệ"),
    phone: z.string().optional(),
    password: z.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    avatarUrl: z.string(),
    gender: z.number().int().min(0).max(2).default(0),
    dateOfBirth: z.coerce.date({
        message: "Vui lòng chọn ngày sinh",
    }),
    address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export const verifyRegisterSchema = z.object({
    email: z.email("Email không hợp lệ"),
    otp: z.string().length(6, "OTP phải có 6 ký tự"),
});

export const forgotPasswordSchema = z.object({
    email: z.email("Email không hợp lệ"),
    clientUri: z.string().optional(),
});

export const verifyForgotPasswordSchema = z.object({
    key: z.string(),
    password: z.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export const changeEmailSchema = z.object({
    userId: z.string(),
    newEmail: z.email("Email không hợp lệ"),
});

export const verifyChangeEmailSchema = z.object({
    userId: z.string(),
    otp: z.string().length(6, "OTP phải có 6 ký tự"),
});

export const changePasswordSchema = z.object({
    userId: z.string(),
    oldPassword: z.string().min(1, "Mật khẩu cũ là bắt buộc"),
    password: z.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export const logoutSchema = z.object({
    userId: z.string(),
});

export const refreshSchema = z.object({
    refreshToken: z.string(),
});






/** api.md: status 1=Active 2=Inactive, roleName 1=Admin 2=User 3=Manager 4=Guest */
export const userCreateSchema = z.object({
    FullName: z.string().min(1, "Full name is required"),
    Email: z.string().email(),
    Phone: z.string().optional(),
    Password: z.string().min(6),
    AvatarUrl: z.string().url().optional(),
    Gender: z.number().int().min(0).max(2).default(0),
    DateOfBirth: z.coerce.date(),
    Address: z.string().optional(),
    Status: z.number().int().min(1).max(2).default(1),
    RoleName: z.number().int().min(1).max(4).default(2),
    OrganizerId: z.string().uuid().nullable().optional(),
});

export const userUpdateSchema = z.object({
    FullName: z.string().optional(),
    Phone: z.string().optional(),
    AvatarUrl: z.string().url().nullable().optional(),
    Gender: z.number().int().min(0).max(2).optional(),
    DateOfBirth: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.union([z.string(), z.date()]).optional()
    ),
    Address: z.string().optional(),
    Status: z.number().int().min(1).max(2).optional(),
    RoleName: z.number().int().min(1).max(4).optional(),
    OrganizerId: z.string().uuid().nullable().optional(),
});




export const genericListQuerySchema = z.object({
    pageNumber: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().default(20),
    isDeleted: z.boolean().default(false),
});

/** api.md: name is RoleNameEnum 1=Admin, 2=User, 3=Manager, 4=Guest */
export const roleCreateSchema = z.object({
    name: z.number().int().min(1).max(4),
});

export type RoleCreateBody = z.infer<typeof roleCreateSchema>;


export type UserCreateBody = z.infer<typeof userCreateSchema>;
export type UserUpdateBody = z.infer<typeof userUpdateSchema>;



export type LoginInput = z.infer<typeof loginSchema>;
export type LoginGoogleInput = z.infer<typeof loginGoogleSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyRegisterInput = z.infer<typeof verifyRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyForgotPasswordInput = z.infer<typeof verifyForgotPasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type VerifyChangeEmailInput = z.infer<typeof verifyChangeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;