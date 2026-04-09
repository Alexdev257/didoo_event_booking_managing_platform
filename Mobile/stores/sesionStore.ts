import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { decodeJWT } from "@/lib/utils";
import { JWTUserType, User } from "@/types/auth";
import { Organizer } from "@/types/event";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: JWTUserType | null;
  profile: User | null;
  organizer: Organizer | null;
  isLoading: boolean;
  isHydrated: boolean;

  setSession: (params: { accessToken: string; refreshToken: string }) => Promise<void>;
  updateSession: (params: { accessToken: string; refreshToken: string }) => Promise<void>;
  setProfile: (profile: User) => void;
  setOrganizer: (organizer: Organizer | null) => void;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
  refresh: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  profile: null,
  organizer: null,
  isLoading: true,
  isHydrated: false,

  setSession: async ({ accessToken, refreshToken }) => {
    try {
      const user = decodeJWT<JWTUserType>(accessToken);
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      set({ accessToken, refreshToken, user });
    } catch (error) {
      console.error("Invalid access token", error);
      await get().clearSession();
    }
  },

  updateSession: async ({ accessToken, refreshToken }) => {
    try {
      const user = decodeJWT<JWTUserType>(accessToken);
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      set({ accessToken, refreshToken, user });
    } catch (error) {
      console.error("Invalid access token", error);
      await get().clearSession();
    }
  },

  setProfile: (profile) => set({ profile }),

  setOrganizer: (organizer) => set({ organizer }),

  clearSession: async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.warn("SecureStore delete error:", e);
    }
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      profile: null,
      organizer: null,
    });
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        try {
          const user = decodeJWT<JWTUserType>(accessToken);
          set({ accessToken, refreshToken, user });
        } catch {
          await get().clearSession();
        }
      } else {
        set({ accessToken: null, refreshToken: null, user: null });
      }
    } catch (e) {
      console.warn("Hydrate error:", e);
      set({ accessToken: null, refreshToken: null, user: null });
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },

  refresh: async (accessToken, refreshToken) => {
    await get().updateSession({ accessToken, refreshToken });
  },

  logout: async () => {
    await get().clearSession();
  },
}));
