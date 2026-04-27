/**
 * TypeScript types and interfaces for PreviewCV application
 */

import type { Job } from "./api";

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

export interface CandidateContact {
  email?: string;
  phone?: string;
  address?: string;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

export interface CandidateInfo {
  full_name?: string;
  headline?: string;
  summary?: string;
  email?: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  profile_image?: string;
  profile_image_truncated?: boolean;
  contact?: CandidateContact;
}

export interface JobPreferences {
  job_title?: string;
  notice_period?: string;
  employment_type?: string | string[];
  salary_expectation?: string;
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
  updated_at?: string;
  expires_in?: number; // Expiration time in seconds
  view_count?: number; // Number of views
  source_type?: string; // 'builder', 'upload', etc.
  language?: string;
  parse_status?: string | null;
  parse_error?: string | null;
  candidate?: CandidateInfo;
  job_preferences?: JobPreferences;
  sections?: Record<string, any>;
  files?: Record<string, any>;
  share?: Record<string, any>;
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

export interface EventImage {
  id: number;
  image_url: string;
  caption?: string;
  display_order?: number;
}

export interface CompanyEvent {
  id: string | number;
  title: string;
  event_date?: string;
  date?: string;
  location?: string;
  description: string;
  type?: "Webinar" | "Hiring Drive" | "Workshop" | "Conference";
  is_featured?: boolean;
  images?: EventImage[];
}

export interface RecruiterProfile {
  // Identity
  id: number;
  username: string;
  display_name?: string;
  full_name?: string;
  company_name?: string;

  // Company Info
  company_website?: string;
  company_logo_url?: string;
  industry?: string;
  company_size?: string;
  location?: string;

  // Social & Contact
  linkedin_url?: string;
  company_email?: string;
  company_phone?: string;

  // About
  bio?: string;
  specialization?: string;
  years_experience?: number;

  // Meta
  recruiter_type?: string; // "company" | "recruiter" from API, kept flexible for type safety
  is_verified?: boolean;
  created_at?: string;
  profile_url?: string;

  // Relations
  gallery?: {
    images?: string[];
    total_images?: number;
  };
  company_images?: string[];
  recent_jobs?: Job[];
  events?: CompanyEvent[];
}

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

// ============================================================================
// Blog Types
// ============================================================================

export interface BlogAuthor {
  id: number;
  username: string;
  full_name: string;
  bio: string | null;
  avatar: string | null;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image: string | null;
  author: BlogAuthor;
  category: BlogCategory;
  tags: BlogTag[];
  view_count: number;
  reading_time: number;
  word_count: number;
  is_featured: boolean;
  published_at: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BlogPostDetailResponse extends BlogPost {}

export interface BlogCategoriesResponse {
  categories: BlogCategory[];
  total: number;
}

export interface BlogSearchResponse {
  results: BlogPost[];
  total: number;
  query: string;
  page: number;
  limit: number;
}
