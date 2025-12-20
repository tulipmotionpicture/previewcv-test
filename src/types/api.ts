export interface User {
    id: number;
    email: string;
    full_name: string;
    phone?: string;
    created_at?: string;
}

export interface Recruiter {
    id: number;
    email: string;
    username: string;
    recruiter_type?: string;
    display_name?: string;
    full_name?: string;
    company_name?: string;
    company_website?: string;
    company_size?: string;
    industry?: string;
    bio?: string;
    location?: string;
    linkedin_url?: string;
    phone?: string;
    is_verified?: boolean;
    is_email_verified?: boolean;
    profile_url?: string;
    company_logo_url?: string;
    specialization?: string;
    years_experience?: number;
    created_at?: string;
    last_login?: string;
}

export interface PdfResume {
    id: number;
    user_id: number;
    resume_name: string;
    description?: string;
    original_filename: string;
    stored_filename: string;
    file_size_bytes: number;
    file_hash?: string;
    bunny_cdn_url: string;
    is_active: boolean;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface Resume {
    id: number;
    name: string;
    template_id: number;
    language: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    template_name?: string;
    // Add other fields as needed from guide if we need details
}

export interface Job {
    id: number;
    slug: string;
    recruiter_id: number;
    title: string;
    company_name: string;
    company_logo_url?: string;
    location: string;
    job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
    description: string;
    requirements?: string;
    responsibilities?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    is_remote: boolean;
    categories: string[];
    required_skills: string[];
    experience_level: 'entry' | 'mid' | 'senior' | 'executive';
    status: 'active' | 'closed' | 'draft';
    created_at: string;
    updated_at: string;
}

export interface Application {
    id: number;
    job_id: number;
    candidate_id: number; // user_id in guide? Guide says "user_id". Mapping?
    // Guide says: user_id, candidate_name, candidate_email, resume_id, status, applied_at, cover_letter, notes
    // I should probably match guide exactly or map it.
    // Let's match guide structure for "Application" response object
    user_id: number;
    candidate_name: string;
    candidate_email: string;
    resume_id: number;
    status: 'applied' | 'under_review' | 'interview_scheduled' | 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'declined';
    applied_at: string;
    cover_letter?: string;
    notes?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user?: User; // returned for candidate login
    recruiter?: Recruiter; // returned for recruiter login if any
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface ApiResponse {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
}

export interface RecruiterProfileResponse {
    success: boolean;
    recruiter: Recruiter;
}
