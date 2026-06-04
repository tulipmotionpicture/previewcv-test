"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();

    const [status, setStatus] = useState<
        "idle" | "loading" | "verified" | "error"
    >("idle");

    const [message, setMessage] = useState("");

    const token = searchParams.get("token");
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Missing verification token. Please check the link.");
            return;
        }

        if (hasAttemptedRef.current) return;
        hasAttemptedRef.current = true;

        const verifyEmail = async () => {
            setStatus("loading");

            try {
                const response = await api.verifyRecrutererification(token);
                setStatus("verified");
                setMessage(
                    response?.message || "Your email has been successfully verified!"
                );
                toast.success(response?.message || "Email verified successfully!");
                setTimeout(() => {
                    router.push("/candidate/login");
                }, 3000);
            } catch (e: any) {
                setStatus("error");
                setMessage(
                    e?.message || "Failed to verify email. Please try again or contact support."
                );
            }
        };

        verifyEmail();
    }, [token, router, toast]);

    const handleResendVerification = () => {
        toast.info(
            "Please login again to resend verification email or contact support."
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-md p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <span className="text-3xl">✉️</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Verify Your Email
                    </h1>
                </div>


                {/* Loading */}
                {status === "loading" && (
                    <div className="text-center py-8">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

                        <p className="text-gray-500 dark:text-gray-400">
                            Verifying your email...
                        </p>
                    </div>
                )}


                {/* Success */}
                {status === "verified" && (
                    <div className="text-center py-8">

                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <span className="text-3xl">✅</span>
                        </div>

                        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            Email Verified!
                        </h2>

                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            {message}
                        </p>

                        <Link
                            href="/candidate/login"
                            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 transition"
                        >
                            Go to Login
                        </Link>

                    </div>
                )}


                {/* Error */}
                {status === "error" && (
                    <div className="space-y-5 py-8">

                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                            <div className="flex gap-2 items-center mb-2">
                                <span>❌</span>

                                <h3 className="font-semibold text-red-700 dark:text-red-400">
                                    Verification Failed
                                </h3>
                            </div>

                            <p className="text-sm text-red-600 dark:text-red-300">
                                {message}
                            </p>
                        </div>


                        <button
                            onClick={handleResendVerification}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            Resend Verification Email
                        </button>


                        <Link
                            href="/candidate/login"
                            className="block text-center text-sm text-blue-600 hover:underline"
                        >
                            Already verified? Go to Login
                        </Link>

                    </div>
                )}

            </div>
        </div>
    );
}

function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

export default VerifyEmailPage;