"use client";

import {
    Briefcase,
    FileText,
    User,
    Settings,
    LogOut,
    LayoutDashboard,
} from "lucide-react";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";

export type CandidateDashboardTab = "overview" | "applications" | "resumes" | "profile" | "settings";

interface CandidateSidebarProps {
    activeTab: CandidateDashboardTab;
    onTabChange: (tab: CandidateDashboardTab) => void;
    onLogout: () => void;
}

export default function CandidateSidebar({
    activeTab,
    onTabChange,
    onLogout,
}: CandidateSidebarProps) {
    const { user } = useAuth();

    const navItems: {
        key: CandidateDashboardTab;
        label: string;
        icon: React.ReactNode;
    }[] = [
            {
                key: "overview",
                label: "Overview",
                icon: <LayoutDashboard className="w-5 h-5" />,
            },
            {
                key: "applications",
                label: "My Application",
                icon: <Briefcase className="w-5 h-5" />,
            },
            {
                key: "resumes",
                label: "My Resume",
                icon: <FileText className="w-5 h-5" />,
            },
            {
                key: "profile",
                label: "Profile",
                icon: <User className="w-5 h-5" />,
            },
            {
                key: "settings",
                label: "Settings",
                icon: <Settings className="w-5 h-5" />,
            },
        ];

    return (
        <DashboardSidebar
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onLogout={onLogout}
            variant="dark"
            userName={user?.full_name}
            showChevron={false}
        />
    );
}
