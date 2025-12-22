"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import config from "@/config";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { Job, Application, PdfResume, Resume } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ResumeUpload from "@/components/ResumeUpload";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CandidateDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "explore" | "applications" | "resumes"
  >("explore");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Resume state
  const [pdfResumes, setPdfResumes] = useState<PdfResume[]>([]);
  const [builderResumes, setBuilderResumes] = useState<Resume[]>([]);
  const [shareModalResume, setShareModalResume] = useState<PdfResume | null>(
    null
  );

  // Initialize active tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["explore", "applications", "resumes"].includes(tabParam)) {
      setActiveTab(tabParam as "explore" | "applications" | "resumes");
    }
  }, [searchParams]);

  // Function to change tab and update URL
  const handleTabChange = (tab: "explore" | "applications" | "resumes") => {
    setActiveTab(tab);
    router.push(`/candidate/dashboard?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (activeTab === "explore") {
      fetchJobs();
    } else if (activeTab === "applications") {
      fetchApplications();
    } else if (activeTab === "resumes") {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.getJobs(new URLSearchParams({ limit: "50" }));
      if (response.jobs && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
      setJobs([]);
      // Silently fail for database errors
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load jobs";
      if (!errorMsg.includes("Database service error")) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.getMyApplications();
      if (response.success && response.applications) {
        setApplications(response.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
      setApplications([]);
      // Only show toast if it's not a database error (which is expected if backend is down)
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load applications";
      if (!errorMsg.includes("Database service error")) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      // Fetch both types in parallel
      const [pdfRes, builderRes] = await Promise.all([
        api.getPdfResumes().catch(() => ({ total: 0, resumes: [] })),
        api.getResumes().catch(() => []),
      ]);

      // Handle both array and object responses
      if (Array.isArray(pdfRes)) {
        setPdfResumes(pdfRes);
      } else if (pdfRes && pdfRes.resumes) {
        setPdfResumes(pdfRes.resumes);
      } else {
        setPdfResumes([]);
      }

      setBuilderResumes(builderRes || []);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
      setPdfResumes([]);
      setBuilderResumes([]);
      // Silently fail for database errors
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load resumes";
      if (!errorMsg.includes("Database service error")) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.deletePdfResume(id);
      fetchResumes(); // Refresh list
    } catch {
      alert("Failed to delete resume");
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResumeUploadSuccess = (resumeId: number) => {
    localStorage.setItem("last_uploaded_resume_id", resumeId.toString());
    toast.success("Resume uploaded successfully!");
    fetchResumes(); // Refresh list
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      {/* Top Header */}
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
              <button
                onClick={() => handleTabChange("explore")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "explore"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Explore Jobs
              </button>
              <button
                onClick={() => handleTabChange("applications")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "applications"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                My Applications
              </button>
              <button
                onClick={() => handleTabChange("resumes")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "resumes"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                My Resumes
              </button>
            </nav>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {user?.full_name || "Candidate"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Job Seeker
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.full_name?.charAt(0).toUpperCase() || "C"}
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6" />

        {activeTab === "explore" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                Find Your Dream Role
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Discover opportunities that match your skills and ambitions.
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by job title, company, or location..."
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Results Count */}
                {!loading && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {filteredJobs.length}{" "}
                      {filteredJobs.length === 1 ? "job" : "jobs"} found
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                              {job.company_name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              {job.company_name}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wide rounded-full whitespace-nowrap">
                          {job.job_type.replace("_", " ")}
                        </span>
                      </div>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                              Location
                            </p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">
                              {job.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                              Salary
                            </p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">
                              {job.salary_min
                                ? `${
                                    job.salary_currency
                                  }${job.salary_min.toLocaleString()}-${job.salary_max?.toLocaleString()}`
                                : "Competitive"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                              Experience
                            </p>
                            <p className="font-bold text-gray-700 dark:text-gray-300 capitalize">
                              {job.experience_level.replace("_", " ")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                              Posted
                            </p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">
                              {new Date(job.posted_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                            />
                          </svg>
                          <span className="font-medium">
                            {job.application_count} applicants
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                          <span className="font-medium">
                            {job.view_count} views
                          </span>
                        </div>
                        {job.is_remote && (
                          <span className="ml-auto px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 pb-6">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 text-center group-hover:scale-[1.02] duration-300"
                      >
                        View Details & Apply →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12">
              <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                My Applications
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Track the status of your active job applications.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Position
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center">
                        Loading applications...
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => {
                      return (
                        <tr key={app.id}>
                          <td className="px-6 py-6">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              Job #{app.job_id}
                            </p>
                            <Link
                              href={`/jobs/${app.job_id}`}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              View Job
                            </Link>
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-600`}
                            >
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {!loading && applications.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-20 text-center text-gray-400 italic"
                      >
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "resumes" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                My Resumes
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Upload and manage your CVs for job applications.
              </p>
            </div>

            {/* Upload Section - Full Width */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-6">
                Upload New PDF Resume
              </h3>
              <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
            </div>

            {/* Resume Lists - Side by Side with Max Height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF Resumes */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-500"></span>
                    Uploaded Resumes ({pdfResumes.length})
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                    </div>
                  ) : pdfResumes.length > 0 ? (
                    <div className="p-4 space-y-4">
                      {pdfResumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="group bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          {/* Main Resume Info */}
                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-white text-lg shadow-lg">
                                📄
                              </div>

                              {/* Resume Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                  {resume.resume_name}
                                </h4>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                      />
                                    </svg>
                                    {new Date(
                                      resume.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                      />
                                    </svg>
                                    {resume.file_size_mb.toFixed(2)} MB
                                  </span>
                                  {resume.permanent_link && (
                                    <span className="flex items-center gap-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-3.5 h-3.5"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                        />
                                      </svg>
                                      {resume.permanent_link.view_count} views
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Bar */}
                          <div className="px-5 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  resume.is_active
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {resume.is_active ? "Active" : "Inactive"}
                              </span>
                              {resume.is_public && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase">
                                  Public
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {resume.permanent_link && (
                                <>
                                  <button
                                    onClick={() => setShareModalResume(resume)}
                                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="Share Resume"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                      />
                                    </svg>
                                  </button>
                                  <a
                                    href={resume.permanent_link.share_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                    title="View Resume"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                      />
                                    </svg>
                                  </a>
                                </>
                              )}
                              <button
                                onClick={() => deleteResume(resume.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete Resume"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        No Resumes Yet
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload your first PDF resume to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Builder Resumes */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"></span>
                    LetsMakeCV Resumes ({builderResumes.length})
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : builderResumes.length > 0 ? (
                    <div className="p-4 space-y-4">
                      {builderResumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="group bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          {/* Main Resume Info */}
                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 flex items-center justify-center text-white text-lg shadow-lg">
                                📝
                              </div>

                              {/* Resume Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                  {resume.name}
                                </h4>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                      />
                                    </svg>
                                    {new Date(
                                      resume.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                                      />
                                    </svg>
                                    Template:{" "}
                                    {resume.template_name || "Standard"}
                                  </span>
                                  {resume.language && (
                                    <span className="flex items-center gap-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-3.5 h-3.5"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                                        />
                                      </svg>
                                      {resume.language.toUpperCase()}
                                    </span>
                                  )}
                                  {resume.view_count !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-3.5 h-3.5"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                        />
                                      </svg>
                                      {resume.access_count} views
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Bar */}
                          <div className="px-5 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  resume.is_active
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {resume.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {resume.has_permanent_link &&
                                resume.share_url && (
                                  <>
                                    <button
                                      onClick={() => {
                                        // Convert Resume to PdfResume format for modal
                                        const modalData: PdfResume = {
                                          id: resume.id,
                                          resume_name: resume.name,
                                          original_filename: resume.name,
                                          file_size_mb: 0,
                                          is_active: resume.is_active,
                                          is_public: true,
                                          created_at: resume.created_at,
                                          updated_at: resume.updated_at,
                                          permanent_link: {
                                            token: resume.permanent_token || "",
                                            share_url: resume.share_url || "",
                                            qr_code_base64:
                                              resume.qr_code_base64 || "",
                                            view_count: resume.view_count || 0,
                                            access_count:
                                              resume.access_count || 0,
                                          },
                                        };
                                        setShareModalResume(modalData);
                                      }}
                                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                      title="Share Resume"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                        />
                                      </svg>
                                    </button>
                                    <a
                                      href={resume.share_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                      title="View Resume"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                        />
                                      </svg>
                                    </a>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        No Builder Resumes Yet
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create resumes using our LetsMakeCV builder
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share Resume Modal */}
      {shareModalResume && shareModalResume.permanent_link && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShareModalResume(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShareModalResume(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl mb-3">
                📄
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-1">
                Share Resume
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {shareModalResume.resume_name}
              </p>
            </div>

            {/* QR Code */}
            {shareModalResume.permanent_link.qr_code_base64 && (
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={shareModalResume.permanent_link.qr_code_base64}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            )}

            {/* Share URL */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Share Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareModalResume.permanent_link.share_url}
                  className="flex-1 px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      shareModalResume.permanent_link!.share_url
                    );
                    toast.success("Link copied to clipboard!");
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                    />
                  </svg>
                  Copy
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 pt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  <span className="font-medium">
                    {shareModalResume.permanent_link.view_count} views
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                  <span className="font-medium">
                    {shareModalResume.permanent_link.access_count} accesses
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
