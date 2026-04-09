"use client";





import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useSessionStore } from "@/stores/sesionStore";

import { authRequest } from "@/apiRequest/authService";
import { handleErrorApi } from "@/lib/errors";
interface AuthContextType {
    setTokenFromContext: (accessToken: string, refreshToken: string) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
    children,
    initialAccessToken,
    initialRefreshToken
}: {
    children: ReactNode;
    initialAccessToken?: string | null;
    initialRefreshToken?: string | null;
}) => {
    const setSession = useSessionStore((state) => state.setSession);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const setTokenFromContext = (accessToken: string, refreshToken: string) => {
        setSession({ accessToken, refreshToken });
    };

    useEffect(() => {
        const initializeAuth = async () => {
            // Case 1: Có cả access_token và refresh_token → OK, hydrate bình thường
            if (initialAccessToken && initialRefreshToken) {
                setSession({ accessToken: initialAccessToken, refreshToken: initialRefreshToken });
                setIsHydrated(true);
                return;
            }

            // Case 2: Không có refresh_token → Middleware đã xử lý redirect
            // Trường hợp này không xảy ra ở đây vì middleware đã chặn
            if (!initialRefreshToken) {
                setIsHydrated(true);
                return;
            }

            // Case 3: Có refresh_token nhưng KHÔNG có access_token
            // → Call API để lấy access_token mới
            if (!initialAccessToken && initialRefreshToken) {
                console.log("Access token missing, refreshing from cookies...");
                setIsRefreshing(true);

                try {
                    // Gọi API backend để refresh access_token
                    const result = await authRequest.refreshTokenClient({
                        refreshToken: initialRefreshToken
                    });

                    if (!result.data?.accessToken) {
                        throw new Error("Invalid refresh token response");
                    }

                    const newAccessToken = result.data.accessToken;
                    // Backend có thể rotate refresh token — đồng bộ giống http.ts performRefresh
                    const newRefreshToken =
                        result.data.refreshToken ?? initialRefreshToken;

                    // Step 1: Set vào Zustand store
                    setSession({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    });

                    // Step 2: Đồng bộ token vào cookies (httpOnly) qua API route
                    await authRequest.refreshTokenServer({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    });




                } catch (error) {
                    handleErrorApi({ error })

                    // Refresh thất bại → Clear hết và redirect


                    try {
                        // Xóa cookies
                        await authRequest.logoutServer();
                    } catch (logoutError) {
                        console.error("Failed to clear cookies:", logoutError);
                    }

                    // Redirect về login
                    window.location.href = "/login";
                    return;
                } finally {
                    setIsRefreshing(false);
                }
            }

            setIsHydrated(true);
        };

        initializeAuth();
    }, []);

    // Show loading khi đang hydrate hoặc đang refresh
    if (!isHydrated || isRefreshing) {
        return <div className="loader">
            <div className="justify-content-center jimu-primary-loading"></div>
        </div>
    }

    return (
        <AuthContext.Provider value={{ setTokenFromContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuthContext must be used within AuthProvider");
    return context;
};