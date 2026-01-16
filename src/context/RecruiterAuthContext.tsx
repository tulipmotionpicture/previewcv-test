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
  }, []);

  const checkAuth = async () => {
    console.log("RecruiterAuthContext: Starting checkAuth");
    try {
      // Ensure we're in the browser
      if (typeof window === "undefined") {
        console.log("RecruiterAuthContext: Not in browser");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("recruiter_access_token");
      console.log("RecruiterAuthContext: Token found:", !!token);

      if (!token) {
        console.log("RecruiterAuthContext: No token, setting loading false");
        setLoading(false);
        return;
      }

      // Validate token by fetching recruiter profile
      console.log("RecruiterAuthContext: Fetching recruiter profile");
      const response = await api.getRecruiterProfile();
      console.log("RecruiterAuthContext: Profile response:", response);

      // Check if response is the recruiter object directly or wrapped
      const responseData = response as unknown as
        | Recruiter
        | { success: boolean; recruiter: Recruiter };
      if (responseData && "id" in responseData) {
        // Response is the recruiter object directly
        console.log(
          "RecruiterAuthContext: Setting recruiter (direct):",
          responseData
        );
        setRecruiter(responseData);
      } else if (
        "success" in responseData &&
        "recruiter" in responseData &&
        responseData.success
      ) {
        // Response is wrapped with success and recruiter properties
        console.log(
          "RecruiterAuthContext: Setting recruiter (wrapped):",
          responseData.recruiter
        );
        setRecruiter(responseData.recruiter);
      } else {
        console.log(
          "RecruiterAuthContext: Response not valid recruiter format"
        );
      }
    } catch (error: unknown) {
      console.error("RecruiterAuthContext: Error in checkAuth:", error);
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
        console.log("RecruiterAuthContext: 401 error, clearing tokens");
        localStorage.removeItem("recruiter_access_token");
        localStorage.removeItem("recruiter_refresh_token");
        setRecruiter(null);
      }
      // If not 401, just set recruiter to null but keep tokens for retry
      else {
        console.log("RecruiterAuthContext: Non-401 error, keeping tokens");
        setRecruiter(null);
      }
    } finally {
      console.log(
        "RecruiterAuthContext: checkAuth complete, setting loading false"
      );
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.recruiterLogin(email, password);
      if (typeof window !== "undefined") {
        // Clear candidate tokens to ensure only one role is logged in at a time
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

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
        // Clear candidate tokens to ensure only one role is logged in at a time
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

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
