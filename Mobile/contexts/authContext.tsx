import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useSessionStore } from "@/stores/sesionStore";

interface AuthContextType {
  setTokenFromContext: (accessToken: string, refreshToken: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setSession = useSessionStore((s) => s.setSession);
  const accessToken = useSessionStore((s) => s.accessToken);
  const refreshToken = useSessionStore((s) => s.refreshToken);

  const isAuthenticated = !!(accessToken && refreshToken);

  const setTokenFromContext = (at: string, rt: string) => {
    setSession({ accessToken: at, refreshToken: rt });
  };

  return (
    <AuthContext.Provider value={{ setTokenFromContext, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
