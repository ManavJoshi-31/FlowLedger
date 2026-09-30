import { createContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("flowledger_user");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("flowledger_token");
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    setToken(token);
    setUser(user);

    localStorage.setItem("flowledger_token", token);
    localStorage.setItem("flowledger_user", JSON.stringify(user));

    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("flowledger_token");
    localStorage.removeItem("flowledger_user");
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
