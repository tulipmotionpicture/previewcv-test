"use client";

import {
  Briefcase,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  Shield,
  CreditCard,
  DollarSign,
} from "lucide-react";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import { Recruiter, KycStatus } from "@/types/api";

export type DashboardTab =
  | "stats"
  | "ats"
  | "gallery"
  | "galleryEvents"
  | "profile"
  | "jobs"
  | "kyc"
  | "subscriptions"
  | "pricing";

interface RecruiterSidebarProps {
  recruiter: Recruiter | null;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  kycStatus?: KycStatus | null;
}

export default function RecruiterSidebar({
  recruiter,
  activeTab,
  onTabChange,
  onLogout,
  kycStatus,
}: RecruiterSidebarProps) {
  const isKycApproved = kycStatus?.kyc_status === "approved";

  const navItems: {
    key: DashboardTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
      {
        key: "stats",
        label: "Overview",
        icon: <Briefcase className="w-5 h-5" />,
      },
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
      { key: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
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


      {
        key: "kyc",
        label: "KYC Verification",
        icon: <Shield className="w-5 h-5" />,
      },


      {
        key: "pricing",
        label: "Pricing Plans",
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        key: "subscriptions",
        label: "Subscriptions",
        icon: <CreditCard className="w-5 h-5" />,
      },

    ];

  // Filter nav items to show only KYC and Profile if KYC is not approved
  const filteredNavItems = isKycApproved
    ? navItems
    : navItems.filter((item) => item.key === "kyc" || item.key === "profile");

  return (
    <DashboardSidebar
      navItems={filteredNavItems}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onLogout={onLogout}
      variant="dark"
      userName={recruiter?.full_name}
      showChevron={false}
    />
  );
}
