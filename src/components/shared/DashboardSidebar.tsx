"use client";

import Image from "next/image";
import { ChevronRight, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
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
    userSubtitle?: string;
    userAvatarUrl?: string;
    /** Enable a mobile hamburger + slide-in drawer (off by default). */
    mobileDrawer?: boolean;
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
    userSubtitle = "Candidate",
    userAvatarUrl,
    mobileDrawer = false,
}: DashboardSidebarProps<T>) {
    const isDark = variant === "dark";
    const [open, setOpen] = useState(false);

    const handleTabChange = (tab: T) => {
        onTabChange(tab);
        setOpen(false);
    };

    const renderNavItems = (items: NavItem<T>[]) => (
        items.map((item) => {
            const isActive = activeTab === item.key;
            return (
                <button
                    key={item.key}
                    onClick={() => handleTabChange(item.key)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all duration-150 text-xs flex items-center ${showChevron ? "justify-between" : "gap-3"
                        } group cursor-pointer ${isActive
                            ? "bg-primary-blue text-white"
                            : "text-black dark:text-gray-400 hover:bg-primary-blue-hover/10 dark:hover:bg-[#0369A1]/20 hover:text-primary-blue dark:hover:text-white"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className={`transition-colors duration-150 ${isActive
                                ? "text-white"
                                : "text-black dark:text-gray-500 group-hover:text-primary-blue dark:group-hover:text-white"
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

    const themeClasses = isDark
        ? "bg-white dark:bg-[#121111] text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800"
        : "bg-[#2F4269] dark:bg-[#121111] border-r border-gray-200 dark:border-gray-800";

    const asideClasses = mobileDrawer
        ? `fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 md:w-56 p-4 flex flex-col transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"} ${themeClasses}`
        : `w-56 min-h-screen p-4 sticky top-0 h-screen flex flex-col transition-colors duration-200 ${themeClasses}`;

    return (
        <>
            {/* Mobile hamburger (only when drawer enabled) */}
            {mobileDrawer && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                    className="md:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-[#2F4269] dark:bg-[#1E293B] text-white shadow-lg"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* Mobile overlay */}
            {mobileDrawer && open && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside className={asideClasses}>
            {/* Logo Section - Flat Design */}
            <div className="mb-4 flex items-center justify-between gap-2 pb-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/" className="cursor-pointer mx-auto md:mx-0">
                    <Image
                        src={config.app.logoUrl}
                        alt={config.app.name}
                        width={120}
                        height={32}
                        className="object-contain"
                    />
                </Link>
                {mobileDrawer && (
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                        className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
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
                        <div className="px-4 text-xs font-bold text-black uppercase tracking-wider mb-2">
                            Account & Plan
                        </div>
                        {renderNavItems(secondaryNavItems)}
                    </div>
                )}
            </nav>

            {/* User Profile Section - Flat Design */}
            {/* User Profile Section - Flat Design */}
            <div className="">
                {userName && (
                    <div className="bg-[#F8F9FA] dark:bg-[#1E293B] rounded-md p-2 flex flex-col gap-2.5 border border-[#E1E8F1] dark:border-gray-700 ">
                        <div className="flex items-center gap-2">
                            {/* User Avatar - Circle Design */}
                            <div className="w-9 h-9 rounded-sm bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-black dark:text-white font-bold text-sm border border-gray-100 dark:border-gray-600 overflow-hidden shadow-sm">
                                {userAvatarUrl ? (
                                    <Image
                                        src={userAvatarUrl}
                                        alt={userName}
                                        width={36}
                                        height={36}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    userName ? userName.slice(0, 2).toUpperCase() : <User size={16} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-[#111827] dark:text-gray-100 truncate leading-tight" title={userName}>
                                    {userName}
                                </p>

                            </div>
                        </div>

                        <div className="h-px bg-[#E1E8F1] dark:bg-gray-700 w-full" />

                        {/* Logout Button */}
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-2 px-1 py-0.5 text-[13px] font-bold text-[#FF4444] hover:text-[#FF2222] transition-colors duration-150 cursor-pointer"
                        >
                            <LogOut className="w-[15px] h-[15px]" strokeWidth={2.5} />
                            LogOut
                        </button>
                    </div>
                )}
            </div>
            </aside>
        </>
    );
}
