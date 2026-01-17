// 1. Types
// 2. Custom hooks (useResumeParser, usePortfolioUpdate)
// 3. Components (ResumeUpload refactor)

export interface UploadResumeResponse {
  success: boolean;
  resume_id: number;
  resume_name: string;
  file_url: string;
  uploaded_at: string;
  parse_stream_url: string;
  message: string;
}

export interface ParseStatus {
  resume_id: number;
  parse_status: 'pending' | 'processing' | 'completed' | 'failed';
  parse_error?: string | null;
  parsed_at?: string | null;
}

export interface SSEEvent {
  event: 'connected' | 'started' | 'progress' | 'completed' | 'failed';
  data: {
    resume_id: number;
    message: string;
    metadata?: any;
    error?: string;
  };
}

export interface TransformedMetadata {
  resume_id: number;
  resume_name: string;
  parse_status: string;
  parsed_at: string;
  work_experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  personal_details: PersonalDetails | null;
  summary: {
    total_items: number;
    by_type: Record<string, number>;
  };
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  country?: string | null;
  city?: string | null;
  description?: string | null;
  _preview: string;
  _original: any;
}

export interface Education {
  degree: string;
  university: string;
  field_of_study?: string | null;
  start_year: string;
  end_year?: string | null;
  is_currently_studying: boolean;
  gpa?: string | null;
  country?: string | null;
  city?: string | null;
  _preview: string;
  _original: any;
}

export interface Skill {
  skill_name: string;
  proficiency_level: number;
  _proficiency_label: string;
  _proficiency_numeric: number;
  _preview: string;
  _original: any;
}

export interface Language {
  language: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'native';
  can_read: boolean;
  can_write: boolean;
  can_speak: boolean;
  _proficiency_label: string;
  _preview: string;
  _original: any;
}

export interface PersonalDetails {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_code?: string | null;
  country_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_zip_code?: string | null;
  address?: string | null;
  street_number?: string | null;
  current_title?: string | null;
  profile_description?: string | null;
  _note: string;
  _can_auto_save: boolean;
  _preview: string;
  _original: any;
}

export interface SaveReviewedMetadataRequest {
  work_experiences: Omit<WorkExperience, '_preview' | '_original'>[];
  education: Omit<Education, '_preview' | '_original'>[];
  skills: Omit<Skill, '_preview' | '_original' | '_proficiency_label' | '_proficiency_numeric'>[];
  languages: Omit<Language, '_preview' | '_original' | '_proficiency_label'>[];
  portfolio?: Omit<PersonalDetails, '_note' | '_can_auto_save' | '_preview' | '_original'>;
}

export interface SaveReviewedMetadataResponse {
  success: boolean;
  resume_id: number;
  saved: {
    [entityType: string]: {
      count: number;
      ids: number[];
    };
  };
  total_saved: number;
  portfolio_updated: boolean;
  errors: string[];
}

export interface UpdatePortfolioInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_code?: string;
  country_code?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_zip_code?: string;
  address?: string;
  current_title?: string;
  profile_description?: string;
}
