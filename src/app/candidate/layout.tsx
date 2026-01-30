"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Don't add background on public pages (landing, login, signup)
  const isPublicPage =
    pathname === "/candidate" ||
    pathname === "/candidate/login" ||
    pathname === "/candidate/signup";

  return (
    <div
      className={`min-h-screen ${!isPublicPage ? "bg-gray-50 dark:bg-gray-950" : ""}`}
    >
      <main>{children}</main>
    </div>
  );
}
