export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  created_at?: string;
  location?: string;
  current_position?: string;
  bio?: string;
  profile_image_url?: string;
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
  country?: string;
  state?: string;
  city?: string;
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
  is_active: boolean;
  updated_at: string;
  // Extended fields for UI
  recruiter_username?: string;
  recruiter_profile_url?: string;
  industry?: string;
  is_bookmarked?: boolean;
  is_applied: boolean;
}

export interface ApplicationApplicant {
  id: number;
  email: string;
  full_name: string;
  role?: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  phone_code?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  street_number?: string;
  address?: string;
  postal_zip_code?: string;
  profile_image_url?: string;
}

export interface ApplicationResumeDetail {
  id: number;
  name: string;
  current_title?: string;
  pdf_url?: string | null;
  created_at?: string;
}

export interface ApplicationResume {
  id: number;
  name: string;
  pdf_url?: string | null;
  created_at?: string;
}

export interface ApplicationUploadedResume {
  id: number;
  name?: string;
  pdf_url?: string | null;
  created_at?: string;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  user_id: number;
  candidate_name: string;
  candidate_email: string;
  resume_id: number;
  uploaded_resume_id?: number | null;
  cover_letter_id?: number | null;
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
  updated_at: string;
  created_at?: string;
  custom_message?: string | null;
  cover_letter?: string;
  notes?: string;
  applicant?: ApplicationApplicant;
  resume?: ApplicationResume;
  uploaded_resume?: ApplicationUploadedResume | null;
  // Job details (if populated by API)
  job?: Job;
  job_title?: string;
  company_name?: string;
  job_slug?: string;
  company_logo_url?: string;
  location?: string;
  is_remote?: boolean;
  job_type?: string;
  experience_level?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  is_job_active?: boolean;
  posted_date?: string;
  application_deadline?: string | null;
  total_applicants?: number;
  recruiter_viewed?: boolean;
  recruiter_viewed_at?: string | null;
  recruiter_view_count?: number;
  recruiter_message?: string | null;
  recruiter_message_at?: string | null;
  interview?: any | null;
}

export interface JobApplicationsResponse {
  success: boolean;
  job_id: number;
  job_title: string;
  total_applications: number;
  applications: Application[];
}

export interface MyApplicationsResponse {
  success: boolean;
  total: number;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    has_more: boolean;
    has_previous: boolean;
  };
  applications: Application[];
}

export interface ApplicationStatsResponse {
  success: boolean;
  total_applications: {
    total: number;
    weekly_change: number;
    percentage_change?: number;
  };
  interview_invites: {
    total: number;
    weekly_change: number;
    percentage_change?: number;
  };
  offers_received: {
    total: number;
    weekly_change: number;
    percentage_change?: number;
  };
}

export interface ApplicationDetailResponse {
  success: boolean;
  application: {
    id: number;
    status: Application["status"];
    applied_at: string;
    custom_message?: string | null;
    portfolio_items: string[];
    created_at: string;
    updated_at: string;
  };
  candidate: ApplicationApplicant;
  job: {
    id: number;
    title: string;
    slug: string;
    company_name: string;
    location: string;
  };
  resume: ApplicationResumeDetail | null;
  uploaded_resume: ApplicationUploadedResume | null;
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
  jobs?: T[];
  total: number;
  data?: T[];
  page: number;
  size: number;
  pages: number;
}

export interface MyJobPostingResponse<T> {
  success: boolean;
  data: {
    jobs: T[];
    pagination: {
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
      offset: number;
      limit: number;
    };
  };
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

export interface TopHiringPartner {
  id: number;
  username: string;
  company_name: string;
  company_logo_url?: string;
  industry?: string;
  active_jobs_count: number;
}

export interface TopHiringPartnersResponse {
  success: boolean;
  total: number;
  hiring_partners: TopHiringPartner[];
}

// KYC Types
export interface KycDocument {
  id: number;
  recruiter_id: number;
  document_type: string;
  original_filename: string;
  file_size_bytes: number;
  file_size_mb: number;
  status: string;
  document_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  is_expired: boolean;
  days_until_expiry?: number;
  needs_renewal_warning: boolean;
  issuing_country: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  download_url?: string;
}

export interface KycStatus {
  kyc_status: "not_submitted" | "pending_review" | "approved" | "rejected";
  kyc_status_display: string;
  kyc_submitted_at?: string;
  kyc_approved_at?: string;
  kyc_rejection_reason?: string;
  can_post_jobs: boolean;
  uploaded_documents_count: number;
  approved_documents_count: number;
  rejected_documents_count: number;
  pending_documents_count: number;
}

export interface KycRequirement {
  id: number;
  country_code: string;
  recruiter_type: string;
  document_type: string;
  is_required: boolean;
  display_name: string;
  description: string;
  accepts_expiry_date: boolean;
  max_age_days?: number;
  priority: number;
  display_order: number;
}

export interface KycRequirementsResponse {
  requirements: KycRequirement[];
  country_code: string;
  recruiter_type: string;
}

// Pricing Types
export interface JobPlan {
  id: number;
  name: string;
  slug: string;
  job_post_limit: number | null;
  applicants_per_job: number | null;
  job_duration_days: number;
  has_basic_visibility: boolean;
  has_limited_analytics: boolean;
  has_analytics: boolean;
  has_bulk_messaging: boolean;
  has_featured_jobs: boolean;
  has_priority_support: boolean;
  price_usd: string;
  price_inr: string;
  billing_period: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CvPlan {
  id: number;
  name: string;
  slug: string;
  credits_per_period: number;
  has_advanced_filters: boolean;
  has_bulk_download: boolean;
  has_priority_cv_access: boolean;
  price_usd: string;
  price_inr: string;
  billing_period: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RecruiterPricingResponse {
  job_plans: JobPlan[];
  cv_plans: CvPlan[];
}

// Subscription Types
export interface JobSubscription {
  id: number;
  recruiter_id: number;
  plan_config_id: number;
  status: "active" | "cancelled" | "expired" | "paused";
  stripe_subscription_id: string | null;
  razorpay_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  jobs_posted_this_period: number;
  period_reset_at: string;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan_config: JobPlan;
  jobs_remaining?: number;
  can_post_jobs?: boolean;
  days_until_renewal?: number;
}

export interface CvSubscription {
  id: number;
  recruiter_id: number;
  plan_config_id: number;
  status: "active" | "cancelled" | "expired" | "paused";
  credits_remaining: number;
  credits_used_this_period: number;
  stripe_subscription_id: string | null;
  razorpay_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan_config: CvPlan;
  credits_percentage_used?: number;
  has_credits?: boolean;
  days_until_renewal?: number;
}

export interface SubscriptionDashboard {
  job_subscription: JobSubscription | null;
  cv_subscription: CvSubscription | null;
  has_active_job_subscription: boolean;
  has_active_cv_subscription: boolean;
  total_monthly_cost_usd: number;
  total_monthly_cost_inr: number;
}

export interface PlanSummary {
  job_plan: {
    name: string;
    billing_cycle: string;
    posts_remaining: number;
    posts_limit: number;
    renewal_date: string;
    amount: number;
  } | null;
  cv_plan: {
    name: string;
    credits_remaining: number;
    expiry_date: string | null;
  } | null;
}

export interface SubscriptionHistory {
  subscription_id: number;
  subscription_type: string;
  plan_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  is_current: boolean;
}

export interface SubscriptionHistoryResponse {
  job_subscriptions: SubscriptionHistory[];
  cv_subscriptions: SubscriptionHistory[];
}

export interface CreditsBalance {
  total_credits: number;
  credits_used: number;
  credits_remaining: number;
  credits_purchased_this_month: number;
  credits_used_this_month: number;
  recent_transactions: CreditTransaction[];
}

export interface CreditTransaction {
  id: number;
  type: "purchase" | "usage" | "refund" | "bonus";
  credits: number;
  description: string;
  created_at: string;
}

export interface CreateJobSubscriptionRequest {
  plan_config_id: number;
  payment_gateway: "stripe" | "razorpay";
}

export interface CreateCvSubscriptionRequest {
  plan_config_id: number;
  payment_gateway: "stripe" | "razorpay";
}

export interface CancelSubscriptionRequest {
  cancel_at_period_end: boolean;
  cancellation_reason?: string;
}

export interface CancelSubscriptionResponse {
  subscription_id: number;
  subscription_type: string;
  status: string;
  canceled_at: string;
  cancel_at_period_end: boolean;
  will_expire_at: string;
  message: string;
}

// --- Recruiter Dashboard Analytics ---
export interface TrendMetric {
  count: number;
  change_percentage: number | null;
  previous_month_count: number;
  trend: "up" | "down" | "stable";
}

export interface InterviewMetrics extends TrendMetric {
  upcoming: number;
  completed: number;
  total: number;
}

export interface PendingApprovalsMetrics {
  jobs_pending_approval: number;
  applications_pending_review: number;
  total: number;
}

export interface ApplicationPipeline {
  applied: number;
  under_review: number;
  interview_scheduled: number;
  interviewed: number;
  offered: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export interface TopJobMetric {
  job_id: number;
  title: string;
  application_count: number;
  view_count: number;
  posted_date: string;
}

export interface SubscriptionUsageMetrics {
  plan_name: string;
  jobs_posted_this_period: number;
  jobs_remaining: number;
  cv_credits_remaining: number;
  period_end: string;
}

export interface AnalyticsPeriod {
  current_month_start: string;
  current_month_end: string;
  previous_month_start: string;
  previous_month_end: string;
}

export interface RecruiterDashboardAnalytics {
  success: boolean;
  active_jobs: TrendMetric;
  total_applications: TrendMetric;
  interviews: InterviewMetrics;
  pending_approvals: PendingApprovalsMetrics;
  application_pipeline: ApplicationPipeline;
  top_jobs: TopJobMetric[];
  subscription_usage: SubscriptionUsageMetrics;
  period: AnalyticsPeriod;
  generated_at: string;
}

// CV Search Types
export interface CVSearchResult {
  resume_id: number;
  resume_name: string;
  professional_title: string;
  user_id: number;
  is_unlocked: boolean;
  unlocked_until?: string;
  full_name: string;
  profile_image_url?: string;
  location: string;
  skills: string[];
  experience_years: number;
  current_company?: string;
  highest_education: string;
  languages: string[];
  certifications_count: number;
  profile_summary?: string;
  user_other_resumes?: Array<{
    resume_id: number;
    resume_name: string;
    professional_title: string;
    is_unlocked: boolean;
    created_at: string;
    updated_at: string;
  }>;
  in_buckets?: any[];
  bucket_count: number;
  last_active: string;
  open_to_work: boolean;
  created_at: string;
  updated_at: string;
}

export interface CVSearchResponse {
  results: CVSearchResult[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  filters_applied: Record<string, any>;
  search_performed_at: string;
}

export interface SearchHistoryTrendItem {
  id: number;
  result_count: number;
  recorded_at: string;
}

export interface SearchResultCountTrendResponse {
  search_history_id: number;
  history: SearchHistoryTrendItem[];
  total_records: number;
}

export interface SearchHistoryItem {
  id: number;
  name?: string;
  search_name?: string;
  filters: Record<string, any>;
  search_filters?: Record<string, any>;
  result_count: number;
  latest_result_count?: number;
  created_at: string;
  last_used_at: string;
  use_count: number;
  result_count_change?: number;
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
  total: number;
}

export interface CVUnlockResponse {
  success: boolean;
  message: string;
  credits_remaining: number;
  resume_id: number;
  resume_name: string;
  resume_pdf_url?: string;
  resume_data?: Record<string, any>;
  contact_info: {
    email?: string;
    phone?: string;
    full_name?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  unlocked_at: string;
  unlocked_until: string;
}

export interface CVBulkUnlockResponse {
  success: boolean;
  unlocked_count: number;
  already_unlocked_count: number;
  credits_used: number;
  credits_remaining: number;
  unlocked_resume_ids: number[];
  skipped_resume_ids: number[];
  summary_message: string;
}

export interface UnlockedProfile {
  id: number;
  recruiter_id: number;
  resume_id: number;
  unlocked_at: string;
  expires_at: string;
  credits_used: number;
  unlock_source: string;
  last_accessed_at?: string;
  view_count: number;
  download_count: number;
  profile_summary?: Record<string, any>;
}

export interface UnlockedProfilesResponse {
  unlocked_profiles: UnlockedProfile[];
  total: number;
  active_unlocks: number;
  expired_unlocks: number;
  total_credits_invested: number;
}

export interface CVAccessLog {
  id: number;
  recruiter_id: number;
  resume_id: number;
  access_type: string;
  credits_consumed: number;
  accessed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AccessLogsResponse {
  access_logs: CVAccessLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_credits_consumed: number;
  total_searches: number;
  total_unlocks: number;
  total_views: number;
  total_downloads: number;
}

export interface CVCreditsStatus {
  credits_remaining: number;
  total_unlocked_profiles: number;
  active_unlocks: number;
  message: string;
}

// Bucket Types
export interface Bucket {
  id: number;
  recruiter_id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BucketWithStats extends Bucket {
  item_count: number;
  avg_rating?: number;
  locked_count?: number;
  unlocked_count?: number;
}

export interface BucketListResponse {
  buckets: BucketWithStats[];
  total: number;
}

export interface BucketItem {
  id: number;
  bucket_id: number;
  resume_id: number;
  recruiter_id: number;
  display_order: number;
  notes?: string;
  rating?: number;
  status?: string;
  added_at: string;
  updated_at: string;
}

export interface ResumeBucketInfo {
  item_id: number;
  bucket_id: number;
  bucket_name: string;
  bucket_color?: string;
  rating?: number;
  status?: string;
  notes?: string;
  added_at: string;
}

export interface AddResumesToBucketRequest {
  resume_ids: number[];
  notes?: string;
  rating?: number;
  status?: string;
}

export interface AddResumesToBucketResponse {
  success: boolean;
  message: string;
  data: {
    bucket_id: number;
    added_count: number;
    skipped_count: number;
  };
}

export interface BucketActivityLog {
  id: number;
  bucket_id: number;
  recruiter_id: number;
  action: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Bulk Download Types
export interface BulkDownloadTaskResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: {
    download_url?: string;
    total_resumes?: number;
    file_size_mb?: number;
    expires_at?: string;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}
