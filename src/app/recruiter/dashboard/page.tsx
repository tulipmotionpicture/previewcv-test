"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Job,
  Application,
  JobApplicationsResponse,
  ApplicationDetailResponse,
} from "@/types/api";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { useToast } from "@/context/ToastContext";
import EditJobModal from "@/components/EditJobModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CompanyGallerySection from "@/components/CompanyGallerySection";
import RecruiterGalleryEventsSection from "@/components/RecruiterGalleryEventsSection";
import RecruiterProfileEdit from "./profile/page";

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
  const [activeTab, setActiveTab] = useState<DashboardTab>("jobs");
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

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
      const response = await api.getRecruiterDashboardStats();
      if (response.success && response.stats) {
        setDashboardStats(response.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(1, jobFilters);
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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
      />

      {/* Main Content */}
      <main className="flex-1 p-10 max-w-7xl mx-auto overflow-x-hidden">
        {activeTab === "stats" && (
          <DashboardStats stats={dashboardStats} loading={loadingStats} />
        )}

        {activeTab === "jobs" && (
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

        {activeTab === "ats" && (
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

        {activeTab === "gallery" && recruiter && (
          <CompanyGallerySection recruiter={recruiter} toast={toast} />
        )}

        {activeTab === "galleryEvents" && (
          <RecruiterGalleryEventsSection recruiter={recruiter} toast={toast} />
        )}

        {activeTab === "profile" && <RecruiterProfileEdit />}
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
