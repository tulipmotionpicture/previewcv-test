import { AuthResponse, Job, Application, User, PaginatedResponse, RecruiterProfileResponse, PdfResume, Resume } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://letsmakecv.tulip-software.com';

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private getHeaders(includeAuth: boolean = false, isRecruiter: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const tokenKey = isRecruiter ? 'recruiter_access_token' : 'access_token';
            const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {},
        includeAuth: boolean = false,
        isRecruiter: boolean = false
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...this.getHeaders(includeAuth, isRecruiter),
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorMsg = 'An error occurred';
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
        return this.request<AuthResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async candidateRegister(email: string, password: string, full_name: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name }),
        });
    }

    async getCandidateProfile(): Promise<User> {
        return this.request<User>('/api/v1/auth/me', {}, true, false);
    }

    async candidateSocialLogin(provider: 'google' | 'linkedin'): Promise<void> {
        // Redirect to backend endpoint which handles the OAuth flow
        const endpoint = provider === 'google' ? '/api/v1/auth/google' : '/api/v1/auth/linkedin';
        window.location.href = `${this.baseUrl}${endpoint}`;
    }

    // --- Recruiter Auth ---
    async recruiterLogin(email: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/api/v1/recruiters/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async recruiterRegister(data: unknown): Promise<AuthResponse> {
        return this.request<AuthResponse>('/api/v1/recruiters/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getRecruiterProfile(): Promise<RecruiterProfileResponse> {
        return this.request<RecruiterProfileResponse>('/api/v1/recruiters/profile/me', {}, true, true);
    }

    async getPublicRecruiterProfile(username: string): Promise<RecruiterProfileResponse> {
        return this.request<RecruiterProfileResponse>(`/api/v1/recruiters/profile/${username}`);
    }

    // --- Jobs ---
    async getJobs(params: URLSearchParams): Promise<PaginatedResponse<Job>> {
        return this.request<PaginatedResponse<Job>>(`/api/v1/jobs/list?${params.toString()}`);
    }

    async getJobBySlug(slug: string): Promise<{ success: boolean; job: Job }> {
        return this.request<{ success: boolean; job: Job }>(`/api/v1/jobs/slug/${slug}`);
    }

    async applyToJob(jobId: number, data: { resume_id: number; cover_letter: string }): Promise<{ success: boolean; application: Application }> {
        return this.request<{ success: boolean; application: Application }>(`/api/v1/jobs/${jobId}/apply`, {
            method: 'POST',
            body: JSON.stringify(data),
        }, true, false);
    }

    async getMyApplications(): Promise<{ success: boolean; applications: Application[] }> {
        return this.request<{ success: boolean; applications: Application[] }>('/api/v1/jobs/my-applications', {}, true, false);
    }

    async uploadResume(file: File, resumeName?: string): Promise<PdfResume> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resume_name', resumeName || file.name);

        const headers = this.getHeaders(true);
        // @ts-expect-error - we need to remove Content-Type to let browser set it with boundary
        delete headers['Content-Type'];

        const response = await fetch(`${this.baseUrl}/api/v1/pdf-resumes/upload`, {
            method: 'POST',
            body: formData,
            headers: headers as HeadersInit,
        });

        if (!response.ok) {
            let errorMsg = 'Failed to upload resume';
            try {
                const error = await response.json();
                errorMsg = error.detail || error.message || errorMsg;
            } catch {
                // ignore
            }
            throw new Error(errorMsg);
        }

        return response.json();
    }

    async getPdfResumes(): Promise<{ total: number; resumes: PdfResume[] }> {
        return this.request<{ total: number; resumes: PdfResume[] }>('/api/v1/pdf-resumes/', {}, true);
    }

    async deletePdfResume(id: number): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(`/api/v1/pdf-resumes/${id}`, { method: 'DELETE' }, true);
    }

    async getResumes(): Promise<Resume[]> {
        return this.request<Resume[]>('/api/v1/resumes/', {}, true);
    }

    // --- Recruiter Job Management ---
    async createJob(data: unknown): Promise<{ success: boolean; job: Job }> {
        return this.request<{ success: boolean; job: Job }>('/api/v1/recruiters/jobs/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true, true);
    }

    async getRecruiterJobs(): Promise<{ success: boolean; jobs: Job[] }> {
        return this.request<{ success: boolean; jobs: Job[] }>('/api/v1/recruiters/jobs/my-jobs', {}, true, true);
    }

    async getJobApplications(jobId: number): Promise<{ success: boolean; applications: Application[] }> {
        return this.request<{ success: boolean; applications: Application[] }>(`/api/v1/recruiters/jobs/${jobId}/applications`, {}, true, true);
    }

    async updateApplicationStatus(applicationId: number, status: string, notes?: string): Promise<{ success: boolean; application: Application }> {
        return this.request<{ success: boolean; application: Application }>(`/api/v1/recruiters/jobs/applications/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes }),
        }, true, true);
    }
}

export const api = new ApiClient();
