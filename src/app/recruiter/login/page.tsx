"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import {
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function RecruiterLogin() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useRecruiterAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("RecruiterLogin: Auth state:", {
      isAuthenticated,
      authLoading,
    });
    if (!authLoading && isAuthenticated) {
      console.log("RecruiterLogin: Redirecting to dashboard");
      router.push("/recruiter/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/recruiter/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(
          err.message ||
            "Authentication failed. Check your access credentials.",
        );
      } else {
        setError("Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-300">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-mint dark:bg-gray-900  overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0">
          <Image
            src="/sable-flow-o-6GhmpELnw-unsplash 1.png"
            alt="Recruitment team"
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
              Recruiter
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-md">
              Access your hiring dashboard and continue building your dream
              team.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Access Live Resumes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Preview candidate profiles in real-time from LetsMakeCV
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Track Your Pipeline
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage applications and hiring progress in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Free to Start
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No credit card required. Start hiring immediately
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                500+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Companies
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
              Access your hiring dashboard
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
                placeholder="recruiter@company.com"
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
              <Link
                href="/recruiter/password-reset"
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

            <p className="text-center text-gray-600 dark:text-gray-400">
              New recruiter?{" "}
              <Link
                href="/recruiter/signup"
                className="text-teal-dark dark:text-mint font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
