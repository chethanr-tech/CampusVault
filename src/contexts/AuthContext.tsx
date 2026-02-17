import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient, User } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; college: string; branch: string; semester: number }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUser = await apiClient.getSession();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.login(email, password);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; college: string; branch: string; semester: number }) => {
    const res = await apiClient.register(data);
    setUser(res.user);
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
