import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";

interface CandidateHeaderProps {
  user?: {
    full_name?: string;
    // add other user fields if needed
  };
  logout: () => void;
}

export default function CandidateHeader({
  user,
  logout,
}: CandidateHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains((e as MouseEvent).target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={120}
              height={120}
              className="h-10 w-auto"
            />
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href={"/jobs"}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all`}
            >
              Explore Jobs
            </Link>
            <Link
              href="/candidate/dashboard?tab=applications"
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all`}
            >
              My Applications
            </Link>
            <Link
              href="/candidate/dashboard?tab=resumes"
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all`}
            >
              My Resumes
            </Link>
          </nav>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div
              className="relative hidden md:flex items-center gap-3"
              ref={dropdownRef}
            >
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {user?.full_name || "Candidate"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Job Seeker
                </p>
              </div>
              <button
                type="button"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer focus:outline-none"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((v) => !v)}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(true)}
              >
                {user?.full_name?.charAt(0).toUpperCase() || "C"}
              </button>
              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-12 z-20 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg min-w-[160px] py-2"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    href="/candidate/dashboard"
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/candidate/settings"
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/candidate/profile"
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* Mobile: show just logout for now */}
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors md:hidden"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
