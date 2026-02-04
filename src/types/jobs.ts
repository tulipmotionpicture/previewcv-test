// ============================================================================
// SEO Jobs Types
// ============================================================================

export interface Job {
  id: number;
  slug: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  is_remote: boolean;
  posted_date: string;
  categories: string[];
  required_skills: string[];
  is_applied: boolean;
  is_bookmarked: boolean;
  recruiter_profile_url: string | null;
  matchScore?: number;
  reasoning?: JobReasoning;
  why_recommended?: string[];
  relevance_score?: number;
  days_since_posted?: number;
}

export interface JobReasoning {
  skillsMatch: number;
  experienceMatch: number;
  salaryMatch: number;
  locationMatch: number;
  keyHighlights: string[];
  skillsBreakdown: SkillMatch[];
  missingSkills: string[];
}

export interface SkillMatch {
  name: string;
  matched: boolean;
  importance: "Required" | "Preferred" | "Nice to have";
}

export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "freelance"
  | "temporary";

export type ExperienceLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "manager"
  | "director"
  | "executive";

export interface SEOFilters {
  country: string | null;
  state: string | null;
  city: string | null;
  job_type: string | null;
  is_remote: boolean;
  skill_keywords: string[];
  industry: string | null;
  experience_level: string | null;
}

export interface SEOMeta {
  title: string;
  description: string;
  h1: string;
  keywords: string;
  canonical_url: string;
}

export interface SEOJobsResponse {
  success: boolean;
  slug: string;
  pattern_type: string;
  is_valid: boolean;
  filters_applied: SEOFilters;
  fallback_applied: "state" | "country" | null;
  meta: SEOMeta;
  jobs: Job[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SEOPattern {
  slug: string;
  count: number;
  pattern_type: string;
  location: string | null;
  job_type: string | null;
  is_remote: boolean;
}

export interface SEOPatternsResponse {
  success: boolean;
  patterns: SEOPattern[];
  total_patterns: number;
  generated_at: string;
}

// ============================================================================
// Job Cards Types
// ============================================================================

export interface CountryCard {
  country: string;
  count: number;
  slug: string;
  icon: string;
}

export interface CityCard {
  city: string;
  country: string | null;
  count: number;
  slug: string;
}

export interface IndustryCard {
  industry: string;
  count: number;
  slug: string;
  icon: string;
}

export interface JobTypeCard {
  job_type: string;
  label: string;
  count: number;
  slug: string;
  icon: string;
}

export interface ExperienceCard {
  experience_level: string;
  label: string;
  count: number;
  slug: string;
  icon: string;
}

export interface RemoteCard {
  type: "remote" | "onsite";
  label: string;
  count: number;
  slug: string;
  icon: string;
}

export interface CardsResponse<T> {
  success: boolean;
  cards: T[];
  generated_at: string;
}

export interface CountryCardsResponse extends CardsResponse<CountryCard> {
  total_countries: number;
}

export interface CityCardsResponse extends CardsResponse<CityCard> {
  total_cities: number;
  filter_country: string | null;
}

export interface IndustryCardsResponse extends CardsResponse<IndustryCard> {
  total_industries: number;
}

export interface JobTypeCardsResponse extends CardsResponse<JobTypeCard> {
  total_types: number;
}

export interface ExperienceCardsResponse extends CardsResponse<ExperienceCard> {
  total_levels: number;
}

export interface RemoteCardsResponse extends CardsResponse<RemoteCard> {
  total_jobs: number;
  remote_percentage: number;
}

export interface CardsSummaryResponse {
  success: boolean;
  countries: CountryCard[];
  cities: CityCard[];
  industries: IndustryCard[];
  job_types: JobTypeCard[];
  remote: RemoteCard[];
  stats: {
    total_countries: number;
    total_cities: number;
    total_industries: number;
    remote_percentage: number;
  };
  generated_at: string;
}

// ============================================================================
// Relevant Jobs Types
// ============================================================================

export interface RelevantJob extends Job {
  relevance_score: number;
  relevance_tier: string;
  score_breakdown: {
    skills_match: number;
    experience_match: number;
    location_match: number;
    job_type_match: number;
    category_match: number;
    salary_match: number;
    behavioral_signals: number;
  };
  matched_required_skills?: string[];
  missing_required_skills?: string[];
  matched_preferred_skills?: string[];
  missing_preferred_skills?: string[];
  why_recommended?: string[];
  days_since_posted?: number;
  description: string;
}

export interface RelevantJobsResponse {
  success: boolean;
  user_profile_completeness?: number;
  profile_completeness_message?: string;
  profile_improvement_tips?: string[] | null;
  showing_generic_jobs?: boolean;
  matching_criteria?: {
    total_skills: number;
    skills: string[];
    years_experience: number;
    experience_level: string;
    preferred_locations: string[];
    job_types: string[];
    categories: string[];
    salary_range: {
      min: number;
      max: number;
      currency: string;
    } | null;
  };
  profile_completeness: {
    score: number;
    improvement_tips: string[];
  };
  matching_criteria_summary: {
    total_jobs: number;
    average_score: number;
    top_matching_criteria: string[];
  };
  jobs: RelevantJob[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}
