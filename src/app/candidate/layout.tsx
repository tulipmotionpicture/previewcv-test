"use client";
import { ReactNode } from "react";
import CandidateHeader from "@/components/CandidateHeader";
import { useAuth } from "@/context/AuthContext";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CandidateHeader user={user ?? undefined} logout={logout} />
      <main>{children}</main>
    </div>
  );
}
