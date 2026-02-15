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
    {
        label: "Services",
        href: "#",
        dropdown: [
            { label: "Create Resume", href: "/resume/build" },
            { label: "Create CV", href: "/cover-letter/create" },
        ],
    },
    { label: "Blogs", href: "/blog" },
    { label: "Jobs", href: "/jobs" },
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
    const [isServicesOpen, setIsServicesOpen] = useState(false);
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

    // ... existing handlers ...

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
        <nav
            className={`fixed z-50 transition-all duration-300 ${scrolled
                ? hideOnScroll
                    ? "-translate-y-full opacity-0 pointer-events-none"
                    : "top-2 left-1/2 -translate-x-1/2 w-full max-w-[90%] md:max-w-4xl"
                : "top-0 left-0 right-0 w-full max-w-full"
                }`}
        >
            <div
                className={`bg-white/95 backdrop-blur-xl px-6 py-3 border-gray-100 flex items-center justify-between transition-all duration-300 ${scrolled
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
                <div className="hidden md:flex items-center gap-8">
                    {NAV_ITEMS.map((item) => {
                        if (item.dropdown) {
                            return (
                                <div key={item.label} className="relative group">
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black transition-colors py-2">
                                        {item.label}
                                        <ChevronDown size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 overflow-hidden">
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                            >
                                {item.label}
                            </Link>
                        );
                    })}
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
                                <div className="flex items-center gap-6">
                                    {/* Login Links as Text */}
                                    {links.map(link => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                        >
                                            {link.label.replace(' Login', '')}
                                            {/* Simplify 'Candidate Login' to just 'Candidate' if needed, but 'Login' might be clearer.
                             User image showed simple links. I'll keep full label but style minimally. 
                             Actually, let's just show one 'Login' dropdown or similar? 
                             Or strictly follow the image "Get started" button and maybe a Log In text?
                             Let's stick to what was passed but style them simple.
                         */}
                                        </Link>
                                    ))}

                                    {cta && (
                                        <Link
                                            href={cta.href}
                                            className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full transition-all hover:bg-gray-800 shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5"
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
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 hover:text-black transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
                    {NAV_ITEMS.map((item) => (
                        <React.Fragment key={item.label}>
                            {item.dropdown ? (
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                                        className="flex items-center justify-between w-full p-2 text-sm font-semibold text-gray-800 rounded-lg hover:bg-gray-50"
                                    >
                                        {item.label}
                                        <ChevronDown size={16} className={`transition-transformDuration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isServicesOpen && (
                                        <div className="pl-4 flex flex-col mt-1 border-l-2 border-gray-100 ml-2">
                                            {item.dropdown.map(subItem => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="p-2 text-sm text-gray-600 hover:text-black"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-sm font-semibold text-gray-800 rounded-lg hover:bg-gray-50"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </React.Fragment>
                    ))}

                    <div className="h-px bg-gray-100 my-2" />

                    {isAuthenticated ? (
                        <div className="flex flex-col gap-2">
                            <Link
                                href={dashboardLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 p-2 text-sm font-semibold text-gray-800 rounded-lg hover:bg-gray-50"
                            >
                                <LayoutDashboard size={16} /> Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-2 p-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 w-full text-left"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 mt-1">
                            {links.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-center p-2 text-sm font-medium text-gray-600 hover:text-black"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {cta && (
                                <Link
                                    href={cta.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-center py-3 bg-black text-white text-sm font-bold rounded-xl"
                                >
                                    {cta.label}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
