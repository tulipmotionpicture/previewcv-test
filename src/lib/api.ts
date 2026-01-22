import {
  AuthResponse,
  Job,
  Application,
  User,
  Recruiter,
  PaginatedResponse,
  RecruiterProfileResponse,
  PdfResume,
  Resume,
  TopHiringPartnersResponse,
  JobApplicationsResponse,
  ApplicationDetailResponse,
} from "@/types/api";
import { ReviewedResumeMetadata } from "@/types";
import type {
  SEOJobsResponse,
  SEOPatternsResponse,
  CountryCardsResponse,
  CityCardsResponse,
  IndustryCardsResponse,
  JobTypeCardsResponse,
  ExperienceCardsResponse,
  RemoteCardsResponse,
  CardsSummaryResponse,
} from "@/types/jobs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://letsmakecv.tulip-software.com";

export class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders(
    includeAuth: boolean = false,
    isRecruiter: boolean = false,
  ): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const tokenKey = isRecruiter ? "recruiter_access_token" : "access_token";
      const token =
        typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshToken(isRecruiter: boolean): Promise<string | null> {
    const refreshTokenKey = isRecruiter
      ? "recruiter_refresh_token"
      : "refresh_token";
    const accessTokenKey = isRecruiter
      ? "recruiter_access_token"
      : "access_token";
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem(refreshTokenKey)
        : null;

    if (!refreshToken) {
      return null;
    }

    try {
      const endpoint = isRecruiter
        ? "/api/v1/recruiters/auth/refresh"
        : "/api/v1/auth/refresh";
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        // Refresh token is invalid, clear storage
        if (typeof window !== "undefined") {
          localStorage.removeItem(accessTokenKey);
          localStorage.removeItem(refreshTokenKey);
        }
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.access_token;

      if (typeof window !== "undefined") {
        localStorage.setItem(accessTokenKey, newAccessToken);
      }

      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = false,
    isRecruiter: boolean = false,
  ): Promise<T> {
    // Get base headers, but skip Content-Type for FormData (browser sets it with boundary)
    const baseHeaders = this.getHeaders(includeAuth, isRecruiter);
    if (options.body instanceof FormData) {
      delete (baseHeaders as Record<string, string>)["Content-Type"];
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && includeAuth) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        const newToken = await this.refreshToken(isRecruiter);
        this.isRefreshing = false;

        if (newToken) {
          this.onRefreshed(newToken);
          // Retry the original request with new token
          return this.request<T>(endpoint, options, includeAuth, isRecruiter);
        } else {
          // Refresh failed, clear tokens and throw 401 error
          if (typeof window !== "undefined") {
            const tokenKey = isRecruiter
              ? "recruiter_access_token"
              : "access_token";
            const refreshKey = isRecruiter
              ? "recruiter_refresh_token"
              : "refresh_token";
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(refreshKey);
          }
          const error = new Error(
            "Session expired. Please login again.",
          ) as Error & { status: number };
          error.status = 401;
          throw error;
        }
      } else {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve, reject) => {
          this.addRefreshSubscriber(() => {
            // Retry with new token
            this.request<T>(endpoint, options, includeAuth, isRecruiter)
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }

    if (!response.ok) {
      let errorMsg = "An error occurred";
      try {
        const error = await response.json();
        errorMsg = error.detail || error.message || errorMsg;
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // --- Candidate Auth ---
  async candidateLogin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async candidateRegister(
    email: string,
    password: string,
    full_name: string,
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  async getCandidateProfile(): Promise<User> {
    return this.request<User>("/api/v1/users/me", {}, true, false);
  }

  // Get linked entities (saved data) for a resume
  async getLinkedEntities(resumeId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/pdf-resumes/${resumeId}/linked-entities`,
      {},
      true,
      false,
    );
  }

  async updateCandidateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>(
      "/api/v1/users/me",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
      false,
    );
  }

  async candidateRefreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async candidateLogout(): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/v1/auth/logout",
      {
        method: "POST",
      },
      true,
      false,
    );
  }

  async candidateSocialLogin(provider: "google" | "linkedin"): Promise<void> {
    // Redirect to backend endpoint which handles the OAuth flow
    const endpoint =
      provider === "google" ? "/api/v1/auth/google" : "/api/v1/auth/linkedin";
    window.location.href = `${this.baseUrl}${endpoint}`;
  }

  // --- Recruiter Auth ---
  async recruiterLogin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/recruiters/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async recruiterRegister(data: unknown): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/recruiters/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRecruiterProfile(): Promise<RecruiterProfileResponse> {
    return this.request<RecruiterProfileResponse>(
      "/api/v1/recruiters/profile/me",
      {},
      true,
      true,
    );
  }

  async updateRecruiterProfile(
    data: Partial<Recruiter>,
  ): Promise<RecruiterProfileResponse> {
    return this.request<RecruiterProfileResponse>(
      "/api/v1/recruiters/profile/me",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
      true,
    );
  }

  async recruiterRefreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>(
      "/api/v1/recruiters/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    );
  }

  async recruiterLogout(): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/v1/recruiters/auth/logout",
      {
        method: "POST",
      },
      true,
      true,
    );
  }

  async recruiterResetPassword(email: string): Promise<{ email: string }> {
    return this.request<{ email: string }>(
      "/api/v1/recruiters/auth/password-reset/request",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  }

  async recruiterPasswordConfirm(
    token: string,
    new_password: string,
  ): Promise<{ token: string; new_password: string }> {
    return this.request<{ token: string; new_password: string }>(
      "/api/v1/recruiters/auth/password-reset/confirm",
      {
        method: "POST",
        body: JSON.stringify({ token, new_password }),
      },
    );
  }

  async getPublicRecruiterProfile(
    username: string,
  ): Promise<RecruiterProfileResponse> {
    return this.request<RecruiterProfileResponse>(
      `/api/v1/recruiters/profile/${username}`,
    );
  }

  async getTopHiringPartners(
    limit: number = 20,
  ): Promise<TopHiringPartnersResponse> {
    return this.request<TopHiringPartnersResponse>(
      `/api/v1/recruiters/profile/top-hiring-partners?limit=${limit}`,
    );
  }

  async getMyJobPostings(
    params?: URLSearchParams,
  ): Promise<PaginatedResponse<Job>> {
    const queryString = params ? `?${params.toString()}` : "";
    return this.request<PaginatedResponse<Job>>(
      `/api/v1/recruiters/jobs/my-postings${queryString}`,
      {},
      true,
      true,
    );
  }

  async getJobPostingDetails(
    jobId: number,
  ): Promise<{ success: boolean; job: Job }> {
    return this.request<{ success: boolean; job: Job }>(
      `/api/v1/recruiters/jobs/posting/${jobId}`,
      {},
      true,
      true,
    );
  }

  async updateJobPosting(
    jobId: number,
    data: Partial<Job>,
  ): Promise<{ success: boolean; job: Job }> {
    return this.request<{ success: boolean; job: Job }>(
      `/api/v1/recruiters/jobs/posting/${jobId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
      true,
    );
  }

  async deleteJobPosting(
    jobId: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/api/v1/recruiters/jobs/posting/${jobId}`,
      {
        method: "DELETE",
      },
      true,
      true,
    );
  }

  async getJobApplications(
    jobId: number,
    statusFilter?: string,
  ): Promise<JobApplicationsResponse> {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "All") {
      params.append(
        "status_filter",
        statusFilter.toLowerCase().replace(" ", "_"),
      );
    }
    const queryString = params.toString();
    const endpoint = `/api/v1/recruiters/jobs/posting/${jobId}/applications${
      queryString ? `?${queryString}` : ""
    }`;
    return this.request<JobApplicationsResponse>(endpoint, {}, true, true);
  }

  async getRecruiterDashboardStats(): Promise<{
    success: boolean;
    stats: {
      total_jobs: number;
      active_jobs: number;
      total_applications: number;
      pending_applications: number;
      shortlisted_applications: number;
      rejected_applications: number;
    };
  }> {
    return this.request(
      "/api/v1/recruiters/jobs/dashboard/stats",
      {},
      true,
      true,
    );
  }

  async updateApplicationStatus(
    applicationId: number,
    status: string,
  ): Promise<{ success: boolean; application: Application }> {
    return this.request<{ success: boolean; application: Application }>(
      `/api/v1/recruiters/jobs/application/${applicationId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      true,
      true,
    );
  }

  async getApplicationDetails(
    applicationId: number,
  ): Promise<ApplicationDetailResponse> {
    return this.request<ApplicationDetailResponse>(
      `/api/v1/recruiters/jobs/application/${applicationId}`,
      {},
      true,
      true,
    );
  }

  // --- Jobs ---
  async getJobs(params: URLSearchParams): Promise<PaginatedResponse<Job>> {
    return this.request<PaginatedResponse<Job>>(
      `/api/v1/jobs/list?${params.toString()}`,
      {},
      true,
      false,
    );
  }

  /**
   * Get individual job by its unique slug
   * Used for job details page: /jobs/[slug]
   * @example getJobBySlug('software-engineer-at-google-123')
   */
  async getJobBySlug(slug: string): Promise<{ success: boolean; job: Job }> {
    return this.request<{ success: boolean; job: Job }>(
      `/api/v1/jobs/slug/${slug}`,
      {},
      true,
      false,
    );
  }

  async getJobById(jobId: number): Promise<{ success: boolean; job: Job }> {
    return this.request<{ success: boolean; job: Job }>(
      `/api/v1/jobs/${jobId}`,
      {},
      true,
      false,
    );
  }

  async applyToJob(
    jobId: number,
    data: { resume_id: number; cover_letter: string },
  ): Promise<{ success: boolean; application: Application }> {
    return this.request<{ success: boolean; application: Application }>(
      `/api/v1/jobs/${jobId}/apply`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
      false,
    );
  }

  async getMyApplications(): Promise<{
    success: boolean;
    applications: Application[];
  }> {
    return this.request<{ success: boolean; applications: Application[] }>(
      "/api/v1/jobs/my-applications",
      {},
      true,
      false,
    );
  }

  // --- Job Bookmarks ---
  async bookmarkJob(jobId: number): Promise<string> {
    return this.request<string>(
      `/api/v1/jobs/${jobId}/bookmark`,
      {
        method: "POST",
      },
      true,
      false,
    );
  }

  async removeBookmark(jobId: number): Promise<string> {
    return this.request<string>(
      `/api/v1/jobs/${jobId}/bookmark`,
      {
        method: "DELETE",
      },
      true,
      false,
    );
  }

  async uploadResume(
    file: File,
    resumeName?: string,
  ): Promise<{
    success: boolean;
    message: string;
    resume_id: number;
    resume_name: string;
    file_size_mb: number;
    bunny_cdn_url: string;
    permanent_link: {
      token: string;
      share_url: string;
      qr_code_base64: string;
      view_count: number;
      access_count: number;
    };
    created_at: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resume_name", resumeName || file.name);

    return this.request<{
      success: boolean;
      message: string;
      resume_id: number;
      resume_name: string;
      file_size_mb: number;
      bunny_cdn_url: string;
      permanent_link: {
        token: string;
        share_url: string;
        qr_code_base64: string;
        view_count: number;
        access_count: number;
      };
      created_at: string;
    }>(
      "/api/v1/pdf-resumes/upload",
      {
        method: "POST",
        body: formData,
      },
      true,
      false,
    );
  }

  async getPdfResumes(): Promise<{ total: number; resumes: PdfResume[] }> {
    return this.request<{ total: number; resumes: PdfResume[] }>(
      "/api/v1/pdf-resumes/",
      {},
      true,
    );
  }

  async getPdfResumeDetails(id: number): Promise<PdfResume> {
    return this.request<PdfResume>(`/api/v1/pdf-resumes/${id}`, {}, true);
  }

  async updatePdfResume(
    id: number,
    data: { resume_name?: string; description?: string; is_public?: boolean },
  ): Promise<PdfResume> {
    return this.request<PdfResume>(
      `/api/v1/pdf-resumes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    );
  }

  async getPdfResumeDownloadUrl(id: number): Promise<{ download_url: string }> {
    return this.request<{ download_url: string }>(
      `/api/v1/pdf-resumes/${id}/download`,
      {},
      true,
    );
  }

  async getPdfResumeShareLink(id: number): Promise<{
    permanent_link: string;
    token: string;
    qr_code_url: string;
    short_url: string;
  }> {
    return this.request<{
      permanent_link: string;
      token: string;
      qr_code_url: string;
      short_url: string;
    }>(`/api/v1/pdf-resumes/${id}/share-link`, {}, true);
  }

  async deletePdfResume(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/api/v1/pdf-resumes/${id}`,
      { method: "DELETE" },
      true,
    );
  }

  // --- Application Resume Download ---
  async getApplicationResumeDownloadUrl(
    applicationId: number,
    downloadType: "url" | "stream" = "url",
    forceDownload: boolean = false,
  ): Promise<{ download_url: string }> {
    const params = new URLSearchParams({
      download_type: downloadType,
      force_download: forceDownload.toString(),
    });
    return this.request<{ download_url: string }>(
      `/api/v1/recruiters/jobs/application/${applicationId}/resume?${params.toString()}`,
      {},
      true,
      true,
    );
  }

  async getResumes(): Promise<Resume[]> {
    return this.request<Resume[]>("/api/v1/resumes/", {}, true);
  }

  // --- Recruiter Job Management ---
  async createJob(data: unknown): Promise<{ success: boolean; job: Job }> {
    return this.request<{ success: boolean; job: Job }>(
      "/api/v1/recruiters/jobs/create",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
      true,
    );
  }

  async getRecruiterJobs(): Promise<{ success: boolean; jobs: Job[] }> {
    return this.request<{ success: boolean; jobs: Job[] }>(
      "/api/v1/recruiters/jobs/my-jobs",
      {},
      true,
      true,
    );
  }

  async getJobFilters(): Promise<{
    success: boolean;
    filters: Record<
      string,
      { name: string; value: string; count: number; [key: string]: any }[]
    >;
  }> {
    return this.request<{
      success: boolean;
      filters: Record<
        string,
        { name: string; value: string; count: number; [key: string]: any }[]
      >;
    }>("/api/v1/jobs/filters", {}, false, false);
  }

  /**
   * Upload company logo (multipart/form-data)
   */
  async uploadRecruiterLogo(
    file: File,
  ): Promise<{ url: string; logo_url?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<{ url: string; logo_url?: string }>(
      "/api/v1/recruiters/profile/upload-logo",
      {
        method: "POST",
        body: formData,
      },
      true,
      true,
    );
  }

  /**
   * Delete company logo
   */
  async deleteRecruiterLogo(): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      "/api/v1/recruiters/profile/delete-logo",
      {
        method: "DELETE",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /**
   * Upload gallery image (multipart/form-data)
   */
  async uploadRecruiterGalleryImage(
    file: File,
  ): Promise<{ url: string; image_url?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<{ url: string; image_url?: string }>(
      "/api/v1/recruiters/profile/upload-gallery-image",
      {
        method: "POST",
        body: formData,
      },
      true,
      true,
    );
  }

  /**
   * Delete gallery image by image_url (query param)
   */
  async deleteRecruiterGalleryImage(
    imageUrl: string,
  ): Promise<{ success: boolean; message?: string }> {
    const endpoint = `/api/v1/recruiters/profile/delete-gallery-image?image_url=${encodeURIComponent(
      imageUrl,
    )}`;
    return this.request<{ success: boolean; message?: string }>(
      endpoint,
      {
        method: "DELETE",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /**
   * Get my gallery images (authenticated recruiter)
   */
  async getMyRecruiterGalleryImages(): Promise<{ images: string[] }> {
    return this.request<{ images: string[] }>(
      "/api/v1/recruiters/profile/gallery/me",
      {
        method: "GET",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /**
   * Get gallery images by username (public)
   */
  async getRecruiterGalleryByUsername(
    username: string,
  ): Promise<{ images: string[] }> {
    return this.request<{ images: string[] }>(
      `/api/v1/recruiters/profile/gallery/${username}`,
      {
        method: "GET",
        headers: this.getHeaders(false, true) as HeadersInit,
      },
      false,
      true,
    );
  }

  // --- Recruiter Gallery Events & Images ---
  /** Create Gallery Event */
  async createGalleryEvent(data: object): Promise<any> {
    return this.request<any>(
      "/api/v1/recruiters/gallery/events",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Get My Gallery Events */
  async getMyGalleryEvents(): Promise<any> {
    return this.request<any>(
      "/api/v1/recruiters/gallery/events",
      {
        method: "GET",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Get Gallery Event by ID */
  async getGalleryEvent(eventId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/events/${eventId}`,
      {
        method: "GET",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Update Gallery Event */
  async updateGalleryEvent(eventId: number, data: object): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/events/${eventId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Delete Gallery Event */
  async deleteGalleryEvent(eventId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/events/${eventId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Upload Gallery Image */
  async uploadGalleryImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<any>(
      "/api/v1/recruiters/gallery/images/upload",
      {
        method: "POST",
        body: formData,
      },
      true,
      true,
    );
  }

  /** Update Gallery Image */
  async updateGalleryImage(imageId: number, data: object): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/images/${imageId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Delete Gallery Image */
  async deleteGalleryImage(imageId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/images/${imageId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(true, true) as HeadersInit,
      },
      true,
      true,
    );
  }

  /** Get Public Gallery by Username */
  async getPublicGallery(username: string): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/public/${username}`,
      {
        method: "GET",
        headers: this.getHeaders(false, true) as HeadersInit,
      },
      false,
      true,
    );
  }

  /** Get Public Gallery Event by Username and Event ID */
  async getPublicGalleryEvent(username: string, eventId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/recruiters/gallery/public/${username}/event/${eventId}`,
      {
        method: "GET",
        headers: this.getHeaders(false, true) as HeadersInit,
      },
      false,
      true,
    );
  }
  // async getJobApplications(
  //   jobId: number
  // ): Promise<{ success: boolean; applications: Application[] }> {
  //   return this.request<{ success: boolean; applications: Application[] }>(
  //     `/api/v1/recruiters/jobs/${jobId}/applications`,
  //     {},
  //     true,
  //     true
  //   );
  // }

  // async updateApplicationStatus(
  //   applicationId: number,
  //   status: string,
  //   notes?: string
  // ): Promise<{ success: boolean; application: Application }> {
  //   return this.request<{ success: boolean; application: Application }>(
  //     `/api/v1/recruiters/jobs/applications/${applicationId}/status`,
  //     {
  //       method: "PUT",
  //       body: JSON.stringify({ status, notes }),
  //     },
  //     true,
  //     true
  //   );
  // }

  async updateJob(
    jobId: number,
    data: Partial<Job>,
  ): Promise<{ success: boolean; job: Job }> {
    return this.request<{ success: boolean; job: Job }>(
      `/api/v1/recruiters/jobs/posting/${jobId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
      true,
    );
  }

  async deleteJob(
    jobId: number,
    permanent: boolean = false,
  ): Promise<{ success: boolean; message: string; job_id: number }> {
    const query = permanent ? "?permanent=true" : "";
    return this.request<{ success: boolean; message: string; job_id: number }>(
      `/api/v1/recruiters/jobs/posting/${jobId}${query}`,
      {
        method: "DELETE",
      },
      true,
      true,
    );
  }

  /*
    Resume apis 
  */

  // Resume Parse API - Initiate parsing for uploaded resume
  async parseResumeById(resumeId: number): Promise<{
    success: boolean;
    message: string;
    resume_id: number;
    status: string;
    status_url: string;
  }> {
    return this.request<{
      success: boolean;
      message: string;
      resume_id: number;
      status: string;
      status_url: string;
    }>(
      `/api/v1/pdf-resumes/${resumeId}/parse`,
      {
        method: "POST",
      },
      true,
      false, // Use candidate token, not recruiter
    );
  }

  // Get parse status for a resume
  async getParseStatus(resumeId: number): Promise<{
    resume_id: number;
    status: "pending" | "processing" | "completed" | "failed";
    metadata?: ResumeMetadata | null;
    error?: string | null;
  }> {
    return this.request<{
      resume_id: number;
      status: "pending" | "processing" | "completed" | "failed";
      metadata?: ResumeMetadata | null;
      error?: string | null;
    }>(`/api/v1/pdf-resumes/${resumeId}/parse-status`, {}, true, false);
  }

  async transformMetadataForGraphQL(
    resumeId: number,
  ): Promise<ReviewedResumeMetadata> {
    return this.request(
      `/api/v1/pdf-resumes/${resumeId}/transform-for-graphql`,
      {},
      true,
      false,
    );
  }

  async saveReviewedMetadata(
    resumeId: number,
    metadata: ReviewedResumeMetadata,
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/api/v1/pdf-resumes/${resumeId}/save-reviewed-metadata`,
      {
        method: "POST",
        body: JSON.stringify(metadata),
      },
      true, // includeAuth
      false, // isRecruiter
    );
  }

  // ============================================================================
  // SEO Jobs API - For job listing pages by location/type/experience
  // ============================================================================

  /**
   * Fetch multiple jobs by SEO slug pattern
   * Used for SEO job listing pages: /[...slug]
   * @example getJobsBySlug('jobs-in-bangalore')
   * @example getJobsBySlug('remote-python-developer-jobs')
   * @example getJobsBySlug('full-time-jobs-in-india')
   */
  async getJobsBySlug(
    slug: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<SEOJobsResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.offset) params.set("offset", options.offset.toString());

    const queryString = params.toString();
    const url = `/api/v1/jobs/by-slug/${slug}${queryString ? `?${queryString}` : ""}`;

    return this.request<SEOJobsResponse>(url, {}, false, false);
  }

  /**
   * Fetch all SEO patterns for sitemap generation
   */
  async getSEOPatterns(options?: {
    limit?: number;
    minJobs?: number;
  }): Promise<SEOPatternsResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.minJobs) params.set("min_jobs", options.minJobs.toString());

    return this.request<SEOPatternsResponse>(
      `/api/v1/jobs/seo-patterns?${params.toString()}`,
      {},
      false,
      false,
    );
  }

  // ============================================================================
  // Job Cards API
  // ============================================================================

  /**
   * Fetch jobs grouped by country
   */
  async getJobsByCountry(options?: {
    limit?: number;
    minJobs?: number;
  }): Promise<CountryCardsResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.minJobs) params.set("min_jobs", options.minJobs.toString());

    return this.request<CountryCardsResponse>(
      `/api/v1/jobs/cards/by-country?${params.toString()}`,
      {},
      false,
      false,
    );
  }

  /**
   * Fetch jobs grouped by city
   */
  async getJobsByCity(options?: {
    limit?: number;
    minJobs?: number;
    country?: string;
  }): Promise<CityCardsResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.minJobs) params.set("min_jobs", options.minJobs.toString());
    if (options?.country) params.set("country", options.country);

    return this.request<CityCardsResponse>(
      `/api/v1/jobs/cards/by-city?${params.toString()}`,
      {},
      false,
      false,
    );
  }

  /**
   * Fetch jobs grouped by industry
   */
  async getJobsByIndustry(options?: {
    limit?: number;
    minJobs?: number;
  }): Promise<IndustryCardsResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.minJobs) params.set("min_jobs", options.minJobs.toString());

    return this.request<IndustryCardsResponse>(
      `/api/v1/jobs/cards/by-industry?${params.toString()}`,
      {},
      false,
      false,
    );
  }

  /**
   * Fetch jobs grouped by job type
   */
  async getJobsByJobType(): Promise<JobTypeCardsResponse> {
    return this.request<JobTypeCardsResponse>(
      "/api/v1/jobs/cards/by-job-type",
      {},
      false,
      false,
    );
  }

  /**
   * Fetch jobs grouped by experience level
   */
  async getJobsByExperience(): Promise<ExperienceCardsResponse> {
    return this.request<ExperienceCardsResponse>(
      "/api/v1/jobs/cards/by-experience",
      {},
      false,
      false,
    );
  }

  /**
   * Fetch remote vs on-site job stats
   */
  async getRemoteJobsStats(): Promise<RemoteCardsResponse> {
    return this.request<RemoteCardsResponse>(
      "/api/v1/jobs/cards/remote",
      {},
      false,
      false,
    );
  }

  /**
   * Fetch all cards summary in one request (optimized for homepage)
   */
  async getCardsSummary(): Promise<CardsSummaryResponse> {
    return this.request<CardsSummaryResponse>(
      "/api/v1/jobs/cards/summary",
      {},
      false,
      false,
    );
  }
}

// Resume Metadata types for parsed resume
export interface ResumeMetadata {
  data: {
    skills: ResumeSkill[];
    education: ResumeEducation[];
    experience: ResumeExperience[];
    languages: ResumeLanguage[];
    personal_details: ResumePersonalDetails;
  };
  success: boolean;
  error: string | null;
}

export interface ResumeSkill {
  name: string;
  proficiency: string | null;
}

export interface ResumePersonalDetails {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  country_code?: string | null;
  postal_code: string | null;
  street_number?: string | null;
  full_address?: string | null;
  gender?: string | null;
  professional_title: string | null;
  profile_description: string | null;
}

export interface ResumeExperience {
  title: string;
  company: string;
  duration?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description: string | null;
  location: string | null;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year?: string | null;
  grade?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  graduation_date?: string | null;
  field_of_study: string | null;
  gpa?: string | null;
}

export interface ResumeLanguage {
  name: string;
  proficiency: string | null;
}

export const api = new ApiClient();
