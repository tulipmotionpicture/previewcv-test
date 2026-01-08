"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function RecruiterPasswordReset() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await api.recruiterResetPassword(email).then(() => {
        setSuccess(true);
      });
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 relative">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
            title="Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l9-9 9 9M4.5 10.5V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0010.5 21v-4.5h3V21a1.5 1.5 0 001.5 1.5h3A1.5 1.5 0 0019.5 21V10.5"
              />
            </svg>
            <span className="font-black text-lg">Home</span>
          </Link>
          <Link
            href="/recruiter/login"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-xs shadow-sm"
          >
            Back to Login
          </Link>
        </div>
        <h1 className="text-2xl font-black mb-4 text-gray-900 dark:text-gray-100">
          Recruiter Password Reset
        </h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400 text-sm">
          Enter your recruiter account email and we'll send you a password reset
          link.
        </p>
        {success ? (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-center">
            If an account exists for <span className="font-bold">{email}</span>,
            a password reset link has been sent.
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Send Reset Link</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
