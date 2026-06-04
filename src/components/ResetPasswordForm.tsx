"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";

type Variant = "recruiter" | "candidate";

function ResetPasswordInner({ variant }: { variant: Variant }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginHref =
    variant === "recruiter" ? "/recruiter/login" : "/candidate/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (variant === "recruiter") {
        await api.recruiterPasswordConfirm(token, newPassword);
      } else {
        await api.confirmPasswordReset(token, newPassword);
      }
      setSuccess(true);
      setTimeout(() => router.push(loginHref), 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant={variant}
      heading="Set New Password"
      subheading="Choose a new password for your account."
    >
      {success ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800 text-center font-medium">
          Password reset successful! Redirecting to login…
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pr-12"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
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

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pr-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
              <AlertTriangle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-dark hover:bg-teal-dark/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-dark/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Set New Password
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

/**
 * Shared "set a new password" form for recruiter & candidate password-reset
 * emails. Reads the `token` from the URL query, validates the new password,
 * and calls the matching confirm endpoint via the api client.
 *   - recruiter → POST /api/v1/recruiters/auth/password-reset/confirm
 *   - candidate → POST /api/v1/auth/password-reset/confirm
 */
export default function ResetPasswordForm({ variant }: { variant: Variant }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
        </div>
      }
    >
      <ResetPasswordInner variant={variant} />
    </Suspense>
  );
}
