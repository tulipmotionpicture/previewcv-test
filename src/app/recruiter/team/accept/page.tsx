"use client";

// Team invitation link from the backend email:
//   https://previewcv.com/recruiter/team/accept?token=...
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { teamApi } from "@/lib/teamApi";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import type { InvitePreview } from "@/types/team";

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

function AcceptInner() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const { signInWithTokens } = useRecruiterAuth();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadError("This invitation link is incomplete.");
      return;
    }
    teamApi
      .invitePreview(token)
      .then((i) => {
        setInvite(i);
        setFullName(i.full_name);
      })
      .catch((e) => setLoadError(e?.message || "This invitation link is invalid or has expired."));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!invite?.has_account) {
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirm) return setError("Passwords do not match.");
    } else if (!password) {
      return setError("Enter your password.");
    }
    setBusy(true);
    try {
      const r = await teamApi.acceptInvite(token, password, fullName.trim() || undefined);
      await signInWithTokens(r.access_token, r.refresh_token);
      router.push("/recruiter/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't accept the invitation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      variant="recruiter"
      brandTitle={["Join Your", "Hiring Team"]}
      heading={invite?.company_name ? `Join ${invite.company_name}` : "Join your team"}
      subheading={
        !invite
          ? "Accept your invitation."
          : invite.has_account
            ? `You've been invited as ${invite.role_name}. Sign in with your PreviewCV team password to join. You'll keep access to your other companies.`
            : `You've been invited as ${invite.role_name}. Set a password to get started.`
      }
    >
      {loadError ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800 flex gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{loadError} Ask your admin to resend the invitation.</span>
        </div>
      ) : !invite ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-dark" />
        </div>
      ) : (
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Work email</label>
            <input className={inputCls} value={invite.email} disabled />
          </div>
          {!invite.has_account && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Your name</label>
              <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          )}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Password</label>
            <input
              className={`${inputCls} pr-12`}
              type={show ? "text" : "password"}
              autoComplete={invite.has_account ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={invite.has_account ? "Your team password" : "At least 8 characters"}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((v) => !v)}
              className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {invite.has_account ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Forgot it?{" "}
              <Link href="/recruiter/password-reset" className="text-teal-dark dark:text-mint font-semibold">
                Reset your password
              </Link>
            </p>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Confirm password</label>
              <input
                className={inputCls}
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-teal-dark hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-60"
          >
            {busy ? "Joining…" : "Accept and sign in"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function AcceptTeamInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark" />
        </div>
      }
    >
      <AcceptInner />
    </Suspense>
  );
}
