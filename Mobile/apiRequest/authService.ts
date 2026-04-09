import api from "@/lib/interceptor";
import {
  LoginInput,
  LoginGoogleInput,
  RegisterInput,
  VerifyRegisterInput,
  ForgotPasswordInput,
  ChangeEmailInput,
  VerifyChangeEmailInput,
  LogoutInput,
  RefreshInput,
} from "@/schemas/auth";
import { UserCreateBody, UserUpdateBody, RoleCreateBody } from "@/schemas/auth";
import { UserGetListQuery, User, Role } from "@/types/auth";
import { PaginatedData } from "@/types/base";
import { ResponseData } from "@/types/base";
import { ENDPOINT } from "@/utils/endpoint";

export const authRequest = {
  loginClient: (data: LoginInput) =>
    api.post<ResponseData<{ accessToken: string; refreshToken: string }>>(
      ENDPOINT.LOGIN,
      data
    ),

  loginGoogle: (data: LoginGoogleInput) =>
    api.post<ResponseData<{ accessToken: string; refreshToken: string }>>(
      ENDPOINT.LOGIN_GOOGLE,
      data
    ),

  register: (data: Omit<RegisterInput, "ConfirmPassword">) =>
    api.post<ResponseData<null>>(ENDPOINT.REGISTER, data),

  verifyRegister: (data: VerifyRegisterInput) =>
    api.post<ResponseData<null>>(ENDPOINT.VERIFY_REGISTER, data),

  logoutClient: (data: LogoutInput) =>
    api.post<ResponseData<null>>(ENDPOINT.LOGOUT, data),

  refreshTokenClient: (body: RefreshInput) =>
    api.post<ResponseData<{ accessToken: string; refreshToken: string }>>(
      ENDPOINT.REFRESH,
      body
    ),

  forgotPassword: (data: ForgotPasswordInput) =>
    api.post<ResponseData<null>>(ENDPOINT.FORGOT_PASSWORD, data),

  verifyForgotPassword: (data: { key: string; newPassword: string }) =>
    api.post<ResponseData<null>>(ENDPOINT.VERIFY_FORGOT_PASSWORD, data),

  changeEmail: (data: ChangeEmailInput) =>
    api.post<ResponseData<null>>(ENDPOINT.CHANGE_EMAIL, data),

  verifyChangeEmail: (data: VerifyChangeEmailInput) =>
    api.post<ResponseData<null>>(ENDPOINT.VERIFY_CHANGE_EMAIL, data),

  changePassword: (data: {
    userId: string;
    password: string;
    newPassword: string;
  }) => api.post<ResponseData<null>>(ENDPOINT.CHANGE_PASSWORD, data),
};

export const userRequest = {
  getList: (params?: UserGetListQuery) =>
    api.get<ResponseData<PaginatedData<User>>>(ENDPOINT.USERS, { params }),
  getById: (id: string) =>
    api.get<ResponseData<User>>(ENDPOINT.USER_DETAIL(id)),
  create: (body: UserCreateBody) =>
    api.post<ResponseData<User>>(ENDPOINT.USERS, body),
  update: (id: string, body: UserUpdateBody) =>
    api.put<ResponseData<Partial<User>>>(ENDPOINT.USER_DETAIL(id), body),
  delete: (id: string) => api.delete<ResponseData<null>>(ENDPOINT.USER_DETAIL(id)),
  restore: (id: string) =>
    api.patch<ResponseData<null>>(ENDPOINT.USER_DETAIL(id), {}),
};

export const roleRequest = {
  getList: () => api.get<ResponseData<Role[]>>(ENDPOINT.ROLES),
  create: (body: RoleCreateBody) =>
    api.post<ResponseData<Role>>(ENDPOINT.ROLES, body),
  dumb: () => api.post<ResponseData<unknown>>(ENDPOINT.ROLES_DUMB, {}),
  delete: (id: string) =>
    api.delete<ResponseData<null>>(ENDPOINT.ROLE_DETAIL(id)),
  restore: (id: string) =>
    api.patch<ResponseData<null>>(ENDPOINT.ROLE_DETAIL(id), {}),
};
