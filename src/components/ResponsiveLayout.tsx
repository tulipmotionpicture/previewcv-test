/**
 * Responsive Layout Component
 * Provides adaptive layout with mobile-first design
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import config from "@/config";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function ResponsiveLayout({
  children,
  title,
  showHeader = true,
  showFooter = true,
  className = "",
}: ResponsiveLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="flex items-center text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {config.app.logoUrl ? (
                    <Image
                      src={config.app.logoUrl}
                      alt="PreviewCV Logo"
                      width={200}
                      height={200}
                      className="w-50 h-50 object-contain"
                    />
                  ) : (
                    <span>📄 PreviewCV</span>
                  )}
                </button>
                {title && (
                  <>
                    <div className="hidden sm:block mx-3 text-gray-300">|</div>
                    <h1 className="hidden sm:block text-gray-700 font-medium truncate max-w-xs lg:max-w-md xl:max-w-lg">
                      {title}
                    </h1>
                  </>
                )}
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center space-x-2 md:space-x-4">
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {screenSize.toUpperCase()}
                </span>
              </div>

              {/* Mobile Menu Button */}
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMobileMenuOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden border-t border-gray-200 py-3">
                {title && (
                  <div className="px-2 py-2 text-sm text-gray-700 font-medium truncate">
                    {title}
                  </div>
                )}
                <div className="px-2 py-2 text-xs text-gray-500">
                  Screen: {screenSize}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 relative">{children}</main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span>Powered by PreviewCV</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Secure PDF Viewer</span>
              </div>

              <div className="flex items-center space-x-4">
                <span>Screen: {screenSize}</span>
                <span className="text-gray-300">•</span>
                <span>{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

/**
 * Responsive Container Component
 */
export function ResponsiveContainer({
  children,
  size = "full",
  className = "",
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Responsive Grid Component
 */
export function ResponsiveGrid({
  children,
  cols = 1,
  gap = 4,
  className = "",
}: {
  children: React.ReactNode;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
}) {
  let gridClasses = `grid gap-${gap}`;

  if (typeof cols === "number") {
    gridClasses += ` grid-cols-1 sm:grid-cols-${Math.min(cols, 2)} md:grid-cols-${Math.min(cols, 3)} lg:grid-cols-${cols}`;
  } else {
    const { sm = 1, md = 2, lg = 3, xl = 4 } = cols;
    gridClasses += ` grid-cols-1`;
    if (sm) gridClasses += ` sm:grid-cols-${sm}`;
    if (md) gridClasses += ` md:grid-cols-${md}`;
    if (lg) gridClasses += ` lg:grid-cols-${lg}`;
    if (xl) gridClasses += ` xl:grid-cols-${xl}`;
  }

  return <div className={`${gridClasses} ${className}`}>{children}</div>;
}

/**
 * Responsive Text Component
 */
export function ResponsiveText({
  children,
  size = "base",
  className = "",
}: {
  children: React.ReactNode;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}) {
  const sizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl",
    "3xl": "text-3xl sm:text-4xl",
  };

  return <div className={`${sizeClasses[size]} ${className}`}>{children}</div>;
}

/**
 * Hook for responsive breakpoints
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    breakpoint,
    windowSize,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
}
