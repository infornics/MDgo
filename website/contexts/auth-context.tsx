"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  _id: string;
  name?: string;
  email: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("mdgo-token");
    localStorage.removeItem("mdgo-user");
    toast.success("Logged out");
  };

  const verifyToken = async (t: string) => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
      localStorage.setItem("mdgo-user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Token verification failed", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = () => {
      const storedToken = localStorage.getItem("mdgo-token");
      const storedUser = localStorage.getItem("mdgo-user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Optionally verify token with backend
        verifyToken(storedToken);
      } else {
        setIsLoading(false);
      }
    };

    // Load user on mount
    loadUser();

    // Listen for storage events (triggered when OAuth callback updates localStorage)
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem("mdgo-token");
      const storedUser = localStorage.getItem("mdgo-user");
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh from backend to get latest data including profile picture
        verifyToken(storedToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event from OAuth callback (same window)
    window.addEventListener("auth-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-update", handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, ...userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem("mdgo-token", newToken);
      localStorage.setItem("mdgo-user", JSON.stringify(userData));

      toast.success("Logged in successfully");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { token: newToken, ...userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem("mdgo-token", newToken);
      localStorage.setItem("mdgo-user", JSON.stringify(userData));

      toast.success("Registered successfully");
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
