"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getSessionRequest,
  loginRequest,
  logoutRequest,
} from "@/lib/auth-client";
import { performPostLoginRedirect } from "@/lib/post-login-redirect";
import type { SessionUser } from "@/types/auth.types";

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSessionRequest()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const result = await loginRequest(usernameOrEmail.trim(), password);
    if (!result.success) {
      throw new Error(result.error);
    }
    setUser(result.user);
    await performPostLoginRedirect(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      window.location.assign("/login");
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
