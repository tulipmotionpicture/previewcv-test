"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Job,
  Application,
  JobApplicationsResponse,
  ApplicationDetailResponse,
  KycStatus,
} from "@/types/api";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { useToast } from "@/context/ToastContext";
import EditJobModal from "@/components/EditJobModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CompanyGallerySection from "@/components/CompanyGallerySection";
import RecruiterGalleryEventsSection from "@/components/RecruiterGalleryEventsSection";
import RecruiterProfileEdit from "./profile/page";
import KYCVerification from "@/components/recruiter/KYCVerification";

// Import separated components
import {
  RecruiterSidebar,
  DashboardStats,
  JobManagement,
  ATSApplications,
  ApplicationDetailModal,
  JOB_FORM_INITIAL,
} from "@/components/recruiter";
import type { DashboardTab, JobFormState } from "@/components/recruiter";
import {
  ArrowRight,
  Clock,
  Eye,
  OptionIcon,
  Pencil,
  Trash2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui";

interface JobFilters {
  is_active?: boolean | null;
  posted_date_from?: string;
  posted_date_to?: string;
  application_deadline_from?: string;
  application_deadline_to?: string;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const {
    recruiter,
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useRecruiterAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DashboardTab>("stats");
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 10;
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    pending_applications: number;
    shortlisted_applications: number;
    rejected_applications: number;
  } | null>(null);

  // Loading states
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [jobFilters, setJobFilters] = useState<JobFilters>({});

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApplicationDetail, setSelectedApplicationDetail] =
    useState<ApplicationDetailResponse | null>(null);
  const [loadingApplicationDetail, setLoadingApplicationDetail] =
    useState(false);

  // Create Job State
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobForm, setJobForm] = useState<JobFormState>(() => ({
    ...JOB_FORM_INITIAL,
  }));

  // Edit Job State
  const [editJobModalOpen, setEditJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);

  // Delete Job State
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Create Job Modal State
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  // Action Menu State
  const [openMenuJobId, setOpenMenuJobId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch KYC status on mount
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const status = await api.getKycStatus();
        setKycStatus(status);

        // If KYC is not approved, redirect to KYC tab
        if (status.kyc_status !== "approved") {
          setActiveTab("kyc");
        }
      } catch (error) {
        console.error("Failed to fetch KYC status:", error);
      }
    };

    if (isAuthenticated) {
      fetchKycStatus();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === "ats" || selectedJobId) {
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id);
      }
    }
  }, [activeTab, jobs, selectedJobId]);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplications(selectedJobId, statusFilter);
    }
  }, [selectedJobId, statusFilter]);

  const fetchJobs = useCallback(
    async (page: number = 1, filters?: typeof jobFilters) => {
      setLoadingJobs(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: jobsPerPage.toString(),
        });

        // Apply filters if provided
        const currentFilters = filters || jobFilters;
        if (
          currentFilters.is_active !== undefined &&
          currentFilters.is_active !== null
        ) {
          params.append("is_active", currentFilters.is_active.toString());
        }
        if (currentFilters.posted_date_from) {
          params.append("posted_date_from", currentFilters.posted_date_from);
        }
        if (currentFilters.posted_date_to) {
          params.append("posted_date_to", currentFilters.posted_date_to);
        }
        if (currentFilters.application_deadline_from) {
          params.append(
            "application_deadline_from",
            currentFilters.application_deadline_from,
          );
        }
        if (currentFilters.application_deadline_to) {
          params.append(
            "application_deadline_to",
            currentFilters.application_deadline_to,
          );
        }

        const response = await api.getMyJobPostings(params);

        // Handle new nested response structure
        const jobList = response.data?.jobs || [];
        const pagination = response.data?.pagination || {};

        setJobs(jobList);
        setTotalPages(pagination.total_pages);
        setTotalJobs(pagination.total || jobList.length);
        setCurrentPage(pagination.page || page);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        toast?.error("Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    },
    [toast, jobsPerPage],
  );

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // const response = await api.getRecruiterDashboardStats();
      // if (response.success && response.stats) {
      setDashboardStats({
        total_jobs: 12,
        active_jobs: 12,
        total_applications: 23,
        pending_applications: 55,
        shortlisted_applications: 66,
        rejected_applications: 456,
      });

      // }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchRecentApplications = useCallback(async () => {
    if (jobs.length === 0) return;
    try {
      // Fetch applications from the first job to show in onboarding status
      const response = await api.getJobApplications(jobs[0].id);
      if (response.success && response.applications) {
        setApplications(response.applications.slice(0, 6));
      }
    } catch (error) {
      console.debug("Failed to fetch recent applications:", error);
    }
  }, [jobs]);

  useEffect(() => {
    fetchJobs(1, jobFilters);
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  useEffect(() => {
    if (jobs.length > 0) {
      fetchRecentApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const handleJobFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const element = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = element;
    const nextValue =
      element instanceof HTMLInputElement && element.type === "checkbox"
        ? element.checked
        : value;
    setJobForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const fetchApplications = async (jobId: number, status?: string) => {
    setLoadingApps(true);
    setApplications([]);
    try {
      const response: JobApplicationsResponse = await api.getJobApplications(
        jobId,
        status,
      );
      if (response.success && response.applications) {
        setApplications(response.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = jobForm.title.trim();
    const location = jobForm.location.trim();
    const description = jobForm.description.trim();

    if (!title || !location || !description) {
      toast.error("Title, location, and description are required");
      return;
    }

    const parseList = (value: string) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    setCreatingJob(true);
    try {
      await api.createJob({
        title,
        location,
        company_name:
          recruiter?.company_name || recruiter?.display_name || "My Company",
        job_type: jobForm.job_type,
        experience_level: jobForm.experience_level,
        description,
        requirements:
          jobForm.requirements.trim() || "Requirements not provided.",
        responsibilities:
          jobForm.responsibilities.trim() || "Responsibilities not provided.",
        salary_min: jobForm.salary_min ? Number(jobForm.salary_min) : 0,
        salary_max: jobForm.salary_max ? Number(jobForm.salary_max) : 0,
        salary_currency: jobForm.salary_currency,
        is_remote: jobForm.is_remote,
        required_skills: parseList(jobForm.required_skills),
        preferred_skills: parseList(jobForm.preferred_skills),
        categories: parseList(jobForm.categories),
      });
      await fetchJobs();
      setJobForm({ ...JOB_FORM_INITIAL });
      toast.success("Job posted successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create job");
      } else {
        toast.error("Failed to create job");
      }
    } finally {
      setCreatingJob(false);
    }
  };

  const handleEditJob = async (job: Job) => {
    setLoadingJobDetails(true);
    setEditJobModalOpen(true);
    try {
      const response = await api.getJobPostingDetails(job.id);
      if (response.success && response.job) {
        setEditingJob(response.job);
      } else {
        // Fallback to passed job data if API fails
        setEditingJob(job);
      }
    } catch (error) {
      console.error("Failed to fetch job details:", error);
      // Fallback to passed job data if API fails
      setEditingJob(job);
      toast.error("Failed to load latest job details, using cached data");
    } finally {
      setLoadingJobDetails(false);
    }
  };

  const handleSaveJob = async (jobId: number, data: Partial<Job>) => {
    try {
      await api.updateJob(jobId, data);
      await fetchJobs();
      toast.success("Job updated successfully!");
    } catch (error) {
      toast.error("Failed to update job");
      throw error;
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;

    setDeleteLoading(true);
    try {
      await api.deleteJob(deleteJobId, false);
      await fetchJobs();
      toast.success("Job deactivated successfully");
      setDeleteJobId(null);
      if (selectedJobId === deleteJobId) {
        setSelectedJobId(null);
      }
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: newStatus as Application["status"] }
            : app,
        ),
      );
      // Update the detail modal if it's showing this application
      if (selectedApplicationDetail?.application.id === appId) {
        setSelectedApplicationDetail((prev) =>
          prev
            ? {
                ...prev,
                application: {
                  ...prev.application,
                  status: newStatus as Application["status"],
                },
              }
            : null,
        );
      }
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update status");
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const handleViewApplications = (jobId: number) => {
    setSelectedJobId(jobId);
    setActiveTab("ats");
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page, jobFilters);
  };

  const handleFiltersChange = (newFilters: JobFilters) => {
    setJobFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchJobs(1, newFilters); // Apply filters immediately
  };

  const handleViewApplicationDetail = async (app: Application) => {
    setIsDetailModalOpen(true);
    setLoadingApplicationDetail(true);
    try {
      const details = await api.getApplicationDetails(app.id);
      setSelectedApplicationDetail(details);
    } catch (error) {
      toast.error(`Failed to load application details ${error}`);
      setIsDetailModalOpen(false);
    } finally {
      setLoadingApplicationDetail(false);
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Sidebar */}
      <RecruiterSidebar
        recruiter={recruiter}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        kycStatus={kycStatus}
      />

      {/* Main Content */}
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-x-hidden">
        {/* KYC Verification Warning Banner */}
        {kycStatus &&
          kycStatus.kyc_status !== "approved" &&
          activeTab !== "kyc" && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    KYC Verification Required
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Please complete your KYC verification to access all
                    dashboard features and start posting jobs.
                    {kycStatus.kyc_status === "pending_review" &&
                      " Your documents are currently under review."}
                    {kycStatus.kyc_status === "rejected" &&
                      " Your previous submission was rejected. Please review and resubmit."}
                  </p>
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
                  >
                    Complete KYC Verification →
                  </button>
                </div>
              </div>
            </div>
          )}

        {activeTab === "stats" && (
          <>
            {kycStatus?.kyc_status === "approved" ? (
              <>
                <DashboardStats stats={dashboardStats} loading={loadingStats} />

                {/* Recent Job Posting and Onboarding Status */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-2">
                  {/* Recent Job Posting - Takes 2 columns */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Recent Job Posting
                      </h2>
                    </div>

                    {/* Job Table */}
                    <div className="overflow-x-auto">
                      {loadingJobs ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : jobs.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 dark:text-gray-400">
                            No jobs found
                          </p>
                        </div>
                      ) : (
                        <>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                {["Title", "Status", "Posted", "Actions"].map(
                                  (heading) => (
                                    <th
                                      key={heading}
                                      className="pb-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                                    >
                                      {heading}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {jobs.map((job) => (
                                <tr
                                  key={job.id}
                                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                                >
                                  {/* ROLE */}
                                  <td className="py-4 ">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {job.title}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {job.job_type.replace("_", " ")} •{" "}
                                        {job.experience_level}
                                      </p>
                                    </div>
                                  </td>

                                  {/* STATUS */}
                                  <td className="py-4">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                        job.is_active
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                                      }`}
                                    >
                                      {job.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </td>

                                  {/* POSTED */}
                                  <td className="py-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                      <Clock className="h-4 w-4" />
                                      {new Date(
                                        job.posted_date,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                  </td>

                                  {/* ACTIONS */}
                                  <td className="py-4 ">
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setOpenMenuJobId(
                                            openMenuJobId === job.id
                                              ? null
                                              : job.id,
                                          )
                                        }
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>

                                      {openMenuJobId === job.id && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setOpenMenuJobId(null)
                                            }
                                          />
                                          <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                            <button
                                              onClick={() => {
                                                handleViewApplications(job.id);
                                                setOpenMenuJobId(null);
                                              }}
                                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                              <Eye className="h-4 w-4" />
                                              View Applications
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleEditJob(job);
                                                setOpenMenuJobId(null);
                                              }}
                                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                              <Pencil className="h-4 w-4" />
                                              Edit Job
                                            </button>
                                            <button
                                              onClick={() => {
                                                setDeleteJobId(job.id);
                                                setOpenMenuJobId(null);
                                              }}
                                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                              Delete Job
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Pagination */}

                          <div className="flex items-center justify-center ">
                            <Button
                              className="text-sm text-gray-600 dark:text-gray-400 "
                              variant="ghost"
                              onClick={() => {
                                setActiveTab("jobs");
                              }}
                            >
                              Showing More <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Onboarding Status - Takes 1 column */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
                      Help Guide
                    </h2>
                    <div className="space-y-4">
                      {applications.slice(0, 6).length > 0 ? (
                        applications.slice(0, 6).map((app) => (
                          <div key={app.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white font-semibold text-sm">
                              {app.candidate_name
                                ?.substring(0, 2)
                                .toUpperCase() || "NA"}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {app.candidate_name || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {app.status.replace("_", " ")}
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewApplicationDetail(app)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No recent applications
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  KYC Verification Required
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Complete your KYC verification to access dashboard features
                  and start managing jobs.
                </p>
                <button
                  onClick={() => setActiveTab("kyc")}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Go to KYC Verification
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "jobs" && kycStatus?.kyc_status === "approved" && (
          <JobManagement
            jobs={jobs}
            loadingJobs={loadingJobs}
            jobForm={jobForm}
            creatingJob={creatingJob}
            totalJobs={totalJobs}
            currentPage={currentPage}
            totalPages={totalPages}
            filters={jobFilters}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onJobFormChange={handleJobFormChange}
            onCreateJob={handleCreateJob}
            onEditJob={handleEditJob}
            onDeleteJob={(jobId) => setDeleteJobId(jobId)}
            onViewApplications={handleViewApplications}
          />
        )}

        {activeTab === "ats" && kycStatus?.kyc_status === "approved" && (
          <ATSApplications
            jobs={jobs}
            applications={applications}
            selectedJobId={selectedJobId}
            statusFilter={statusFilter}
            loadingApps={loadingApps}
            onJobSelect={setSelectedJobId}
            onStatusFilterChange={setStatusFilter}
            onViewDetails={handleViewApplicationDetail}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === "gallery" &&
          kycStatus?.kyc_status === "approved" &&
          recruiter && (
            <CompanyGallerySection recruiter={recruiter} toast={toast} />
          )}

        {activeTab === "galleryEvents" &&
          kycStatus?.kyc_status === "approved" && (
            <RecruiterGalleryEventsSection
              recruiter={recruiter}
              toast={toast}
            />
          )}

        {activeTab === "profile" && <RecruiterProfileEdit />}

        {activeTab === "kyc" && <KYCVerification />}
      </main>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        applicationDetail={selectedApplicationDetail}
        isOpen={isDetailModalOpen}
        loading={loadingApplicationDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApplicationDetail(null);
        }}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        isOpen={editJobModalOpen}
        onClose={() => {
          setEditJobModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        job={editingJob}
        loadingJobDetails={loadingJobDetails}
      />

      {/* Delete Job Confirmation */}
      <ConfirmDialog
        isOpen={deleteJobId !== null}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Posting"
        message="Are you sure you want to deactivate this job posting? It will no longer be visible to candidates."
        confirmText="Delete Job"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
