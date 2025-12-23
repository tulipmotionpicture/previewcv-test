"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { Job } from "@/types/api";
import Header from "@/components/Header";

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [jobType, setJobType] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (jobType) params.append("job_type", jobType);
      if (experienceLevel) params.append("experience_level", experienceLevel);
      if (location) params.append("location", location);
      if (remoteOnly) params.append("remote_only", "true");

      const response = await api.getJobs(params);
      if (response.items) {
        setJobs(response.items);
      } else if (response.jobs) {
        setJobs(response.jobs as Job[]);
      } else {
        setJobs([]);
      }
    } catch (err) {
      setError("Failed to load jobs. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [jobType, experienceLevel, location, remoteOnly]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const clearFilters = () => {
    setJobType("");
    setExperienceLevel("");
    setLocation("");
    setRemoteOnly(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      return `${formatCurrency(
        job.salary_min,
        job.salary_currency || "USD"
      )} - ${formatCurrency(job.salary_max, job.salary_currency || "USD")}`;
    }
    return "Competitive Salary";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <Header
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
      />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Active Opportunities
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Connect with the world&apos;s most innovative companies. Use your{" "}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              PreviewCV
            </span>{" "}
            profile to apply in one click.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Filter Jobs
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Remote Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Type
              </label>
              <div className="flex items-center h-10">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Remote Only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(jobType || experienceLevel || location || remoteOnly) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {jobType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    {jobType.replace("_", " ")}
                    <button
                      onClick={() => setJobType("")}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {experienceLevel && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                    {experienceLevel}
                    <button
                      onClick={() => setExperienceLevel("")}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                    📍 {location}
                    <button
                      onClick={() => setLocation("")}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {remoteOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                    🏠 Remote
                    <button
                      onClick={() => setRemoteOnly(false)}
                      className="hover:text-orange-900 dark:hover:text-orange-100"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 dark:text-red-400 font-bold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all flex flex-col h-full"
              >
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {job.company_logo_url ? (
                    <Image
                      src={job.company_logo_url}
                      alt={job.company_name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-2xl">🏢</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                  {job.title}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-black text-xs mb-6 uppercase tracking-wider">
                  {job.company_name}
                </p>
                <div className="space-y-2.5 mb-8 flex-grow">
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-base">📍</span> {job.location}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-base">💰</span> {formatSalary(job)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 capitalize">
                    <span className="text-base">🕒</span>{" "}
                    {job.job_type.replace("_", " ")}
                  </p>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block text-center w-full py-3.5 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-lg mt-auto"
                >
                  View Details & Apply
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No active job postings found. Check back later!
          </div>
        )}

        <div className="mt-32 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-[40px] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">
              Ready to showcase your talent?
            </h2>
            <p className="text-blue-100 dark:text-blue-200 mb-10 text-lg max-w-xl mx-auto">
              Build your professional profile on LetsMakeCV and sync it here to
              apply for these roles instantly.
            </p>
            <Link
              href="/candidate/signup"
              className="inline-block px-12 py-4 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition-all shadow-2xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
