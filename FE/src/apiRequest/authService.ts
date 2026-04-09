import http from "@/lib/http";
import { ENDPOINT_CLIENT, ENDPOINT_SERVER } from "@/utils/endpoint";
import {UserCreateBody, UserUpdateBody, RoleCreateBody, LoginInput, LoginGoogleInput, RegisterInput, VerifyRegisterInput, LogoutInput, RefreshInput, ForgotPasswordInput, ChangeEmailInput, VerifyChangeEmailInput } from "@/schemas/auth";
import { UserGetListQuery, User,Role} from "@/types/auth";

import { PaginatedData } from "@/types/base";

export const authRequest = {
  loginClient: (data: LoginInput) =>
    http.post<{ accessToken: string; refreshToken: string }>(ENDPOINT_CLIENT.LOGIN, data, {
      skipAuth: true,
    }),
  loginServer: (body: { accessToken: string; refreshToken: string }) =>
    http.post(ENDPOINT_SERVER.LOGIN, body, { baseURL: "" }),
  loginGoogle: (data: LoginGoogleInput) =>
    http.post<{ accessToken: string; refreshToken: string }>(ENDPOINT_CLIENT.LOGIN_GOOGLE, data, {
      skipAuth: true,
    }),
  register: (data: Omit<RegisterInput, "confirmPassword">) =>
    http.post(ENDPOINT_CLIENT.REGISTER, data, { skipAuth: true }),
  verifyRegister: (data: VerifyRegisterInput) =>
    http.post(ENDPOINT_CLIENT.VERIFY_REGISTER, data, { skipAuth: true }),
  logoutClient: (data: LogoutInput) => http.post(ENDPOINT_CLIENT.LOGOUT, data),
  logoutServer: () => http.post(ENDPOINT_SERVER.LOGOUT, undefined, { baseURL: "" }),
  refreshTokenClient: (body: RefreshInput) =>
    http.post<{ accessToken: string; refreshToken: string }>(ENDPOINT_CLIENT.REFRESH, body),
  refreshTokenServer: (body: { accessToken: string; refreshToken: string }) =>
    http.post<{ accessToken: string; refreshToken: string }>(ENDPOINT_SERVER.REFRESH, body, {
      baseURL: "",
    }),
  forgotPassword: (data: ForgotPasswordInput) => http.post(ENDPOINT_CLIENT.FORGOT_PASSWORD, data, { skipAuth: true }),
  verifyForgotPassword: (data: { key: string; newPassword: string }) =>
    http.post(ENDPOINT_CLIENT.VERIFY_FORGOT_PASSWORD, data, { skipAuth: true }),
  changeEmail: (data: ChangeEmailInput) => http.post(ENDPOINT_CLIENT.CHANGE_EMAIL, data),
  verifyChangeEmail: (data: VerifyChangeEmailInput) => http.post(ENDPOINT_CLIENT.VERIFY_CHANGE_EMAIL, data),
  changePassword: (data: { userId: string; password: string; newPassword: string }) =>
    http.post(ENDPOINT_CLIENT.CHANGE_PASSWORD, data, { skipAuth: true }),
};

export const userRequest = {
  getList: (params: UserGetListQuery) => http.get<PaginatedData<User>>(ENDPOINT_CLIENT.USERS, { query: params }),
  getById: (id: string) => http.get<User>(ENDPOINT_CLIENT.USER_DETAIL(id)),
  create: (body: UserCreateBody) => http.post<User>(ENDPOINT_CLIENT.USERS, body),
  update: (id: string, body: UserUpdateBody) => http.put<Partial<User>>(ENDPOINT_CLIENT.USER_DETAIL(id), body),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.USER_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.USER_DETAIL(id), {}),
};

export const roleRequest = {
  getList: () => http.get<Role[]>(ENDPOINT_CLIENT.ROLES),
  create: (body: RoleCreateBody) => http.post<Role>(ENDPOINT_CLIENT.ROLES, body),
  dumb: () => http.post(ENDPOINT_CLIENT.ROLES_DUMB, {}),
  delete: (id: string) => http.delete<null>(ENDPOINT_CLIENT.ROLE_DETAIL(id)),
  restore: (id: string) => http.patch<null>(ENDPOINT_CLIENT.ROLE_DETAIL(id), {}),
};
