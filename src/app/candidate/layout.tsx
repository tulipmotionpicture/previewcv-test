"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import CandidateHeader from "@/components/CandidateHeader";
import { useAuth } from "@/context/AuthContext";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show candidate header on public pages (landing, login, signup)
  const isPublicPage =
    pathname === "/candidate" ||
    pathname === "/candidate/login" ||
    pathname === "/candidate/signup";

  return (
    <div
      className={`min-h-screen ${!isPublicPage ? "bg-gray-50 dark:bg-gray-950" : ""}`}
    >
      {!isPublicPage && user && <CandidateHeader user={user} logout={logout} />}
      <main>{children}</main>
    </div>
  );
}
