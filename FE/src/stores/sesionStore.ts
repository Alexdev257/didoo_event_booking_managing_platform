import { decodeJWT } from "@/lib/utils";
import { JWTUserType, User } from "@/types/auth";
import { Organizer } from "@/types/event";
import { create } from "zustand";

interface SessionState {
    accessToken: string | null;
    refreshToken: string | null;
    user: JWTUserType | null;
    profile: User | null;
    organizer: Organizer | null;

    setSession: (params: { accessToken: string; refreshToken: string }) => void;
    updateSession: (params: { accessToken: string; refreshToken: string }) => void;
    setProfile: (profile: User) => void;
    setOrganizer: (organizer: Organizer | null) => void;
    clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    profile: null,
    organizer: null,

    setSession: ({ accessToken, refreshToken }) => {
        try {
            const user = decodeJWT<JWTUserType>(accessToken);
            set({ accessToken, refreshToken, user });
        } catch (error) {
            console.error("Invalid access token", error);
            set({ accessToken: null, refreshToken: null, user: null });
        }
    },

    updateSession: ({ accessToken, refreshToken }) => {
        try {
            const user = decodeJWT<JWTUserType>(accessToken);
            set({ accessToken, refreshToken, user });
        } catch (error) {
            console.error("Invalid access token", error);
            set({ accessToken: null, refreshToken: null, user: null });
        }
    },

    setProfile: (profile) => set({ profile }),

    setOrganizer: (organizer) => set({ organizer }),

    clearSession: () => set({
        accessToken: null,
        refreshToken: null,
        user: null,
        profile: null,
        organizer: null,
    }),
}));
