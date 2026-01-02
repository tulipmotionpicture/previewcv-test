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
  user_id?: number;
  resume_name: string;
  description?: string;
  original_filename: string;
  stored_filename?: string;
  file_size_bytes?: number;
  file_size_mb: number;
  file_hash?: string;
  bunny_cdn_url?: string;
  is_active: boolean;
  is_public: boolean;
  permanent_link?: {
    token: string;
    share_url: string;
    qr_code_base64: string;
    view_count: number;
    access_count: number;
  } | null;
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
  template_name?: string | null;
  has_permanent_link?: boolean;
  permanent_token?: string;
  share_url?: string;
  qr_code_base64?: string;
  view_count?: number;
  access_count?: number;
}

export interface Job {
  id: number;
  slug: string;
  recruiter_id: number;
  title: string;
  company_name: string;
  company_logo_url?: string;
  location: string;
  job_type: "full_time" | "part_time" | "contract" | "freelance" | "internship";
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  is_remote: boolean;
  categories: string[];
  required_skills: string[];
  preferred_skills?: string[];
  experience_level: "entry" | "mid" | "senior" | "executive";
  posted_date: string;
  application_count: number;
  view_count: number;
  status: "active" | "closed" | "draft";
  created_at: string;
  updated_at: string;
  // Extended fields for UI
  recruiter_username?: string;
  recruiter_profile_url?: string;
  industry?: string;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  user_id: number;
  candidate_name: string;
  candidate_email: string;
  resume_id: number;
  status:
    | "applied"
    | "under_review"
    | "interview_scheduled"
    | "offered"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "declined";
  applied_at: string;
  cover_letter?: string;
  notes?: string;
  // Job details (if populated by API)
  job?: Job;
  job_title?: string;
  company_name?: string;
  job_slug?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: User; // returned for candidate login
  recruiter?: Recruiter; // returned for recruiter login if any
}

export interface PaginatedResponse<T> {
  items?: T[];
  jobs?: [];
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
