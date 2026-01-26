"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Briefcase,
  Target,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function CandidateLogin() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/candidate/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/candidate/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Invalid credentials. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-300">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-mint dark:bg-gray-900 relative overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0">
          <Image
            src="/sable-flow-o-6GhmpELnw-unsplash 2.png"
            alt="Job seeker"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="inline-block mb-12">
              <Image
                src={config.app.logoUrl}
                alt={config.app.name}
                width={150}
                height={40}
                className="object-contain"
              />
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Welcome Back
              <br />
              Job Seeker
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-md">
              Sign in to access your profile and connect with top employers.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Share Your Resume
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create your profile and share it with a simple link
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Get Discovered
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Be found by recruiters looking for talent like you
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Stay Updated
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep your profile current and stand out from the crowd
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                50k+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                10k+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hires Made
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[480px] my-8">
          <div className="lg:hidden mb-8">
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={120}
              height={32}
              className="object-contain"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access your candidate account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
              <AlertTriangle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-teal-dark focus:ring-teal-dark dark:focus:ring-mint"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-sm text-teal-dark dark:text-mint font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-teal-dark hover:bg-teal-dark/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-dark/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => api.candidateSocialLogin("google")}
                className="flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => api.candidateSocialLogin("linkedin")}
                className="flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="h-5 w-5 mr-2 text-[#0A66C2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
              New to PreviewCV?{" "}
              <Link
                href="/candidate/signup"
                className="text-teal-dark dark:text-mint font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
