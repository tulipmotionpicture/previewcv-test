"use client";

import Image from "next/image";
import {
  Briefcase,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
} from "lucide-react";
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
  const navItems: {
    key: DashboardTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    // { key: "stats", label: "Dashboard Stats", icon: <BarChart3 className="w-5 h-5" /> },
    {
      key: "jobs",
      label: "Manage Jobs",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      key: "ats",
      label: "Application Review",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      key: "gallery",
      label: "Company Gallery",
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      key: "galleryEvents",
      label: "Gallery Events",
      icon: <Calendar className="w-5 h-5" />,
    },
    { key: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white min-h-screen p-6 sticky top-0 h-screen flex flex-col">
      {/* Logo Section */}
      <div className="mb-8 flex items-center gap-3">
        <Image
          src={config.app.logoUrl}
          alt={config.app.name}
          width={120}
          height={120}
          className="rounded-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm flex items-center gap-3 ${
              activeTab === item.key
                ? "bg-black text-white"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center">
            {recruiter?.full_name ? (
              <span className="text-sm font-semibold text-white">
                {recruiter.full_name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-5 h-5 text-gray-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {recruiter?.full_name}
            </p>
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
