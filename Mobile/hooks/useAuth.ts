import {
  authRequest,
  roleRequest,
  userRequest,
} from "@/apiRequest/authService";
import { handleErrorApi } from "@/lib/errors";
import {
  UserCreateBody,
  UserUpdateBody,
  RoleCreateBody,
  LoginInput,
  LoginGoogleInput,
  RegisterInput,
  VerifyRegisterInput,
  ForgotPasswordInput,
  VerifyForgotPasswordInput,
  ChangeEmailInput,
  VerifyChangeEmailInput,
  ChangePasswordInput,
  LogoutInput,
} from "@/schemas/auth";
import { UserGetListQuery } from "@/types/auth";
import { useSessionStore } from "@/stores/sesionStore";
import { KEY, QUERY_KEY } from "@/utils/constant";
import { getRedirectPathForRole } from "@/utils/enum";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { toast } from "@/lib/toast";

export const useGetUsers = (params?: UserGetListQuery) =>
  useQuery({
    queryKey: QUERY_KEY.users.list(params),
    queryFn: () => userRequest.getList(params || {}).then((r) => r.data),
  });

export const useGetUser = (id: string) =>
  useQuery({
    queryKey: QUERY_KEY.users.detail(id),
    queryFn: () => userRequest.getById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetMe = () => {
  const user = useSessionStore((state) => state.user);
  const userId = (user as any)?.userId || (user as any)?.UserId;
  return useQuery({
    queryKey: QUERY_KEY.users.detail(userId || ""),
    queryFn: () => userRequest.getById(userId || "").then((r) => r.data),
    enabled: !!userId,
  });
};

export const useUser = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: UserCreateBody) =>
      (await userRequest.create(body)).data.data,
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: KEY.users });
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UserUpdateBody }) =>
      (await userRequest.update(id, body)).data.data,
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: KEY.users });
    },
  });
  const deleteUser = useMutation({
    mutationFn: async (id: string) =>
      (await userRequest.delete(id)).data.message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.users });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  const restore = useMutation({
    mutationFn: async (id: string) =>
      (await userRequest.restore(id)).data.message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.users });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  return { create, update, deleteUser, restore };
};

export const useGetRoles = () =>
  useQuery({
    queryKey: QUERY_KEY.roles.list(),
    queryFn: () => roleRequest.getList().then((r) => r.data),
  });

export const useRole = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: RoleCreateBody) =>
      (await roleRequest.create(body)).data.data,
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: KEY.roles });
    },
  });
  const dumb = useMutation({
    mutationFn: async () => (await roleRequest.dumb()).data.message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.roles });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  const deleteRole = useMutation({
    mutationFn: async (id: string) =>
      (await roleRequest.delete(id)).data.message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.roles });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  const restore = useMutation({
    mutationFn: async (id: string) =>
      (await roleRequest.restore(id)).data.message,
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: KEY.roles });
    },
    onError: (error) => handleErrorApi({ error }),
  });
  return { create, dumb, deleteRole, restore };
};

export const useAuth = () => {
  const { user, setSession, clearSession } = useSessionStore((state) => state);
  const router = useRouter();
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (data: LoginInput) =>
      (await authRequest.loginClient(data)).data.data,
    onSuccess: async (data) => {
      setSession(data);
      const u = useSessionStore.getState().user;
      toast.success("Login successfully");
      router.replace(getRedirectPathForRole(u?.role) as any);
    },
  });

  const loginGoogle = useMutation({
    mutationFn: async (data: LoginGoogleInput) =>
      (await authRequest.loginGoogle(data)).data.data,
    onSuccess: async (data) => {
      setSession(data);
      const u = useSessionStore.getState().user;
      toast.success("Login successfully");
      router.replace(getRedirectPathForRole(u?.role) as any);
    },
  });

  const register = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const { ConfirmPassword, ...payload } = data;
      return (await authRequest.register(payload)).data.message;
    },
    onSuccess: async (data) => toast.success(data),
  });

  const verifyRegister = useMutation({
    mutationFn: async (data: VerifyRegisterInput) =>
      (await authRequest.verifyRegister(data)).data.message,
    onSuccess: async (data) => {
      toast.success(data);
      router.replace("/(auth)/login" as any);
    },
  });

  const logout = useMutation({
    mutationFn: async (data: LogoutInput) => {
      // Standardize to UserId for the API
      const payload = {
        UserId: (data as any).UserId || (data as any).userId || data.UserId
      };
      await authRequest.logoutClient(payload);
    },
    onSettled: async () => {
      // Use onSettled to ensure local cleanup happens regardless of API success/failure
      await clearSession();
      queryClient.clear();
      toast.success("Đã đăng xuất thành công");
      router.replace("/(auth)/login" as any);
    },
  });

  const forgotPassword = useMutation({
    mutationFn: async (data: ForgotPasswordInput) =>
      (await authRequest.forgotPassword(data)).data.data,
  });

  const verifyForgotPassword = useMutation({
    mutationFn: async (data: VerifyForgotPasswordInput) =>
      (
        await authRequest.verifyForgotPassword({
          key: data.Key,
          newPassword: data.Password,
        })
      ).data.message,
    onSuccess: async (data) => toast.success(data),
  });

  const changeEmail = useMutation({
    mutationFn: async (data: ChangeEmailInput) =>
      (await authRequest.changeEmail(data)).data.message,
    onSuccess: async (data) => toast.success(data),
  });

  const verifyChangeEmail = useMutation({
    mutationFn: async (data: VerifyChangeEmailInput) =>
      (await authRequest.verifyChangeEmail(data)).data.message,
    onSuccess: async (data) => {
      if (user?.userId) {
        try {
          await authRequest.logoutClient({ UserId: user.userId });
        } catch { }
      }
      clearSession();
      toast.success(data);
      router.replace("/(auth)/login" as any);
    },
  });

  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordInput) =>
      (
        await authRequest.changePassword({
          userId: data.UserId,
          password: data.OldPassword,
          newPassword: data.Password,
        })
      ).data.message,
    onSuccess: async (data) => {
      if (user?.userId) {
        try {
          await authRequest.logoutClient({ UserId: user.userId });
        } catch { }
      }
      clearSession();
      toast.success(data);
      router.replace("/(auth)/login" as any);
    },
  });

  return {
    login,
    loginGoogle,
    register,
    verifyRegister,
    logout,
    forgotPassword,
    verifyForgotPassword,
    changeEmail,
    verifyChangeEmail,
    changePassword,
  };
};
