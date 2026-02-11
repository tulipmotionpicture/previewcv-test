"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import {
  Application,
  PdfResume,
  Resume,
  Job,
  ApplicationStatsResponse,
} from "@/types/api";
import { RelevantJobsResponse } from "@/types/jobs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeReview from "@/components/ResumeReview";
import {
  CandidateSidebar,
  ApplicationsList,
  CandidateProfile,
  RelevantJobs,
  CandidateDashboardTab,
  ApplicationMasterDetail,
} from "@/components/candidate";
import { MatchAnalysis } from "@/components/jobs";
import {
  Search,
  FileText,
  Sparkles,
  Eye,
  Link2,
  Trash2,
  Share2,
  ExternalLink,
  Calendar,
  File,
  Globe,
  TrendingUp,
  CheckCircle,
  Gift,
  Bell,
  Filter,
  User as UserIcon,
  Briefcase,
  Users,
} from "lucide-react";

function CandidateDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<CandidateDashboardTab>("overview");
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsPagination, setApplicationsPagination] = useState<{
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    has_more: boolean;
    has_previous: boolean;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [relevantJobsData, setRelevantJobsData] =
    useState<RelevantJobsResponse | null>(null);
  const [relevantJobsOffset, setRelevantJobsOffset] = useState(0);
  const [relevantJobsHasMore, setRelevantJobsHasMore] = useState(false);
  const [relevantJobsInfiniteLoading, setRelevantJobsInfiniteLoading] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applicationStats, setApplicationStats] =
    useState<ApplicationStatsResponse | null>(null);

  // Resume state
  const [pdfResumes, setPdfResumes] = useState<PdfResume[]>([]);
  const [builderResumes, setBuilderResumes] = useState<Resume[]>([]);
  const [shareModalResume, setShareModalResume] = useState<PdfResume | null>(
    null,
  );
  const [parsingResumeId, setParsingResumeId] = useState<number | null>(null);
  const [pdfResumesCollapsed, setPdfResumesCollapsed] = useState(false);
  const [builderResumesCollapsed, setBuilderResumesCollapsed] = useState(false);

  // Initialize active tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["overview", "applications", "resumes"].includes(tabParam)
    ) {
      setActiveTab(tabParam as "overview" | "applications" | "resumes");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchApplicationStats = async () => {
    try {
      const stats = await api.getApplicationStats();
      setApplicationStats(stats);
    } catch (error) {
      // Silently fail if stats endpoint is not available yet
      // The UI will gracefully fall back to local counts
      console.debug("Application stats API not available:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "applications") {
      fetchApplications();
      fetchJobs();
      fetchApplicationStats();
    } else if (activeTab === "resumes") {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchApplications = async (params?: {
    status_filter?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    try {
      const response = await api.getMyApplications(params);
      if (response.success && response.applications) {
        setApplications(response.applications);
        setApplicationsPagination(response.pagination);
      } else {
        setApplications([]);
        setApplicationsPagination(null);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
      setApplications([]);
      setApplicationsPagination(null);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to load applications";
      if (!errorMsg.includes("Database service error")) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (isLoadMore = false) => {
    if (isLoadMore) {
      setRelevantJobsInfiniteLoading(true);
    } else {
      setJobsLoading(true);
      setRelevantJobsOffset(0);
    }

    try {
      const offset = isLoadMore ? relevantJobsOffset : 0;
      const response = await api.getRelevantJobs({ limit: 20, offset });

      if (response.success && response.jobs) {
        if (isLoadMore && relevantJobsData) {
          // Append new jobs to existing ones
          setRelevantJobsData({
            ...response,
            jobs: [...relevantJobsData.jobs, ...response.jobs],
          });
        } else {
          // Replace with new data
          setRelevantJobsData(response);
        }

        setRelevantJobsOffset(offset + response.jobs.length);
        setRelevantJobsHasMore(response.pagination?.has_more || false);
      } else {
        if (!isLoadMore) {
          setRelevantJobsData(null);
          setJobs([]);
          setRelevantJobsHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch relevant jobs", error);
      if (!isLoadMore) {
        setRelevantJobsData(null);
        setJobs([]);
        setRelevantJobsHasMore(false);
      }
    } finally {
      setRelevantJobsInfiniteLoading(false);
      if (!isLoadMore) {
        setJobsLoading(false);
      }
    }
  };

  const loadMoreJobs = () => {
    if (!relevantJobsInfiniteLoading && relevantJobsHasMore) {
      fetchJobs(true);
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const [pdfRes, builderRes] = await Promise.all([
        api.getPdfResumes().catch(() => ({ total: 0, resumes: [] })),
        api.getResumes().catch(() => []),
      ]);

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
      fetchResumes();
    } catch {
      alert("Failed to delete resume");
    }
  };

  const handleResumeUploadSuccess = (resumeId: number) => {
    localStorage.setItem("last_uploaded_resume_id", resumeId.toString());
    toast.success("Resume uploaded successfully!");
    fetchResumes();
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300 bg-[#F9FAFC] dark:bg-[#121111]">
      {/* Sidebar */}
      <CandidateSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="flex-1 p-5 max-w-7xl mx-auto overflow-x-hidden">
        {/* Applications Tab */}
        {activeTab === "overview" && (
          <div className="animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
              <div className="col-span-2 space-y-2">
                {/* Search and Filter Section */}
                {/* Search and Filter Section */}
                <div className="flex flex-col gap-3 mb-2">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                    {/* Total Applications */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-slate-200 dark:border-gray-800 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-0.5">
                            Total Applications
                          </span>
                          <span className="text-2xl font-bold text-slate-900 dark:text-white block">
                            {applicationStats?.total_applications?.total ||
                              applications.length}
                          </span>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Briefcase className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                      </div>

                      {applicationStats?.total_applications?.weekly_change !==
                        undefined && (
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`w-3 h-3 ${
                              applicationStats.total_applications
                                .weekly_change >= 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              applicationStats.total_applications
                                .weekly_change >= 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            {applicationStats.total_applications
                              .weekly_change >= 0
                              ? "+"
                              : ""}
                            {applicationStats.total_applications.weekly_change}{" "}
                            this week
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Interview Invites */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-slate-200 dark:border-gray-800 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-0.5">
                            Interview Invites
                          </span>
                          <span className="text-2xl font-bold text-slate-900 dark:text-white block">
                            {applicationStats?.interview_invites?.total ||
                              applications.filter(
                                (app) => app.status === "interview_scheduled",
                              ).length}
                          </span>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                      </div>

                      {applicationStats?.interview_invites?.weekly_change !==
                        undefined && (
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`w-3 h-3 ${
                              applicationStats.interview_invites
                                .weekly_change >= 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              applicationStats.interview_invites
                                .weekly_change >= 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            {applicationStats.interview_invites.weekly_change >=
                            0
                              ? "+"
                              : ""}
                            {applicationStats.interview_invites.weekly_change}{" "}
                            this week
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Offers Received */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-slate-200 dark:border-gray-800 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-0.5">
                            Offers Received
                          </span>
                          <span className="text-2xl font-bold text-slate-900 dark:text-white block">
                            {applicationStats?.offers_received?.total ||
                              applications.filter(
                                (app) =>
                                  app.status === "offered" ||
                                  app.status === "accepted",
                              ).length}
                          </span>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Gift className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                      </div>

                      {applicationStats?.offers_received?.weekly_change !==
                        undefined && (
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`w-3 h-3 ${
                              applicationStats.offers_received.weekly_change >=
                              0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              applicationStats.offers_received.weekly_change >=
                              0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            {applicationStats.offers_received.weekly_change >= 0
                              ? "+"
                              : ""}
                            {applicationStats.offers_received.weekly_change}{" "}
                            this week
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search and Filter Section */}
                  <div className="flex flex-col gap-3 mb-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search applications by role, company..."
                          className="w-full pl-10 pr-2 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 placeholder-slate-400 transition-all focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400"
                        />
                      </div>
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            fetchApplications({
                              status_filter: e.target.value || undefined,
                            });
                          }}
                          className="appearance-none px-8 py-3 pr-10 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 transition-all focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400"
                        >
                          <option value="">All Statuses</option>
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="interview_scheduled">
                            Interview Scheduled
                          </option>
                          <option value="offered">Offered</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <svg
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <ApplicationsList
                    applications={applications}
                    loading={loading}
                  />

                  {/* Pagination Controls */}
                  {applicationsPagination &&
                    applicationsPagination.total_pages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Showing {applicationsPagination.offset + 1} to{" "}
                          {Math.min(
                            applicationsPagination.offset +
                              applicationsPagination.limit,
                            applicationsPagination.total,
                          )}{" "}
                          of {applicationsPagination.total} applications
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              fetchApplications({
                                offset: Math.max(
                                  0,
                                  applicationsPagination.offset -
                                    applicationsPagination.limit,
                                ),
                                status_filter: statusFilter || undefined,
                              })
                            }
                            disabled={!applicationsPagination.has_previous}
                            className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {applicationsPagination.page} of{" "}
                            {applicationsPagination.total_pages}
                          </span>
                          <button
                            onClick={() =>
                              fetchApplications({
                                offset:
                                  applicationsPagination.offset +
                                  applicationsPagination.limit,
                                status_filter: statusFilter || undefined,
                              })
                            }
                            disabled={!applicationsPagination.has_more}
                            className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              <div className="col-span-1 space-y-3">
                {/* AI Match Insight Panel */}
                {relevantJobsData && relevantJobsData.jobs.length > 0 && (
                  <div>
                    <MatchAnalysis
                      job={{
                        ...relevantJobsData.jobs[0],
                        matchScore: Math.round(
                          relevantJobsData.jobs[0].relevance_score,
                        ),
                        reasoning: {
                          skillsMatch: Math.round(
                            relevantJobsData.jobs[0].score_breakdown
                              .skills_match,
                          ),
                          experienceMatch: Math.round(
                            relevantJobsData.jobs[0].score_breakdown
                              .experience_match,
                          ),
                          salaryMatch: Math.round(
                            relevantJobsData.jobs[0].score_breakdown
                              .salary_match || 0,
                          ),
                          locationMatch: Math.round(
                            relevantJobsData.jobs[0].score_breakdown
                              .location_match,
                          ),
                          keyHighlights:
                            relevantJobsData.jobs[0].why_recommended || [],
                          skillsBreakdown: [
                            ...(
                              relevantJobsData.jobs[0]
                                .matched_required_skills || []
                            ).map((skill) => ({
                              name: skill,
                              matched: true,
                              importance: "Required" as const,
                            })),
                            ...(
                              relevantJobsData.jobs[0]
                                .missing_required_skills || []
                            ).map((skill) => ({
                              name: skill,
                              matched: false,
                              importance: "Required" as const,
                            })),
                            ...(
                              relevantJobsData.jobs[0]
                                .matched_preferred_skills || []
                            )
                              .slice(0, 3)
                              .map((skill) => ({
                                name: skill,
                                matched: true,
                                importance: "Preferred" as const,
                              })),
                          ],
                          missingSkills:
                            relevantJobsData.jobs[0].missing_required_skills ||
                            [],
                        },
                      }}
                      matchingCriteria={relevantJobsData.matching_criteria}
                    />
                  </div>
                )}

                {/* Relevant Jobs Section */}
                <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-2 bg-slate-900 dark:bg-slate-900 border-b border-slate-900 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-white" />
                      Relative Jobs
                    </h2>
                  </div>
                  <RelevantJobs
                    relevantJobsData={relevantJobsData}
                    loading={jobsLoading}
                    onLoadMore={loadMoreJobs}
                    hasMore={relevantJobsHasMore}
                    infiniteScrollLoading={relevantJobsInfiniteLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-700">
                  Total: {applications.length}
                </span>
              </div>
            </div>

            <ApplicationMasterDetail
              applications={applications}
              loading={loading}
              pagination={
                applicationsPagination
                  ? {
                      page: applicationsPagination.page,
                      total_pages: applicationsPagination.total_pages,
                      has_more: applicationsPagination.has_more,
                      has_previous: applicationsPagination.has_previous,
                    }
                  : undefined
              }
              onPageChange={(direction) =>
                fetchApplications({
                  offset:
                    direction === "next"
                      ? (applicationsPagination?.offset || 0) +
                        (applicationsPagination?.limit || 10)
                      : Math.max(
                          0,
                          (applicationsPagination?.offset || 0) -
                            (applicationsPagination?.limit || 10),
                        ),
                  status_filter: statusFilter || undefined,
                })
              }
            />
          </div>
        )}

        {/* Resumes Tab */}
        {activeTab === "resumes" && (
          <div className="animate-in fade-in duration-200 flex gap-2">
            {/* Resume Lists - Flat Design Cards */}
            <div className="flex flex-col w-2/3 space-y-4">
              {/* PDF Resumes */}
              <div
                className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col ${
                  pdfResumesCollapsed ? "" : "h-[400px]"
                }`}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-900 dark:bg-gray-800 flex items-center justify-between">
                  <h3 className="font-bold text-white dark:text-gray-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0369A1]" />
                    Uploaded Resumes ({pdfResumes.length})
                  </h3>
                  <button
                    onClick={() => setPdfResumesCollapsed(!pdfResumesCollapsed)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={pdfResumesCollapsed ? "Expand" : "Collapse"}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        pdfResumesCollapsed ? "" : "rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {!pdfResumesCollapsed && (
                  <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0369A1] border-t-transparent"></div>
                      </div>
                    ) : pdfResumes.length > 0 ? (
                      pdfResumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#0369A1] dark:hover:border-[#0EA5E9] transition-all duration-150 overflow-hidden cursor-pointer"
                        >
                          {/* Main Resume Info */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon - Flat Design */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0369A1] flex items-center justify-center text-white">
                                <FileText className="w-5 h-5" />
                              </div>

                              {/* Resume Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors duration-150">
                                  {resume.resume_name}
                                </h4>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(
                                      resume.created_at,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <File className="w-3 h-3" />
                                    {resume.file_size_mb.toFixed(2)} MB
                                  </span>
                                  {resume.permanent_link && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {resume.permanent_link.view_count} views
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Bar - Flat Design */}
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  resume.is_active
                                    ? "bg-[#22C55E] text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {resume.is_active ? "Active" : "Inactive"}
                              </span>
                              {resume.is_public && (
                                <span className="px-2 py-0.5 bg-[#0EA5E9] text-white rounded text-[10px] font-bold uppercase flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Public
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setParsingResumeId(resume.id)}
                                className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors duration-150 cursor-pointer"
                                title="Parse Resume Data"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                              {resume.permanent_link && (
                                <>
                                  <button
                                    onClick={() => setShareModalResume(resume)}
                                    className="p-1.5 text-[#0369A1] dark:text-[#0EA5E9] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-150 cursor-pointer"
                                    title="Share Resume"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <a
                                    href={resume.permanent_link.share_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-[#0369A1] dark:text-[#0EA5E9] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-150 cursor-pointer"
                                    title="View Resume"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </>
                              )}
                              <button
                                onClick={() => deleteResume(resume.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-150 cursor-pointer"
                                title="Delete Resume"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
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
                )}
              </div>

              {/* Builder Resumes */}
              <div
                className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col ${
                  builderResumesCollapsed ? "" : "h-[400px]"
                }`}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-900 dark:bg-gray-800 flex items-center justify-between">
                  <h3 className="font-bold text-white dark:text-gray-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#0EA5E9]" />
                    LetsMakeCV Resumes ({builderResumes.length})
                  </h3>
                  <button
                    onClick={() =>
                      setBuilderResumesCollapsed(!builderResumesCollapsed)
                    }
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={builderResumesCollapsed ? "Expand" : "Collapse"}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        builderResumesCollapsed ? "" : "rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {!builderResumesCollapsed && (
                  <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0EA5E9] border-t-transparent"></div>
                      </div>
                    ) : builderResumes.length > 0 ? (
                      builderResumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#0EA5E9] dark:hover:border-[#0EA5E9] transition-all duration-150 overflow-hidden cursor-pointer"
                        >
                          {/* Main Resume Info */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon - Flat Design */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white">
                                <FileText className="w-5 h-5" />
                              </div>

                              {/* Resume Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-[#0EA5E9] transition-colors duration-150">
                                  {resume.name}
                                </h4>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(
                                      resume.created_at,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span>
                                    Template:{" "}
                                    {resume.template_name || "Standard"}
                                  </span>
                                  {resume.language && (
                                    <span>{resume.language.toUpperCase()}</span>
                                  )}
                                  {resume.view_count !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {resume.access_count} views
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Bar */}
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  resume.is_active
                                    ? "bg-[#22C55E] text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {resume.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {resume.has_permanent_link &&
                                resume.share_url && (
                                  <>
                                    <button
                                      onClick={() => {
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
                                      className="p-1.5 text-[#0EA5E9] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-150 cursor-pointer"
                                      title="Share Resume"
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                    <a
                                      href={resume.share_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-[#0EA5E9] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-150 cursor-pointer"
                                      title="View Resume"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
                          <Sparkles className="w-8 h-8 text-gray-400" />
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
                )}
              </div>
            </div>

            {/* Upload Section - Flat Design */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 h-fit">
              <h3 className="font-bold text-lg text-[#0C4A6E] dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0369A1]" />
                Upload New PDF Resume
              </h3>
              <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && <CandidateProfile />}
      </main>

      {/* Resume Review Modal */}
      {parsingResumeId && (
        <div className="fixed inset-0 z-[300] bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => setParsingResumeId(null)}
                className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#0369A1] dark:hover:text-[#0EA5E9] font-bold transition-colors duration-150 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <ResumeReview
                resumeId={parsingResumeId}
                onSaveComplete={() => {
                  setParsingResumeId(null);
                  fetchResumes();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Share Resume Modal - Flat Design */}
      {shareModalResume && shareModalResume.permanent_link && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShareModalResume(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShareModalResume(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-150 cursor-pointer"
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white text-xl mb-3">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Share Resume
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {shareModalResume.resume_name}
              </p>
            </div>

            {/* QR Code */}
            {shareModalResume.permanent_link.qr_code_base64 && (
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Image
                    src={shareModalResume.permanent_link.qr_code_base64}
                    alt="QR Code"
                    className="w-48 h-48"
                    width={192}
                    height={192}
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
                  className="flex-1 px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      shareModalResume.permanent_link!.share_url,
                    );
                    toast.success("Link copied to clipboard!");
                  }}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors duration-150 flex items-center gap-2 cursor-pointer"
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
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">
                    {shareModalResume.permanent_link.view_count} views
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
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

export default function CandidateDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFC] dark:bg-[#121111] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <CandidateDashboardContent />
    </Suspense>
  );
}
