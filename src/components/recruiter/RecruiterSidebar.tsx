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
  Search,
  FolderOpen,
  PlusCircle,
  Users,
} from "lucide-react";
import CompanySwitcher from "@/components/recruiter/CompanySwitcher";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import { Recruiter, KycStatus } from "@/types/api";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";

export type DashboardTab =
  | "stats"
  | "ats"
  | "gallery"
  | "galleryEvents"
  | "profile"
  | "jobs"
  | "kyc"
  | "subscriptions"
  | "pricing"
  | "cvSearch"
  | "buckets"
  | "createJob"
  | "team";

/**
 * Permission a team member needs to see each tab (the owner sees everything).
 * Tabs not listed are open to every member.
 */
export const TAB_PERMISSION: Partial<Record<DashboardTab, string>> = {
  stats: "analytics.view",
  ats: "applicants.view",
  jobs: "jobs.view",
  createJob: "jobs.create",
  cvSearch: "cv.search",
  buckets: "buckets.view",
  profile: "company.edit",
  gallery: "company.edit",
  galleryEvents: "company.edit",
  kyc: "kyc.manage",
  pricing: "billing.manage",
  subscriptions: "billing.view",
};

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
  const { actor, isTeamMember, can } = useRecruiterAuth();
  const allowed = (key: DashboardTab) => {
    const perm = TAB_PERMISSION[key];
    return !perm || can(perm);
  };

  const primaryNavItems: {
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
        key: "createJob",
        label: "Create Jobs",
        icon: <PlusCircle className="w-5 h-5" />,
      },
      {
        key: "cvSearch",
        label: "CV Search",
        icon: <Search className="w-5 h-5" />,
      },
      {
        key: "buckets",
        label: "Buckets",
        icon: <FolderOpen className="w-5 h-5" />,
      },
      { key: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
      {
        key: "gallery",
        label: "Public Profile",
        icon: <ImageIcon className="w-5 h-5" />,
      },
      {
        key: "galleryEvents",
        label: "Events & Happenings",
        icon: <Calendar className="w-5 h-5" />,
      },
    ];

  const secondaryNavItems: {
    key: DashboardTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
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
      {
        key: "team",
        label: "Team",
        icon: <Users className="w-5 h-5" />,
      },
    ];

  // Filter nav items to show only KYC and Profile if KYC is not approved
  const filteredPrimary = (isKycApproved
    ? primaryNavItems
    : primaryNavItems.filter((item) => item.key === "profile")
  ).filter((item) => allowed(item.key));

  const filteredSecondary = (isKycApproved
    ? secondaryNavItems
    : secondaryNavItems.filter((item) => item.key === "kyc" || item.key === "team")
  ).filter((item) => allowed(item.key));

  const companyName = recruiter?.company_name || recruiter?.full_name || "Company";

  return (
    <DashboardSidebar
      navItems={filteredPrimary}
      secondaryNavItems={filteredSecondary}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onLogout={onLogout}
      variant="dark"
      userName={isTeamMember && actor ? actor.name : companyName}
      userSubtitle={isTeamMember && actor ? `${actor.role_name} · ${companyName}` : recruiter?.email}
      userAvatarUrl={recruiter?.company_logo_url}
      showChevron={false}
      userExtra={<CompanySwitcher />}
    />
  );
}
