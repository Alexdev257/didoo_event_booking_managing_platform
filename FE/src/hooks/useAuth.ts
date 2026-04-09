'use client'

import { authRequest, roleRequest, userRequest } from "@/apiRequest/authService";
import { handleErrorApi } from "@/lib/errors";
import { UserCreateBody, UserUpdateBody, RoleCreateBody, LoginInput, LoginGoogleInput, RegisterInput, VerifyRegisterInput, ForgotPasswordInput, VerifyForgotPasswordInput, ChangeEmailInput, VerifyChangeEmailInput, ChangePasswordInput, LogoutInput } from "@/schemas/auth";
import { UserGetListQuery, User, Role } from "@/types/auth";
import { useSessionStore } from "@/stores/sesionStore";
import { KEY, QUERY_KEY } from "@/utils/constant";
import { getRedirectPathForRole } from "@/utils/enum";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useGetUsers = (params?: UserGetListQuery) =>
    useQuery({
        queryKey: QUERY_KEY.users.list(params),
        queryFn: () => userRequest.getList(params || {}),
    });

export const useGetUser = (id: string) =>
    useQuery({
        queryKey: QUERY_KEY.users.detail(id),
        queryFn: () => userRequest.getById(id),
        enabled: !!id,
    });

export const useGetMe = () => {
    const user = useSessionStore((state) => state.user);
    const userId = user?.UserId;
    return useQuery({
        queryKey: QUERY_KEY.users.detail(userId || ""),
        queryFn: () => userRequest.getById(userId || ""),
        enabled: !!userId,
    });
};

export const useUser = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: UserCreateBody) => (await userRequest.create(body)).data,
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.users });
        },
    });
    const update = useMutation({
        mutationFn: async ({ id, body }: { id: string; body: UserUpdateBody }) => (await userRequest.update(id, body)).data,
        onSuccess: () => {
            toast.success("User updated successfully");
            queryClient.invalidateQueries({ queryKey: KEY.users });
        },
    });
    const deleteUser = useMutation({
        mutationFn: async (id: string) => (await userRequest.delete(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.users });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async (id: string) => (await userRequest.restore(id)).message,
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
        queryFn: () => roleRequest.getList(),
    });

export const useRole = () => {
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: async (body: RoleCreateBody) => (await roleRequest.create(body)).data,
        onSuccess: () => {
            toast.success("Role created successfully");
            queryClient.invalidateQueries({ queryKey: KEY.roles });
        },
    });
    const dumb = useMutation({
        mutationFn: async () => (await roleRequest.dumb()).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.roles });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const deleteRole = useMutation({
        mutationFn: async (id: string) => (await roleRequest.delete(id)).message,
        onSuccess: (data) => {
            toast.success(data);
            queryClient.invalidateQueries({ queryKey: KEY.roles });
        },
        onError: (error) => handleErrorApi({ error }),
    });
    const restore = useMutation({
        mutationFn: async (id: string) => (await roleRequest.restore(id)).message,
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
        mutationFn: async (data: LoginInput) => (await authRequest.loginClient(data)).data,
        onSuccess: async (data) => {
            setSession(data);
            await authRequest.loginServer(data);
            const u = useSessionStore.getState().user;
            toast.success("Login successfully");
            router.replace(getRedirectPathForRole(u?.Role));
        },
    });

    const loginGoogle = useMutation({
        mutationFn: async (data: LoginGoogleInput) => (await authRequest.loginGoogle(data)).data,
        onSuccess: async (data) => {
            setSession(data);
            await authRequest.loginServer(data);
            const u = useSessionStore.getState().user;
            toast.success("Login successfully");
            router.replace(getRedirectPathForRole(u?.Role));
        },
    });

    const register = useMutation({
        mutationFn: async (data: RegisterInput) => {
            const { confirmPassword, ...payload } = data;
            return (await authRequest.register(payload)).message;
        },
        onSuccess: async (data) => toast.success(data),
    });

    const verifyRegister = useMutation({
        mutationFn: async (data: VerifyRegisterInput) => (await authRequest.verifyRegister(data)).message,
        onSuccess: async (data) => {
            toast.success(data);
            router.replace("/login");
        },
    });

    const logout = useMutation({
        mutationFn: async (data: LogoutInput) => {
            await authRequest.logoutClient(data);
        },
        onSuccess: async () => {
            await authRequest.logoutServer();
            clearSession();
            queryClient.clear();
            toast.success("Logout successfully");
            router.replace("/login");
        },
    });

    const forgotPassword = useMutation({
        mutationFn: async (data: ForgotPasswordInput) => (await authRequest.forgotPassword(data)).data,
    });

    const verifyForgotPassword = useMutation({
        mutationFn: async (data: VerifyForgotPasswordInput) =>
            (await authRequest.verifyForgotPassword({ key: data.key, newPassword: data.password })).message,
        onSuccess: async (data) => toast.success(data),
    });

    const changeEmail = useMutation({
        mutationFn: async (data: ChangeEmailInput) => (await authRequest.changeEmail(data)).message,
        onSuccess: async (data) => toast.success(data),
    });

    const verifyChangeEmail = useMutation({
        mutationFn: async (data: VerifyChangeEmailInput) => (await authRequest.verifyChangeEmail(data)).message,
        onSuccess: async (data) => {
            if (user?.UserId) {
                try { await authRequest.logoutClient({ userId: user.UserId }); } catch {}
            }
            await authRequest.logoutServer();
            clearSession();
            toast.success(data);
            router.replace("/login");
        }
    });

    const changePassword = useMutation({
        mutationFn: async (data: ChangePasswordInput) =>
            (await authRequest.changePassword({ userId: data.userId, password: data.oldPassword, newPassword: data.password })).message,
        onSuccess: async (data) => {
            if (user?.UserId) {
                try { await authRequest.logoutClient({ userId: user.UserId }); } catch {}
            }
            await authRequest.logoutServer();
            clearSession();
            toast.success(data);
            router.replace("/login");
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
        changePassword
    };
};
