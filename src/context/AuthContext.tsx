"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types/api";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Ensure we're in the browser
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Validate token by fetching user profile
      const userData = await api.getCandidateProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Only clear tokens if it's a 401 (unauthorized) error
      // For other errors (network, 403, etc.), keep the token
      const isUnauthorized =
        error instanceof Error &&
        "status" in error &&
        (error as Error & { status: number }).status === 401;
      if (isUnauthorized && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      }
      // If not 401, just set user to null but keep tokens for retry
      else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.candidateLogin(email, password);
    if (response.access_token) {
      if (typeof window !== "undefined") {
        // Clear recruiter tokens to ensure only one role is logged in at a time
        localStorage.removeItem("recruiter_access_token");
        localStorage.removeItem("recruiter_refresh_token");

        localStorage.setItem("access_token", response.access_token);
        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token);
        }
      }
      if (response.user) {
        setUser(response.user);
      } else {
        await checkAuth();
      }
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const response = await api.candidateRegister(email, password, fullName);
    if (response.access_token) {
      if (typeof window !== "undefined") {
        // Clear recruiter tokens to ensure only one role is logged in at a time
        localStorage.removeItem("recruiter_access_token");
        localStorage.removeItem("recruiter_refresh_token");

        localStorage.setItem("access_token", response.access_token);
        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token);
        }
      }
      if (response.user) {
        setUser(response.user);
      } else {
        await checkAuth();
      }
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await api.candidateLogout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with client-side logout even if API call fails
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await api.updateCandidateProfile(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
