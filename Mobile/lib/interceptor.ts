import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import envconfig from "@/config";
import { ENDPOINT } from "../utils/endpoint";
import { HttpErrorCode } from "@/utils/enum";
import { EntityError, HttpError } from "@/lib/errors";
import { useSessionStore } from "@/stores/sesionStore";
import { ResponseData, ResponseError } from "@/types/base";

/* ================= AXIOS INSTANCE ================= */

export const api = axios.create({
  baseURL: envconfig.EXPO_PUBLIC_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useSessionStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= REFRESH TOKEN QUEUE ================= */

let isRefreshing = false;

let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      if (token && promise.config.headers) {
        promise.config.headers.Authorization = `Bearer ${token}`;
      }
      promise.resolve(api(promise.config));
    }
  });

  failedQueue = [];
};

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<ResponseError>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    /* ========== 401 – REFRESH TOKEN ========== */

    if (
      error.response?.status === HttpErrorCode.UNAUTHORIZED &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ENDPOINT.REFRESH)
    ) {
      const session = useSessionStore.getState();

      if (!session.refreshToken) {
        session.logout();

        return Promise.reject(
          new HttpError({
            isSuccess: false,
            message: "Phiên đăng nhập hết hạn",
            data: null,
            listErrors: [],
          })
        );
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post<
          ResponseData<{ accessToken: string; refreshToken: string }>
        >(`${envconfig.EXPO_PUBLIC_BASE_URL}${ENDPOINT.REFRESH}`, {
          refreshToken: session.refreshToken,
        });

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        await session.refresh(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        session.logout();
        return Promise.reject(
          new HttpError({
            isSuccess: false,
            message: "Không thể làm mới phiên đăng nhập",
            data: null,
            listErrors: [],
          })
        );
      } finally {
        isRefreshing = false;
      }
    }

    /* ========== BACKEND ERROR ========== */

    if (error.response?.data) {
      const errorData = error.response.data as ResponseError;

      const hasValidationErrors =
        Array.isArray(errorData?.listErrors) && errorData.listErrors.length > 0;

      if (
        error.response.status === HttpErrorCode.UNPROCESSABLE_ENTITY ||
        (error.response.status === HttpErrorCode.BAD_REQUEST &&
          hasValidationErrors)
      ) {
        return Promise.reject(new EntityError(errorData));
      }

      return Promise.reject(new HttpError(errorData));
    }

    /* ========== NETWORK ERROR ========== */

    if (error.request) {
      return Promise.reject(
        new HttpError({
          isSuccess: false,
          message: "Không thể kết nối server",
          data: null,
          listErrors: [],
        })
      );
    }

    /* ========== UNKNOWN ERROR ========== */

    return Promise.reject(
      new HttpError({
        isSuccess: false,
        message: error.message || "Có lỗi xảy ra",
        data: null,
        listErrors: [],
      })
    );
  }
);

export default api;
