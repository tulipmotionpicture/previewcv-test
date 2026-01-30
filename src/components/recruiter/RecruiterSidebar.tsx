"use client";

import {
  Briefcase,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
} from "lucide-react";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
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
    <DashboardSidebar
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onLogout={onLogout}
      variant="dark"
      userName={recruiter?.full_name}
      showChevron={false}
    />
  );
}
