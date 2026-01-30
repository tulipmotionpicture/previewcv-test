"use client";

import Image from "next/image";
import { ChevronRight, User } from "lucide-react";
import config from "@/config";
import Link from "next/link";

interface NavItem<T extends string> {
    key: T;
    label: string;
    icon: React.ReactNode;
}

interface DashboardSidebarProps<T extends string> {
    navItems: NavItem<T>[];
    activeTab: T;
    onTabChange: (tab: T) => void;
    onLogout: () => void;
    variant?: "light" | "dark";
    userName?: string | null;
    showChevron?: boolean;
}

export default function DashboardSidebar<T extends string>({
    navItems,
    activeTab,
    onTabChange,
    onLogout,
    variant = "light",
    userName,
    showChevron = false,
}: DashboardSidebarProps<T>) {
    const isDark = variant === "dark";

    return (
        <aside
            className={`w-72 min-h-screen p-6 sticky top-0 h-screen flex flex-col transition-colors duration-300 ${isDark
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                : "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
                }`}
        >
            {/* Logo Section */}
            <div className="mb-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 pb-4">
                <Link href="/">
                    <Image
                        src={config.app.logoUrl}
                        alt={config.app.name}
                        width={160}
                        objectFit="contain"
                        height={isDark ? 160 : 40}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${isDark ? "space-y-1" : "space-y-2"}`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => onTabChange(item.key)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm flex items-center ${showChevron ? "justify-between" : "gap-3"
                                } group ${isDark
                                    ? isActive
                                        ? "text-white"
                                        : "text-gray-400 hover:bg-gray-100/5 hover:text-gray-300"
                                    : isActive
                                        ? "text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-[#163c3d]/5 dark:hover:bg-[#163c3d]/10 hover:text-[#163c3d] dark:hover:text-[#163c3d]"
                                }`}
                            style={isActive ? { backgroundColor: '#163c3d' } : {}}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`transition-colors ${isActive
                                        ? "text-white"
                                        : isDark
                                            ? "text-gray-400 group-hover:text-gray-300"
                                            : "text-gray-400 dark:text-gray-500 group-hover:text-[#163c3d] dark:group-hover:text-[#163c3d]"
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {showChevron && (
                                <ChevronRight
                                    className={`w-4 h-4 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                                        }`}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Section (only for dark variant with userName) */}
            {isDark && userName && (
                <div className="mt-auto pt-6 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center">
                            {userName ? (
                                <span className="text-sm font-semibold text-white">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <User className="w-5 h-5 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {userName}
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
            )}
        </aside>
    );
}
