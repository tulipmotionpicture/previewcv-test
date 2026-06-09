"use client";

import { useState, useMemo, useEffect } from "react";
import { Job, Application } from "@/types/api";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { SearchSuggestInput } from "@/components/ui";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  Download,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  ArrowUp,
  ArrowDown,
  Clock,
  Users,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface ApplicationsMeta {
  total_applicants?: number;
  accessible_applicants?: number;
  locked_applicants?: number;
  applicants_per_job?: number | null;
  is_capped?: boolean;
}

interface ATSApplicationsProps {
  jobs: Job[];
  applications: Application[];
  selectedJobId: number | null;
  statusFilter: string;
  loadingApps: boolean;
  meta?: ApplicationsMeta | null;
  onJobSelect: (jobId: number) => void;
  onStatusFilterChange: (status: string) => void;
  onViewDetails: (app: Application) => void;
  onUpdateStatus: (appId: number, newStatus: string) => void;
  onUpgrade?: () => void;
}

type SortKey = "relevance" | "newest" | "experience";

// Per-factor display caps for the breakdown bars. The numeric points are always shown verbatim,
// so these only affect the bar fill proportion.
const SCORE_FACTORS: {
  key: keyof NonNullable<Application["score_breakdown"]>;
  label: string;
  max: number;
  color: "blue" | "purple" | "emerald" | "amber";
}[] = [
  { key: "skills_match", label: "Skills", max: 25, color: "blue" },
  { key: "experience_match", label: "Experience", max: 20, color: "purple" },
  { key: "location_match", label: "Location", max: 15, color: "emerald" },
  { key: "job_type_match", label: "Job Type", max: 10, color: "amber" },
  { key: "category_match", label: "Category", max: 10, color: "blue" },
  { key: "salary_match", label: "Salary", max: 5, color: "emerald" },
];

const TIERS = ["all", "excellent", "good", "fair", "weak"] as const;

const formatPts = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(1);

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function absDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function tierMeta(
  tier?: string,
  score = 0,
): { label: string; cls: string } {
  const presets: Record<string, { label: string; cls: string }> = {
    excellent: {
      label: "Excellent",
      cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    strong: {
      label: "Strong",
      cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    good: {
      label: "Good",
      cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    fair: {
      label: "Fair",
      cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    weak: {
      label: "Weak",
      cls: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    poor: {
      label: "Weak",
      cls: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
  };
  const key = (tier || "").toLowerCase();
  if (presets[key]) return presets[key];
  if (score >= 80) return presets.excellent;
  if (score >= 60) return presets.good;
  if (score >= 40) return presets.fair;
  return presets.weak;
}

function ScoreRing({ score, size = 46 }: { score: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreTextColor(score);
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-gray-100 dark:text-gray-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`transition-all duration-700 ease-out ${color}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className={`absolute text-sm font-bold ${color}`}>
        {Math.round(score)}
      </span>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "blue" | "purple" | "emerald" | "amber";
}) {
  const fill = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  }[color];
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex flex-col p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
          {label}
        </span>
        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">
          {formatPts(value)}
          <span className="text-gray-400 font-medium"> / {max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SkillChip({
  label,
  variant,
}: {
  label: string;
  variant: "matched" | "missing" | "preferred" | "neutral";
}) {
  const styles = {
    matched:
      "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    missing:
      "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-300",
    preferred:
      "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
    neutral:
      "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300",
  }[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${styles}`}
    >
      {variant === "matched" && <CheckCircle2 size={9} />}
      {variant === "missing" && <XCircle size={9} />}
      {label}
    </span>
  );
}

function formatJobType(t?: string): string {
  if (!t) return "";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Trigger a file download via a programmatic anchor click. Used instead of `window.open` because
 * the bulk-ZIP URL becomes available inside an async poll callback (no user gesture), which browsers
 * block as a popup. An anchor click is not popup-blocked.
 */
function triggerBrowserDownload(url: string, filename?: string) {
  const a = document.createElement("a");
  a.href = url;
  if (filename) a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function DetailChip({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] font-medium text-gray-600 dark:text-gray-300">
      <Icon className="w-3 h-3 text-gray-400" />
      {label}
    </span>
  );
}

export default function ATSApplications({
  jobs,
  applications,
  selectedJobId,
  statusFilter,
  loadingApps,
  meta,
  onJobSelect,
  onStatusFilterChange,
  onViewDetails,
  onUpdateStatus,
  onUpgrade,
}: ATSApplicationsProps) {
  void onJobSelect;
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [downloadingBulk, setDownloadingBulk] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Relevance UI state.
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const [scoreDir, setScoreDir] = useState<"desc" | "asc">("desc");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [resumeLoadingId, setResumeLoadingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  void taskId;
  void downloadUrl;

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const handleStatusUpdate = (appId: number, newStatus: string) => {
    onUpdateStatus(appId, newStatus);
  };

  // Filter locally by name/email, applied-date range, tier and min score.
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (searchTerm) {
        const name = app.applicant?.full_name || app.candidate_name || "";
        const email = app.applicant?.email || app.candidate_email || "";
        const term = searchTerm.toLowerCase();
        if (
          !name.toLowerCase().includes(term) &&
          !email.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      if (appliedFrom || appliedTo) {
        const appliedDay = (app.applied_at || app.created_at || "").slice(0, 10);
        if (!appliedDay) return false;
        if (appliedFrom && appliedDay < appliedFrom) return false;
        if (appliedTo && appliedDay > appliedTo) return false;
      }
      if (tierFilter !== "all") {
        if ((app.relevance_tier || "").toLowerCase() !== tierFilter)
          return false;
      }
      if (minScore > 0 && (app.relevance_score ?? 0) < minScore) return false;
      return true;
    });
  }, [applications, searchTerm, appliedFrom, appliedTo, tierFilter, minScore]);

  const sortedApplications = useMemo(() => {
    const arr = [...filteredApplications];
    arr.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.applied_at || b.created_at || 0).getTime() -
          new Date(a.applied_at || a.created_at || 0).getTime()
        );
      }
      if (sortBy === "experience") {
        return (b.years_experience ?? 0) - (a.years_experience ?? 0);
      }
      const diff = (b.relevance_score ?? 0) - (a.relevance_score ?? 0);
      return scoreDir === "asc" ? -diff : diff;
    });
    return arr;
  }, [filteredApplications, sortBy, scoreDir]);

  // Client-side display pagination over the fully-loaded, sorted set.
  const totalPages = Math.max(
    1,
    Math.ceil(sortedApplications.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedApplications = useMemo(
    () =>
      sortedApplications.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [sortedApplications, currentPage],
  );

  // Whenever the result set or ordering changes, jump back to the first page.
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    appliedFrom,
    appliedTo,
    tierFilter,
    minScore,
    statusFilter,
    sortBy,
    scoreDir,
  ]);

  // Today (UTC date) used to cap the date pickers.
  const today = new Date().toISOString().split("T")[0];

  const activeFilterCount = [
    !!searchTerm,
    statusFilter !== "All",
    !!appliedFrom,
    !!appliedTo,
    tierFilter !== "all",
    minScore > 0,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm("");
    setAppliedFrom("");
    setAppliedTo("");
    setTierFilter("all");
    setMinScore(0);
    onStatusFilterChange("All");
  };

  const handleScoreHeaderSort = () => {
    if (sortBy !== "relevance") {
      setSortBy("relevance");
      setScoreDir("desc");
    } else {
      setScoreDir((d) => (d === "desc" ? "asc" : "desc"));
    }
  };

  const handleViewResume = async (app: Application) => {
    const hasResume =
      app.uploaded_resume?.id ||
      app.resume?.id ||
      app.uploaded_resume_id ||
      app.resume_id;
    if (!hasResume) {
      showToast("No resume available for this applicant.", "error");
      return;
    }
    try {
      setResumeLoadingId(app.id);
      const { download_url } = await api.getApplicationResumeDownloadUrl(
        app.id,
        "url",
      );
      if (download_url) window.open(download_url, "_blank", "noopener");
      else showToast("Resume URL was not provided.", "error");
    } catch {
      showToast("Failed to open resume. Please try again.", "error");
    } finally {
      setResumeLoadingId(null);
    }
  };

  // Autocomplete suggestions from the loaded applications (candidate names + emails).
  const nameSuggestions = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      const name = a.applicant?.full_name || a.candidate_name;
      const email = a.applicant?.email || a.candidate_email;
      if (name) set.add(name);
      if (email) set.add(email);
    });
    return Array.from(set);
  }, [applications]);

  const getStatusColor = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
      case "applied":
        return "bg-[#E6F4EA] text-[#1E7F3A] dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
      case "withdrawn":
        return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      case "hired":
      case "offered":
      case "accepted":
        return "bg-blue-50 text-primary-blue dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (!selectedJobId) {
      showToast("Please select a job first", "error");
      return;
    }

    if (filteredApplications.length === 0) {
      showToast("No applications to download", "error");
      return;
    }

    setDownloadingBulk(true);
    setDownloadProgress(0);
    setDownloadUrl(null);

    try {
      const response = await api.prepareBulkDownload(selectedJobId);
      setTaskId(response.task_id);
      if (response.skipped_count && response.skipped_count > 0) {
        showToast(
          `${response.skipped_count} applicant(s) skipped — no downloadable CV.`,
          "info",
        );
      }

      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getTaskStatus(response.task_id);

          if (status.progress !== undefined) {
            setDownloadProgress(status.progress);
          }

          const doneStates = ["completed", "success", "finished"];
          if (doneStates.includes(String(status.status))) {
            clearInterval(pollInterval);
            setDownloadingBulk(false);
            setDownloadProgress(null);

            const downloadUrlCandidate =
              (status as any).file_url || status.result?.download_url || null;

            if (downloadUrlCandidate) {
              setDownloadUrl(downloadUrlCandidate);
              // Anchor click (not window.open) — runs in an async callback, so a popup would be blocked.
              triggerBrowserDownload(downloadUrlCandidate);
              const count =
                status.result?.total_resumes ?? response.resume_count ?? 0;
              showToast(
                count
                  ? `Downloading ${count} CVs…`
                  : "Your CVs are downloading…",
                "success",
              );
            } else {
              showToast(
                "Download completed but file URL was not provided.",
                "error",
              );
            }
          } else if (["failed", "failure"].includes(String(status.status))) {
            clearInterval(pollInterval);
            setDownloadingBulk(false);
            setDownloadProgress(null);
            showToast(
              `Download failed: ${status.error || "Unknown error"}`,
              "error",
            );
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (downloadingBulk) {
          setDownloadingBulk(false);
          setDownloadProgress(null);
          showToast("Download preparation timeout. Please try again.", "error");
        }
      }, 300000);
    } catch (error: any) {
      console.error("Failed to prepare bulk download:", error);
      setDownloadingBulk(false);
      setDownloadProgress(null);
      showToast(
        error?.message || "Failed to prepare download. Please try again.",
        "error",
      );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Application Review System
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Review and manage candidate applications for your active roles.
          </p>
        </div>

        {/* Bulk Download Button */}
        {selectedJobId && filteredApplications.length > 0 && (
          <button
            onClick={handleBulkDownload}
            disabled={downloadingBulk}
            className="px-6 py-3 bg-primary-blue hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {downloadingBulk ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {downloadProgress !== null
                  ? `Processing ${downloadProgress}%`
                  : "Preparing..."}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download All CVs
              </>
            )}
          </button>
        )}
      </div>

      {/* Plan-cap banner — shown when the recruiter's plan limits visible applicants */}
      {meta?.is_capped && (meta.locked_applicants ?? 0) > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30 p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Showing {meta.accessible_applicants ?? applications.length} of{" "}
                {meta.total_applicants ?? applications.length} applicants
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                {meta.locked_applicants} more {meta.locked_applicants === 1 ? "applicant is" : "applicants are"} locked on your current plan
                {meta.applicants_per_job ? ` (${meta.applicants_per_job} per job)` : ""}. Upgrade to reveal them all.
              </p>
            </div>
          </div>
          {onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
            >
              Upgrade plan
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT COLUMN: Candidate Table (Main) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700 overflow-hidden shadow-sm flex flex-col">
            {/* Job summary header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
              {selectedJob ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {selectedJob.title}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <DetailChip
                        icon={Users}
                        label={`${applications.length} candidate${applications.length === 1 ? "" : "s"}`}
                      />
                      {(selectedJob.is_remote || selectedJob.location) && (
                        <DetailChip
                          icon={MapPin}
                          label={
                            selectedJob.is_remote
                              ? "Remote"
                              : selectedJob.location
                          }
                        />
                      )}
                      {selectedJob.job_type && (
                        <DetailChip
                          icon={Briefcase}
                          label={formatJobType(selectedJob.job_type)}
                        />
                      )}
                      {selectedJob.experience_level && (
                        <DetailChip
                          icon={Award}
                          label={`${formatJobType(selectedJob.experience_level)} level`}
                        />
                      )}
                    </div>
                  </div>
                  {selectedJob.status && (
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize ${getStatusColor(selectedJob.status)}`}
                    >
                      {selectedJob.status}
                    </span>
                  )}
                </div>
              ) : (
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  Applications
                </h2>
              )}
            </div>

            {/* Toolbar: tier quick-filter + sort */}
            <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5 flex-wrap">
                {TIERS.map((t) => {
                  const active = tierFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTierFilter(t)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors ${
                        active
                          ? "bg-primary-blue text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {t === "all" ? "All tiers" : t}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">
                  {sortedApplications.length} candidate
                  {sortedApplications.length === 1 ? "" : "s"}
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="newest">Sort: Newest applied</option>
                    <option value="experience">Sort: Experience</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table Header (desktop only — rows become cards on mobile) */}
            <div className="bg-[#2F4269] px-4 py-3 hidden lg:grid grid-cols-12 gap-3 items-center sticky top-0 z-10">
              <button
                onClick={handleScoreHeaderSort}
                className="col-span-2 flex items-center gap-1 text-xs font-bold text-white uppercase tracking-wider hover:text-blue-200 transition-colors"
                title="Sort by relevance score"
              >
                Score
                {sortBy === "relevance" &&
                  (scoreDir === "desc" ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUp className="w-3 h-3" />
                  ))}
              </button>
              <div className="col-span-4 text-xs font-bold text-white uppercase tracking-wider">
                Candidate
              </div>
              <div className="col-span-3 text-xs font-bold text-white uppercase tracking-wider">
                Match
              </div>
              <div className="col-span-3 text-xs font-bold text-white uppercase tracking-wider text-right">
                Actions
              </div>
            </div>

            {/* Table Body — grows with content; pagination keeps a page within the viewport */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loadingApps ? (
                <div className="p-10 text-center text-gray-500">
                  Loading applications...
                </div>
              ) : sortedApplications.length > 0 ? (
                pagedApplications.map((app) => {
                  const score = app.relevance_score ?? 0;
                  const tier = tierMeta(app.relevance_tier, score);
                  const matchedReq = app.matched_required_skills ?? [];
                  const missingReq = app.missing_required_skills ?? [];
                  const totalReq = matchedReq.length + missingReq.length;
                  const expanded = expandedId === app.id;
                  const email =
                    app.applicant?.email || app.candidate_email || "";
                  const breakdown = app.score_breakdown;

                  return (
                    <div key={app.id}>
                      {/* Compact row */}
                      <div
                        onClick={() =>
                          setExpandedId(expanded ? null : app.id)
                        }
                        className="px-4 py-3 flex flex-col gap-2 lg:grid lg:grid-cols-12 lg:gap-3 lg:items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      >
                        {/* Score */}
                        <div className="lg:col-span-2 flex items-center gap-2">
                          {app.insufficient_data ? (
                            <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                              Limited data
                            </span>
                          ) : (
                            <>
                              <ScoreRing score={score} />
                              <span
                                className={`hidden xl:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${tier.cls}`}
                              >
                                {tier.label}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Candidate */}
                        <div className="lg:col-span-4 min-w-0">
                          <div className="font-bold text-gray-900 dark:text-gray-100 text-[15px] truncate">
                            {app.applicant?.full_name ||
                              app.candidate_name ||
                              "Unknown Name"}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#60768D] dark:text-gray-400 truncate">
                              {email || "No Email"}
                            </span>
                            {email && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(email);
                                  showToast("Email copied", "success");
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span title={absDate(app.applied_at || app.created_at)}>
                              {relativeTime(app.applied_at || app.created_at) ||
                                "—"}
                            </span>
                            {app.resume?.current_title && (
                              <span className="flex items-center gap-1 truncate">
                                <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                {app.resume.current_title}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match summary */}
                        <div className="lg:col-span-3 min-w-0">
                          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                            {totalReq > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {matchedReq.length}/{totalReq} skills
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Briefcase className="w-3 h-3" />
                              {formatPts(app.years_experience ?? 0)} yrs
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {matchedReq.slice(0, 3).map((s) => (
                              <SkillChip key={s} label={s} variant="matched" />
                            ))}
                            {matchedReq.length > 3 && (
                              <span className="text-[10px] text-gray-400 px-1 py-0.5">
                                +{matchedReq.length - 3}
                              </span>
                            )}
                            {matchedReq.length === 0 &&
                              missingReq.length > 0 && (
                                <SkillChip
                                  label={`Missing ${missingReq.length} required`}
                                  variant="missing"
                                />
                              )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-1.5 flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusUpdate(app.id, e.target.value)
                              }
                              className="appearance-none pl-3 pr-7 py-1.5 bg-primary-blue hover:bg-blue-700 text-white text-[11px] font-medium rounded-lg cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 w-[104px]"
                            >
                              <option value="applied" className="text-gray-900 bg-white">Applied</option>
                              <option value="under_review" className="text-gray-900 bg-white">Under Review</option>
                              <option value="interview_scheduled" className="text-gray-900 bg-white">Interview</option>
                              <option value="offered" className="text-gray-900 bg-white">Offered</option>
                              <option value="accepted" className="text-gray-900 bg-white">Accepted</option>
                              <option value="rejected" className="text-gray-900 bg-white">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none" />
                          </div>
                          <button
                            onClick={() => handleViewResume(app)}
                            disabled={resumeLoadingId === app.id}
                            title="View resume"
                            className="p-2 rounded-lg text-gray-500 hover:text-primary-blue hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            {resumeLoadingId === app.id ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-blue rounded-full animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onViewDetails(app)}
                            title="View full details"
                            className="p-2 rounded-lg text-gray-500 hover:text-primary-blue hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setExpandedId(expanded ? null : app.id)
                            }
                            title={expanded ? "Collapse" : "Expand insights"}
                            className="p-2 rounded-lg text-gray-500 hover:text-primary-blue hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded insight panel */}
                      {expanded && (
                        <div className="px-5 pb-5 pt-1 bg-gray-50/60 dark:bg-gray-800/30 animate-in fade-in slide-in-from-top-1 duration-300">
                          {app.ai_insight && (
                            <div className="flex gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 mb-3">
                              <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                {app.ai_insight}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Score breakdown */}
                            {breakdown && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                                  Score breakdown
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {SCORE_FACTORS.map((f) => (
                                    <ScoreBar
                                      key={f.key}
                                      label={f.label}
                                      value={breakdown[f.key] ?? 0}
                                      max={f.max}
                                      color={f.color}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Highlights */}
                            {app.highlights && app.highlights.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                                  Highlights
                                </p>
                                <ul className="space-y-1.5">
                                  {app.highlights.map((h, i) => (
                                    <li
                                      key={i}
                                      className="flex gap-2 text-[11px] text-gray-600 dark:text-gray-300"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                      <span className="leading-relaxed">{h}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Skills */}
                          <div className="mt-3 space-y-2">
                            {(matchedReq.length > 0 || missingReq.length > 0) && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-gray-500 mr-1">
                                  Required:
                                </span>
                                {matchedReq.map((s) => (
                                  <SkillChip key={`m${s}`} label={s} variant="matched" />
                                ))}
                                {missingReq.map((s) => (
                                  <SkillChip key={`x${s}`} label={s} variant="missing" />
                                ))}
                              </div>
                            )}
                            {(app.matched_preferred_skills?.length ||
                              app.missing_preferred_skills?.length) && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-gray-500 mr-1">
                                  Preferred:
                                </span>
                                {(app.matched_preferred_skills ?? []).map((s) => (
                                  <SkillChip key={`pm${s}`} label={s} variant="matched" />
                                ))}
                                {(app.missing_preferred_skills ?? []).map((s) => (
                                  <SkillChip key={`px${s}`} label={s} variant="preferred" />
                                ))}
                              </div>
                            )}
                            {app.top_skills && app.top_skills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-gray-500 mr-1">
                                  Top skills:
                                </span>
                                {app.top_skills.slice(0, 12).map((s) => (
                                  <SkillChip key={`t${s}`} label={s} variant="neutral" />
                                ))}
                                {app.top_skills.length > 12 && (
                                  <span className="text-[10px] text-gray-400">
                                    +{app.top_skills.length - 12} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-gray-500">
                  No applications found matching your criteria.
                </div>
              )}
            </div>

            {/* Pagination footer */}
            {!loadingApps && sortedApplications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, sortedApplications.length)}{" "}
                  of {sortedApplications.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Filter Section (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#282727] rounded-xl border border-[#E1E8F1] dark:border-gray-700 shadow-sm sticky top-6">
            {/* Filter Header */}
            <div className="bg-[#2F4269] px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">
                Filter
              </h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="p-5 space-y-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
                  >
                    <option value="All">All</option>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="interview_scheduled">Interview</option>
                    <option value="offered">Offered</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="declined">Declined</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Minimum relevance score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Minimum score
                  </label>
                  <span className="text-xs font-bold text-primary-blue">
                    {minScore}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-primary-blue cursor-pointer"
                />
              </div>

              {/* Candidate Name Search */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Candidate Name
                </label>
                <SearchSuggestInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  suggestions={nameSuggestions}
                  placeholder="Search by candidate name or email"
                />
              </div>

              {/* Applied Between */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Applied Between
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      From
                    </label>
                    <input
                      type="date"
                      value={appliedFrom}
                      max={appliedTo || today}
                      onChange={(e) => setAppliedFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                    <input
                      type="date"
                      value={appliedTo}
                      min={appliedFrom || ""}
                      max={today}
                      onChange={(e) => setAppliedTo(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters — only when something is applied */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
