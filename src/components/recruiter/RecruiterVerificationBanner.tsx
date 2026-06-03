"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { recruiterNeedsVerification } from "@/lib/recruiterVerification";

/**
 * Persistent, non-dismissible banner shown at the top of every page while a
 * logged-in recruiter has not verified their email. Offers a "Resend
 * verification email" action with a 60s cooldown.
 */
export default function RecruiterVerificationBanner() {
  const { recruiter, loading } = useRecruiterAuth();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((c) => (c <= 1 ? 0 : c - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [cooldown]);

  if (loading || !recruiterNeedsVerification(recruiter)) return null;

  const handleResend = async () => {
    if (sending || cooldown > 0 || !recruiter?.email) return;
    setSending(true);
    try {
      await api.resendRecruiterVerification(recruiter.email);
      showToast("Verification email sent. Please check your inbox.", "success");
      setCooldown(60);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Could not send the verification email. Please try again.";
      showToast(msg, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center">
        <Mail className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="text-sm text-amber-800 dark:text-amber-100">
          Please verify your email
          {recruiter?.email ? ` (${recruiter.email})` : ""} to start posting jobs.
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={sending || cooldown > 0}
          className="text-sm font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60 dark:text-amber-100 dark:hover:text-white"
        >
          {sending
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend verification email"}
        </button>
      </div>
    </div>
  );
}
