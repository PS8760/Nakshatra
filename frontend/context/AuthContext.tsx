"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, logout: () => {}, updateUser: () => {}, loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem("cogni_token");
      const u = localStorage.getItem("cogni_user");
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  function login(t: string, u: User) {
    setToken(t); setUser(u);
    localStorage.setItem("cogni_token", t);
    localStorage.setItem("cogni_user", JSON.stringify(u));
  }

  function logout() {
    setToken(null); setUser(null);
    localStorage.removeItem("cogni_token");
    localStorage.removeItem("cogni_user");
  }

  function updateUser(u: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...u };
      localStorage.setItem("cogni_user", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
