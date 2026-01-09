"use client";

import Image from "next/image";
import config from "@/config";
import { Recruiter } from "@/types/api";

export type DashboardTab =
  | "jobs"
  | "ats"
  | "stats"
  | "gallery"
  | "galleryEvents"
  | "profile";

interface RecruiterSidebarProps {
  recruiter: Recruiter | null;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
}

export default function RecruiterSidebar({
  recruiter,
  activeTab,
  onTabChange,
  onLogout,
}: RecruiterSidebarProps) {
  const navItems: { key: DashboardTab; label: string }[] = [
    // { key: "stats", label: "Dashboard Stats" },
    { key: "jobs", label: "Manage Jobs" },
    { key: "ats", label: "Application Review" },
    { key: "gallery", label: "Company Gallery" },
    { key: "galleryEvents", label: "Gallery Events" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 min-h-screen p-6 sticky top-0 h-screen shadow-sm">
      <div className="mb-10 flex items-center justify-center">
        <Image
          src={config.app.logoUrl}
          alt={config.app.name}
          width={120}
          height={120}
          className="rounded-3xl"
        />
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-tight ${
              activeTab === item.key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-10 left-6 right-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 font-black uppercase tracking-widest">
            Signed in as
          </p>
          <p className="font-bold text-sm truncate text-gray-900 dark:text-gray-100">
            {recruiter?.full_name}
          </p>
          <button
            onClick={onLogout}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline mt-4 block font-black uppercase tracking-tight"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
