"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import config from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Settings } from "lucide-react";

interface HeaderLink {
  label: string;
  href: string;
}

interface HeaderProps {
  links?: HeaderLink[]; // Kept for backward compatibility but mostly ignored for main nav
  cta?: {
    label: string;
    href: string;
    variant?: "primary" | "secondary" | "dark";
  };
  logoHref?: string;
  showAuthButtons?: boolean;
}

const NAV_ITEMS = [
  {
    label: "Services",
    href: "#", // Dropdown trigger
    dropdown: [
      { label: "Create Resume", href: "/resume/build" },
      { label: "Create CV", href: "/cover-letter/create" },
    ],
  },
  { label: "Blogs", href: "/blog" },
  { label: "Jobs", href: "/jobs" },
];

export default function Header({
  links = [],
  cta,
  logoHref = "/",
  showAuthButtons = false,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false); // For mobile
  const profileRef = useRef<HTMLDivElement>(null);

  // Auth contexts
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  // Recruiter has profile_url, Candidate might not have one in types yet, using placeholder if null
  const userProfileImage = isRecruiterAuth ? recruiterUser?.profile_url : null;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
        ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-gray-100 dark:border-gray-800 shadow py-3"
        : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-transparent shadow-sm py-2"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link
            href={logoHref}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={160}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation - Moved next to Logo */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              if (item.dropdown) {
                return (
                  <div key={item.label} className="relative group">
                    <button className="flex items-center gap-1 text-sm font-semibold text-black dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors py-2">
                      {item.label}
                      <ChevronDown size={14} />
                    </button>
                    <div className="absolute top-full left-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors ${pathname === item.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Auth Section - Kept on Right */}
        <div className="hidden md:flex items-center gap-4">
          {showAuthButtons && (
            <>
              {!isLoading && isAuthenticated ? (
                // Profile Dropdown
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative flex items-center gap-3 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-300 transition-all duration-200 bg-white dark:bg-gray-800 focus:outline-none"
                  >
                    <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-transparent">
                      {userProfileImage ? (
                        <Image
                          src={userProfileImage}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-gray-600 dark:text-gray-300 text-xs">
                          {userDisplayName?.slice(0, 2).toUpperCase() || <User size={16} />}
                        </span>
                      )}
                    </div>

                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {userDisplayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {isRecruiterAuth ? recruiterUser?.email : candidateUser?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={dashboardLink}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                      </div>
                      <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : !isLoading && !isAuthenticated ? (
                // Login / Signup / CTA
                <div className="flex items-center gap-4">
                  {/* Render passed links if any (often Login links) */}
                  {links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {cta && (
                    <Link
                      href={cta.href}
                      className={`px-6 py-2.5 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${cta.variant === "primary"
                        ? "bg-[#0CA0E8] hover:bg-[#0b8rcd] shadow-sky-500/20"
                        : cta.variant === "dark"
                          ? "bg-gray-900 hover:bg-gray-800 shadow-gray-900/20"
                          : cta.variant === "secondary"
                            ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                            : "bg-[#0CA0E8]"
                        }`}
                    >
                      {cta.label}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              )}
            </>
          )}

          {/* Allow basic CTA even if auth buttons hidden, for flexibility */}
          {!showAuthButtons && cta && (
            <Link
              href={cta.href}
              className={`px-6 py-2.5 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl ${cta.variant === "primary" ? "bg-[#0CA0E8]" : "bg-gray-900"}`}
            >
              {cta.label}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {/* Show Profile on Mobile Header too if auth? Or keep in menu? Usually menu. */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg py-4 px-6 flex flex-col space-y-4 animate-in slide-in-from-top-2 duration-200 text-left">
          {NAV_ITEMS.map((item) => {
            if (item.dropdown) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className="flex w-full items-center justify-between text-base font-semibold text-gray-700 dark:text-gray-300 py-2"
                  >
                    {item.label}
                    <ChevronDown size={16} className={`transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isServicesOpen && (
                    <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-700 my-2 flex flex-col gap-2">
                      {item.dropdown.map(subItem => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block py-1 text-sm text-gray-600 dark:text-gray-400"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
              >
                {item.label}
              </Link>
            );
          })}

          {showAuthButtons && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              {!isLoading && isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {userProfileImage ? (
                        <Image src={userProfileImage} alt="Profile" width={40} height={40} className="object-cover" />
                      ) : (
                        <span className="font-bold text-gray-600">{userDisplayName?.slice(0, 2).toUpperCase() || "ME"}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{userDisplayName}</p>
                      <p className="text-xs text-gray-500">{isRecruiterAuth ? recruiterUser?.email : candidateUser?.email}</p>
                    </div>
                  </div>
                  <Link
                    href={dashboardLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 py-2 text-sm font-medium text-red-600"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center w-full py-2 text-sm font-semibold text-gray-600"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {cta && (
                    <Link
                      href={cta.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-full"
                    >
                      {cta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}