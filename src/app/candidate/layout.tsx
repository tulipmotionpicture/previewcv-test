"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import CandidateHeader from "@/components/CandidateHeader";
import { useAuth } from "@/context/AuthContext";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show header on public auth pages
  const isAuthPage = pathname === '/candidate/login' || pathname === '/candidate/signup';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {!isAuthPage && <CandidateHeader user={user ?? undefined} logout={logout} />}
      <main>{children}</main>
    </div>
  );
}
