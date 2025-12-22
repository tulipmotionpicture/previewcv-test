"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Recruiter } from "@/types/api";

interface RecruiterAuthContextType {
  recruiter: Recruiter | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: unknown) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Recruiter>) => Promise<void>;
  isAuthenticated: boolean;
}

const RecruiterAuthContext = createContext<
  RecruiterAuthContextType | undefined
>(undefined);

export function RecruiterAuthProvider({ children }: { children: ReactNode }) {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      // Ensure we're in the browser
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("recruiter_access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Validate token by fetching recruiter profile
      const response = await api.getRecruiterProfile();
      if (response.success && response.recruiter) {
        setRecruiter(response.recruiter);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to fetch recruiter profile:", error.message);
      }
      // Only clear tokens if it's a 401 (unauthorized) error
      // For other errors (network, 403, etc.), keep the token
      const isUnauthorized =
        error instanceof Error &&
        "status" in error &&
        (error as Error & { status: number }).status === 401;
      if (isUnauthorized && typeof window !== "undefined") {
        localStorage.removeItem("recruiter_access_token");
        localStorage.removeItem("recruiter_refresh_token");
        setRecruiter(null);
      }
      // If not 401, just set recruiter to null but keep tokens for retry
      else {
        setRecruiter(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.recruiterLogin(email, password);
      if (typeof window !== "undefined") {
        localStorage.setItem("recruiter_access_token", response.access_token);
        localStorage.setItem("recruiter_refresh_token", response.refresh_token);
      }

      // Fetch profile
      await checkAuth();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Login failed");
    }
  };

  const register = async (data: unknown) => {
    try {
      const response = await api.recruiterRegister(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("recruiter_access_token", response.access_token);
        localStorage.setItem("recruiter_refresh_token", response.refresh_token);
      }

      await checkAuth();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Registration failed");
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await api.recruiterLogout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with client-side logout even if API call fails
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("recruiter_access_token");
        localStorage.removeItem("recruiter_refresh_token");
      }
      setRecruiter(null);
      router.push("/recruiter/login");
    }
  };

  const updateProfile = async (data: Partial<Recruiter>) => {
    const response = await api.updateRecruiterProfile(data);
    if (response.success && response.recruiter) {
      setRecruiter(response.recruiter);
    }
  };

  return (
    <RecruiterAuthContext.Provider
      value={{
        recruiter,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!recruiter,
      }}
    >
      {children}
    </RecruiterAuthContext.Provider>
  );
}

export function useRecruiterAuth() {
  const context = useContext(RecruiterAuthContext);
  if (context === undefined) {
    throw new Error(
      "useRecruiterAuth must be used within a RecruiterAuthProvider"
    );
  }
  return context;
}
