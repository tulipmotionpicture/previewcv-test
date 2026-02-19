"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import config from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";

interface HeaderLink {
    label: string;
    href: string;
}

interface FloatingHeaderProps {
    links?: HeaderLink[];
    cta?: {
        label: string;
        href: string;
        variant?: "primary" | "secondary" | "dark";
    };
    logoHref?: string;
    showAuthButtons?: boolean;
    logoSrc?: string;
    hideOnScroll?: boolean;
}

const NAV_ITEMS = [
    { label: "Top Hiring Partner", href: "/hiring-partners" },
    { label: "Create Resume", href: "/resume/build" },
    { label: "Create CV", href: "/cover-letter/create" },
    { label: "Jobs", href: "/jobs" },
    { label: "Blogs", href: "/blog" },
];

export default function FloatingHeader({
    links = [],
    cta,
    logoHref = "/",
    showAuthButtons = false,
    logoSrc,
    hideOnScroll = false,
}: FloatingHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const {
        user: candidateUser,
        isAuthenticated: isCandidateAuth,
        logout: candidateLogout,
        loading: candidateLoading,
    } = useAuth();
    const {
        recruiter: recruiterUser,
        isAuthenticated: isRecruiterAuth,
        logout: recruiterLogout,
        loading: recruiterLoading,
    } = useRecruiterAuth();

    const isAuthenticated = isCandidateAuth || isRecruiterAuth;
    const isLoading = candidateLoading || recruiterLoading;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        // Check initial scroll
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        try {
            if (isCandidateAuth) {
                await candidateLogout();
                router.push("/candidate/login");
            } else if (isRecruiterAuth) {
                await recruiterLogout();
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const dashboardLink = isRecruiterAuth ? "/recruiter/dashboard" : "/candidate/dashboard";
    const userDisplayName = isRecruiterAuth ? recruiterUser?.display_name || recruiterUser?.company_name : candidateUser?.full_name;
    const userProfileImage = isRecruiterAuth ? recruiterUser?.profile_url : null;

    return (
        <>
            <nav
                className={`fixed z-50 transition-all duration-300 ${scrolled
                    ? hideOnScroll
                        ? "-translate-y-full opacity-0 pointer-events-none"
                        : "top-2 left-1/2 -translate-x-1/2 w-full max-w-[95%] md:max-w-4xl"
                    : "top-0 left-0 right-0 w-full max-w-full"
                    }`}
            >
                <div
                    className={`bg-white/95 backdrop-blur-xl px-4 md:px-6 py-3 border-gray-100 flex items-center justify-between transition-all duration-300 ${scrolled
                        ? "rounded-full shadow-lg border"
                        : "rounded-none shadow-sm border-b"
                        }`}
                >
                    {/* Logo */}
                    <Link
                        href={logoHref}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <Image
                            src={logoSrc || config.app.logoUrl}
                            alt={config.app.name}
                            width={120}
                            height={36}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {showAuthButtons && (
                            <>
                                {!isLoading && isAuthenticated ? (
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                                        >
                                            <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                                                {userDisplayName?.split(' ')[0]}
                                            </span>
                                            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm flex items-center justify-center">
                                                {userProfileImage ? (
                                                    <Image
                                                        src={userProfileImage}
                                                        alt="Profile"
                                                        width={32}
                                                        height={32}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={16} className="text-gray-500" />
                                                )}
                                            </div>
                                        </button>

                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                <div className="px-4 py-3 border-b border-gray-50">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {userDisplayName || "User"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {isRecruiterAuth ? recruiterUser?.email : candidateUser?.email}
                                                    </p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href={dashboardLink}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <LayoutDashboard size={16} />
                                                        Dashboard
                                                    </Link>
                                                </div>
                                                <div className="py-1 border-t border-gray-50">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <LogOut size={16} />
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        {links.map(link => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                            >
                                                {link.label.replace(' Login', '')}
                                            </Link>
                                        ))}

                                        {cta && (
                                            <Link
                                                href={cta.href}
                                                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg transition-all hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 whitespace-nowrap"
                                            >
                                                {cta.label}
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        {/* We can show minimal auth on mobile if needed, but keeping it simple */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Sidebar (Right Side) */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm md:hidden animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="fixed top-0 right-0 h-full w-[280px] bg-white z-[9999] shadow-2xl p-5 flex flex-col gap-6 animate-in slide-in-from-right duration-300 md:hidden overflow-y-auto">
                        <div className="flex justify-between items-center px-1">
                            <Image
                                src={logoSrc || config.app.logoUrl}
                                alt={config.app.name}
                                width={100}
                                height={30}
                                className="h-7 w-auto object-contain"
                            />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {/* Add auth links to mobile menu if not authenticated */}
                            {!isAuthenticated && links.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-gray-100" />

                        {isAuthenticated ? (
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={dashboardLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl w-full text-left"
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mt-auto">
                                {cta && (
                                    <Link
                                        href={cta.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full text-center py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20"
                                    >
                                        {cta.label}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
