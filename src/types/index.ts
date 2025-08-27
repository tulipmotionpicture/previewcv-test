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