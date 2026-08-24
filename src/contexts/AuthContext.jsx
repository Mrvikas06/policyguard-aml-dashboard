// ─────────────────────────────────────────────────────────────────────────────
// Auth Context — Authentication state management
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) { setLoading(false); return; }
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (_e) {
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    const { token, user: userData } = await api.auth.login(email, password);
    localStorage.setItem("auth_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setUser(null);
  }, []);

  const register = useCallback(async (data) => {
    const { token, user: userData } = await api.auth.register(data);
    localStorage.setItem("auth_token", token);
    setUser(userData);
  }, []);

  const changePassword = useCallback(async (data) => {
    await api.auth.changePassword(data);
  }, []);

  const value = { user, login, logout, register, changePassword, loading, refreshUser: fetchUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}