import { createContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Session-scoped storage: cleared automatically when the browser is closed
    const storedUser = sessionStorage.getItem("flowledger_user");

    // Clean up any legacy persistent tokens in localStorage
    try {
      localStorage.removeItem("flowledger_token");
      localStorage.removeItem("flowledger_user");
    } catch {
      // Ignore storage access errors
    }

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("flowledger_token");
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    setToken(token);
    setUser(user);

    // Save strictly to sessionStorage so closing browser logs user out immediately
    sessionStorage.setItem("flowledger_token", token);
    sessionStorage.setItem("flowledger_user", JSON.stringify(user));

    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    sessionStorage.removeItem("flowledger_token");
    sessionStorage.removeItem("flowledger_user");

    try {
      localStorage.removeItem("flowledger_token");
      localStorage.removeItem("flowledger_user");
    } catch {
      // Ignore storage access errors
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
