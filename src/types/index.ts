/**
 * TypeScript types and interfaces for PreviewCV application
 */

export interface ResumeData {
  success: boolean;
  resume_id: number;
  resume_name: string;
  pdf_signed_url: string;
  permanent_token: string;
  qr_code_base64?: string;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
  expires_at?: string;
  expires_in?: number; // Expiration time in seconds
  view_count?: number; // Number of views
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ResumeApiResponse extends ApiResponse<ResumeData> {
  resume_id?: number;
  resume_name?: string;
  pdf_signed_url?: string;
  permanent_token?: string;
  qr_code_base64?: string;
  access_count?: number;
  last_accessed_at?: string;
  created_at?: string;
  expires_in?: number; // Expiration time in seconds
  view_count?: number; // Number of views
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface AccessLog {
  timestamp: string;
  permanentToken: string;
  apiTokenPrefix: string;
  success: boolean;
  ipAddress: string;
  userAgent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RecruiterProfile {}

export interface ReviewedResumeMetadata {
  personal_details: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    portfolio_link?: string;
    linkedin_url?: string;
  };
  work_experiences: {
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    description: string;
    location: string;
    is_current: boolean;
  }[];
  education: {
    institution_name: string;
    degree: string;
    start_date: string;
    end_date: string;
    gpa?: number | string;
    field_of_study: string;
  }[];
  skills: {
    skill_name: string;
    proficiency_level: number;
  }[];
  languages: {
    language: string;
    proficiency_level:
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert"
      | "native";
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RecruiterUser {}
