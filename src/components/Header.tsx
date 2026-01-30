"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import config from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { Menu, X } from "lucide-react";

interface HeaderLink {
  label: string;
  href: string;
}

interface HeaderProps {
  links?: HeaderLink[];
  cta?: {
    label: string;
    href: string;
    variant?: "primary" | "secondary" | "dark";
  };
  logoHref?: string;
  showAuthButtons?: boolean; // New prop to control auth-aware behavior
}

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

  // Auth contexts
  const {
    isAuthenticated: isCandidateAuth,
    logout: candidateLogout,
    loading: candidateLoading,
  } = useAuth();
  const {
    isAuthenticated: isRecruiterAuth,
    logout: recruiterLogout,
    loading: recruiterLoading,
  } = useRecruiterAuth();

  const isAuthenticated = isCandidateAuth || isRecruiterAuth;
  const isLoading = candidateLoading || recruiterLoading;

  // Debug log
  useEffect(() => {
    if (showAuthButtons) {
      console.log("Header Auth State:", {
        isCandidateAuth,
        isRecruiterAuth,
        isAuthenticated,
        candidateLoading,
        recruiterLoading,
        isLoading,
      });
    }
  }, [
    showAuthButtons,
    isCandidateAuth,
    isRecruiterAuth,
    isAuthenticated,
    candidateLoading,
    recruiterLoading,
    isLoading,
  ]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Check initial scroll
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      if (isCandidateAuth) {
        await candidateLogout();
        router.push("/candidate/login");
      } else if (isRecruiterAuth) {
        await recruiterLogout();
        // RecruiterAuthContext already handles redirect
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
        ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-gray-100 dark:border-gray-800 shadow-sm py-3"
        : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-transparent py-2"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            // If showAuthButtons is enabled and any user is authenticated
            if (showAuthButtons && isAuthenticated) {
              // Candidate authenticated: show candidate dashboard, hide all login links
              if (isCandidateAuth && link.href === "/candidate/login") {
                return (
                  <Link
                    key="/candidate/dashboard"
                    href="/candidate/dashboard"
                    className={`text-sm font-semibold transition-colors ${pathname === "/candidate/dashboard"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    Dashboard
                  </Link>
                );
              }

              // Recruiter authenticated: show recruiter dashboard, hide all login links
              if (isRecruiterAuth && link.href === "/recruiter/login") {
                return (
                  <Link
                    key="/recruiter/dashboard"
                    href="/recruiter/dashboard"
                    className={`text-sm font-semibold transition-colors ${pathname === "/recruiter/dashboard"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    Dashboard
                  </Link>
                );
              }

              // Hide other auth-related links when authenticated
              if (
                link.href === "/candidate/login" ||
                link.href === "/recruiter/login" ||
                link.href === "/candidate/signup" ||
                link.href === "/recruiter/signup"
              ) {
                return null;
              }
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth-aware buttons */}
          {showAuthButtons && (
            <>
              {!isLoading && isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              ) : !isLoading && !isAuthenticated ? (
                <>
                  {cta && (
                    <Link
                      href={cta.href}
                      className={`px-6 py-3 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${cta.variant === "primary"
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
                </>
              ) : (
                // Loading state - show skeleton or nothing
                <div className="w-24 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              )}
            </>
          )}

          {/* Non-auth-aware button (default behavior) */}
          {!showAuthButtons && cta && (
            <Link
              href={cta.href}
              className={`px-6 py-3 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${cta.variant === "primary"
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg py-4 px-6 flex flex-col space-y-4 animate-in slide-in-from-top-2 duration-200">
          {links.map((link) => {
            // If showAuthButtons is enabled and any user is authenticated
            if (showAuthButtons && isAuthenticated) {
              // Candidate authenticated: show candidate dashboard, hide all login links
              if (isCandidateAuth && link.href === "/candidate/login") {
                return (
                  <Link
                    key="/candidate/dashboard"
                    href="/candidate/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-semibold transition-colors py-2 ${pathname === "/candidate/dashboard"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    Dashboard
                  </Link>
                );
              }

              // Recruiter authenticated: show recruiter dashboard, hide all login links
              if (isRecruiterAuth && link.href === "/recruiter/login") {
                return (
                  <Link
                    key="/recruiter/dashboard"
                    href="/recruiter/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-semibold transition-colors py-2 ${pathname === "/recruiter/dashboard"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    Dashboard
                  </Link>
                );
              }

              // Hide other auth-related links when authenticated
              if (
                link.href === "/candidate/login" ||
                link.href === "/recruiter/login" ||
                link.href === "/candidate/signup" ||
                link.href === "/recruiter/signup"
              ) {
                return null;
              }
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-semibold transition-colors py-2 ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile Auth Buttons */}
          {showAuthButtons && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              {!isLoading && isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all shadow-md"
                >
                  Logout
                </button>
              ) : !isLoading && !isAuthenticated ? (
                <>
                  {cta && (
                    <Link
                      href={cta.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full text-center px-6 py-3 text-white text-sm font-bold rounded-full transition-all shadow-md ${cta.variant === "primary"
                        ? "bg-[#0CA0E8] hover:bg-[#0b8rcd]"
                        : cta.variant === "dark"
                          ? "bg-gray-900 hover:bg-gray-800"
                          : cta.variant === "secondary"
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-[#0CA0E8]"
                        }`}
                    >
                      {cta.label}
                    </Link>
                  )}
                </>
              ) : (
                <div className="w-full h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              )}
            </div>
          )}

          {/* Desktop Non-auth-aware button fallback for mobile */}
          {!showAuthButtons && cta && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={cta.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full block text-center px-6 py-3 text-white text-sm font-bold rounded-full transition-all shadow-md ${cta.variant === "primary"
                  ? "bg-[#0CA0E8] hover:bg-[#0b8rcd]"
                  : cta.variant === "dark"
                    ? "bg-gray-900 hover:bg-gray-800"
                    : cta.variant === "secondary"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-[#0CA0E8]"
                  }`}
              >
                {cta.label}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}