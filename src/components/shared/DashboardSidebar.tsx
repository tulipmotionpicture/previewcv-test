"use client";

import Image from "next/image";
import { ChevronRight, User, LogOut } from "lucide-react";
import config from "@/config";
import Link from "next/link";

interface NavItem<T extends string> {
    key: T;
    label: string;
    icon: React.ReactNode;
}

interface DashboardSidebarProps<T extends string> {
    navItems: NavItem<T>[];
    secondaryNavItems?: NavItem<T>[]; // Added optional secondary items
    activeTab: T;
    onTabChange: (tab: T) => void;
    onLogout: () => void;
    variant?: "light" | "dark";
    userName?: string | null;
    showChevron?: boolean;
}

export default function DashboardSidebar<T extends string>({
    navItems,
    secondaryNavItems = [],
    activeTab,
    onTabChange,
    onLogout,
    variant = "light",
    userName,
    showChevron = false,
}: DashboardSidebarProps<T>) {
    const isDark = variant === "dark";

    const renderNavItems = (items: NavItem<T>[]) => (
        items.map((item) => {
            const isActive = activeTab === item.key;
            return (
                <button
                    key={item.key}
                    onClick={() => onTabChange(item.key)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all duration-150 text-xs flex items-center ${showChevron ? "justify-between" : "gap-3"
                        } group cursor-pointer ${isActive
                            ? "bg-[#0077FF] text-white"
                            : "text-[#90A5BA] dark:text-gray-400 hover:bg-[#0077FF]/20 dark:hover:bg-[#0369A1]/10 hover:text-white dark:hover:text-white"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className={`transition-colors duration-150 ${isActive
                                ? "text-white"
                                : "text-[#90A5BA] dark:text-gray-500 group-hover:text-white dark:group-hover:text-white"
                                }`}
                        >
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </div>
                    {showChevron && (
                        <ChevronRight
                            className={`w-4 h-4 transition-opacity duration-150 ${isActive
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-50"
                                }`}
                        />
                    )}
                </button>
            );
        })
    );

    return (
        <aside
            className={`w-56 min-h-screen p-4 sticky top-0 h-screen flex flex-col transition-colors duration-200 ${isDark
                ? "bg-[#0B172B] dark:bg-[#121111] text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800"
                : "bg-[#0B172B] dark:bg-[#121111] border-r border-gray-200 dark:border-gray-800"
                }`}
        >
            {/* Logo Section - Flat Design */}
            <div className="mb-4 flex items-center justify-center pb-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/" className="cursor-pointer">
                    <Image
                        src={config.app.logoUrl}
                        alt={config.app.name}
                        width={120}
                        height={32}
                        className="object-contain"
                    />
                </Link>
            </div>

            {/* Navigation - Flat Design */}
            <nav className="flex-1 overflow-y-auto flex flex-col gap-6 no-scrollbar">

                {/* Primary Items */}
                <div className="space-y-2">
                    {renderNavItems(navItems)}
                </div>

                {/* Secondary Items (Divider + Items) */}
                {secondaryNavItems.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Account & Plan
                        </div>
                        {renderNavItems(secondaryNavItems)}
                    </div>
                )}
            </nav>

            {/* User Profile Section - Flat Design */}
            {userName && (
                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                        {/* User Avatar - Flat Design */}
                        <div className="w-10 h-10 rounded-lg bg-[#0369A1] flex items-center justify-center flex-shrink-0">
                            {userName ? (
                                <span className="text-sm font-bold text-white">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                {userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Candidate
                            </p>
                        </div>
                    </div>
                    {/* Logout Button - Flat Design */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
}
