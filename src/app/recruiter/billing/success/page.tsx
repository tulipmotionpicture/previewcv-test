"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import type { SubscriptionDashboard } from "@/types/api";

type Status = "pending" | "ready" | "timeout";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_DURATION_MS = 30000;

function BillingSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const type = (params.get("type") as "job" | "cv" | null) || "job";

  const [status, setStatus] = useState<Status>("pending");
  const [dashboard, setDashboard] = useState<SubscriptionDashboard | null>(null);

  /**
   * Poll the subscription dashboard until the relevant Paddle id appears.
   * Paddle webhooks land on the backend asynchronously; this normally
   * resolves within a few seconds.
   */
  const poll = useCallback(async () => {
    const deadline = Date.now() + MAX_POLL_DURATION_MS;

    while (Date.now() < deadline) {
      try {
        const data = await api.getSubscriptionDashboard();
        setDashboard(data);
        const matched =
          type === "cv"
            ? !!data?.cv_subscription?.paddle_transaction_id ||
              !!data?.cv_subscription?.paddle_subscription_id
            : !!data?.job_subscription?.paddle_subscription_id;
        if (matched) {
          setStatus("ready");
          return;
        }
      } catch (err) {
        console.warn("[billing/success] poll error", err);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    setStatus("timeout");
  }, [type]);

  useEffect(() => {
    void poll();
  }, [poll]);

  const goToDashboard = () => {
    router.replace("/recruiter/dashboard?tab=subscriptions");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
        {status === "pending" && (
          <>
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
              <Loader2 className="w-7 h-7 text-primary-blue dark:text-blue-400 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Activating your {type === "cv" ? "CV credits" : "subscription"}…
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Payment received. We&apos;re finalising your account — this
              usually takes just a few seconds.
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              You&apos;re all set!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {type === "cv"
                ? `${dashboard?.cv_subscription?.credits_remaining ?? 0} CV credits are now available.`
                : `Your ${dashboard?.job_subscription?.plan_config?.name || "Job"} plan is active.`}
            </p>
            <button
              onClick={goToDashboard}
              className="w-full px-4 py-2.5 bg-primary-blue hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Go to dashboard
            </button>
          </>
        )}

        {status === "timeout" && (
          <>
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/30 mb-4">
              <AlertTriangle className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Almost there
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your payment was received but it&apos;s taking a moment to reflect
              on your account. Refresh the dashboard in a minute, or contact
              support if it doesn&apos;t appear.
            </p>
            <button
              onClick={goToDashboard}
              className="w-full px-4 py-2.5 bg-primary-blue hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
        </div>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
