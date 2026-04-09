import { z } from "zod";

export const locationSchema = z.object({
    Latitude: z.number(),
    Longitude: z.number(),
    Address: z.string().optional(),
});

export const loginSchema = z.object({
    Email: z.string().email("Email không hợp lệ"),
    Password: z.string().min(1, "Mật khẩu là bắt buộc"),
    Location: locationSchema,
});

export const loginGoogleSchema = z.object({
    GoogleToken: z.string(),
    Location: locationSchema,
});

export const registerSchema = z.object({
    FullName: z.string().min(1, "Họ tên là bắt buộc"),
    Email: z.string().email("Email không hợp lệ"),
    Phone: z.string().optional(),
    Password: z.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    ConfirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    AvatarUrl: z.string(),
    Gender: z.number().int().min(0).max(2).default(0),
    DateOfBirth: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.union([z.string(), z.date()]).optional()
    ),
    Address: z.string().optional(),
}).refine((data) => data.Password === data.ConfirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["ConfirmPassword"],
});

export const verifyRegisterSchema = z.object({
    Email: z.string().email("Email không hợp lệ"),
    Otp: z.string().length(6, "OTP phải có 6 ký tự"),
});

export const forgotPasswordSchema = z.object({
    Email: z.string().email("Email không hợp lệ"),
    ClientUri: z.string().optional(),
});

export const verifyForgotPasswordSchema = z.object({
    Key: z.string(),
    Password: z.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    ConfirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.Password === data.ConfirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["ConfirmPassword"],
});

export const changeEmailSchema = z.object({
    UserId: z.string(),
    NewEmail: z.string().email("Email không hợp lệ"),
});

export const verifyChangeEmailSchema = z.object({
    UserId: z.string(),
    Otp: z.string().length(6, "OTP phải có 6 ký tự"),
});

export const changePasswordSchema = z.object({
    UserId: z.string(),
    OldPassword: z.string().min(1, "Mật khẩu cũ là bắt buộc"),
    Password: z.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    ConfirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.Password === data.ConfirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["ConfirmPassword"],
});

export const logoutSchema = z.object({
    UserId: z.string(),
});

export const refreshSchema = z.object({
    refreshToken: z.string(),
});






/** api.md: status 1=Active 2=Inactive, roleName 1=Admin 2=User 3=Manager 4=Guest */
export const userCreateSchema = z.object({
    FullName: z.string().min(1, "Full name is required").regex(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯÀẢÃẠẰẮẲẴẶẦẤẨẪẬỀẾỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]+$/, "Fullname is not allowed special characters and digits!"),
    Email: z.string().email(),
    Phone: z.string().regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "Phone must be Viet Nam phone number!").optional(),
    Password: z.string().min(8, "Password must be at least 8 characters!")
        .regex(/[A-Z]/, "Password must contain at least 1 Upper character!")
        .regex(/[a-z]/, "Password must contain at least 1 Lower character!")
        .regex(/\d/, "Password must contain at least 1 digit!")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least 1 special character!"),
    AvatarUrl: z.string().url().optional(),
    Gender: z.number().int().min(0).max(2).default(0),
    DateOfBirth: z.coerce.date(),
    Address: z.string().optional(),
    Status: z.number().int().min(1).max(2).default(1),
    RoleName: z.number().int().min(1).max(4).default(2),
    OrganizerId: z.string().uuid().nullable().optional(),
});

export const userUpdateSchema = z.object({
    FullName: z.string().regex(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯÀẢÃẠẰẮẲẴẶẦẤẨẪẬỀẾỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]+$/, "Fullname is not allowed special characters and digits!").optional(),
    Phone: z.string().regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "Phone must be Viet Nam phone number!").optional(),
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