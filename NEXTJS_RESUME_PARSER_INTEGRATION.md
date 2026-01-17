# Next.js Resume Parser Integration Guide

Complete guide for integrating PDF resume parsing and metadata import into your Next.js frontend.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Complete Flow Overview](#complete-flow-overview)
3. [TypeScript Types](#typescript-types)
4. [API Hooks](#api-hooks)
5. [React Components](#react-components)
6. [Portfolio Update](#portfolio-update)
7. [Error Handling](#error-handling)
8. [Example App](#example-app)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
# All required dependencies already in package.json
```

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://letsmakecv.tulip-software.com/api/v1
NEXT_PUBLIC_GRAPHQL_URL=https://letsmakecv.tulip-software.com/graphql
```

### 3. Create API Client

```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}
```

---

## Complete Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UPLOAD PDF                                                   │
│    POST /pdf-resumes/upload                                     │
│    → resume_id, parse_stream_url                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. REAL-TIME PARSING (SSE)                                      │
│    GET /pdf-resumes/{id}/parse-stream                           │
│    → Events: connected, started, progress, completed, failed    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. GET TRANSFORMED DATA                                         │
│    GET /pdf-resumes/{id}/transform-for-graphql                  │
│    → work_experiences, education, skills, languages,            │
│      personal_details (Portfolio fields)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. USER REVIEWS IN UI                                           │
│    ✓ Select work experiences to save                           │
│    ✓ Select education entries                                  │
│    ✓ Select skills                                             │
│    ✓ Select languages                                          │
│    ✓ Option to update Portfolio with personal_details          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. SAVE SELECTED ITEMS                                          │
│    POST /pdf-resumes/{id}/save-reviewed-metadata                │
│    → Creates entities in database                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. UPDATE PORTFOLIO (Optional)                                  │
│    GraphQL: updatePortfolio mutation                            │
│    → Updates user's public profile                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## TypeScript Types

### Complete Type Definitions

```typescript
// types/resume-parser.ts

// ============= API Response Types =============

export interface UploadResumeResponse {
  success: boolean;
  resume_id: number;
  resume_name: string;
  file_url: string;
  uploaded_at: string;
  parse_stream_url: string;  // ✅ Use this for SSE
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

// ============= Transformed Metadata Types =============

export interface TransformedMetadata {
  resume_id: number;
  resume_name: string;
  parse_status: string;
  parsed_at: string;
  work_experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  personal_details: PersonalDetails | null;  // ✅ Maps to Portfolio
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
  proficiency_level: number;  // ✅ INTEGER 1-10
  _proficiency_label: string;
  _proficiency_numeric: number;
  _preview: string;
  _original: any;
}

export interface Language {
  language: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'native';  // ✅ ENUM
  can_read: boolean;
  can_write: boolean;
  can_speak: boolean;
  _proficiency_label: string;
  _preview: string;
  _original: any;
}

// ✅ NEW: Personal details map to Portfolio, not PersonalInfo entity
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
  _note: string;  // Explains Portfolio mapping
  _can_auto_save: boolean;  // Always false
  _preview: string;
  _original: any;
}

// ============= Save Request/Response Types =============

export interface SaveReviewedMetadataRequest {
  work_experiences: Omit<WorkExperience, '_preview' | '_original'>[];
  education: Omit<Education, '_preview' | '_original'>[];
  skills: Omit<Skill, '_preview' | '_original' | '_proficiency_label' | '_proficiency_numeric'>[];
  languages: Omit<Language, '_preview' | '_original' | '_proficiency_label'>[];
  portfolio?: Omit<PersonalDetails, '_note' | '_can_auto_save' | '_preview' | '_original'>;  // ✅ NEW: Portfolio update support
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
  portfolio_updated: boolean;  // ✅ NEW: Whether Portfolio was updated
  errors: string[];
}

// ============= GraphQL Portfolio Types =============

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
```

---

## API Hooks

### Custom Hooks for Resume Parser

```typescript
// hooks/useResumeParser.ts
import { useState } from 'react';
import { apiRequest } from '@/lib/api-client';
import type {
  UploadResumeResponse,
  TransformedMetadata,
  SaveReviewedMetadataRequest,
  SaveReviewedMetadataResponse,
} from '@/types/resume-parser';

export function useResumeParser() {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [transforming, setTransforming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Upload PDF
  const uploadResume = async (file: File, resumeName: string) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resume_name', resumeName);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pdf-resumes/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data: UploadResumeResponse = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // 2. Connect to SSE stream
  const connectToParseStream = (
    resumeId: number,
    onEvent: (event: any) => void,
    onComplete: (metadata: any) => void,
    onError: (error: string) => void
  ) => {
    setParsing(true);
    const token = localStorage.getItem('auth_token');
    
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/pdf-resumes/${resumeId}/parse-stream?token=${token}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);

      if (data.event === 'completed') {
        setParsing(false);
        onComplete(data.data.metadata);
        eventSource.close();
      } else if (data.event === 'failed') {
        setParsing(false);
        onError(data.data.error || 'Parsing failed');
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setParsing(false);
      onError('Connection error');
      eventSource.close();
    };

    return eventSource;
  };

  // 3. Get transformed metadata
  const getTransformedMetadata = async (resumeId: number) => {
    setTransforming(true);
    setError(null);

    try {
      const data = await apiRequest<TransformedMetadata>(
        `/pdf-resumes/${resumeId}/transform-for-graphql`
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setTransforming(false);
    }
  };

  // 4. Save reviewed metadata
  const saveReviewedMetadata = async (
    resumeId: number,
    request: SaveReviewedMetadataRequest
  ) => {
    setSaving(true);
    setError(null);

    try {
      const data = await apiRequest<SaveReviewedMetadataResponse>(
        `/pdf-resumes/${resumeId}/save-reviewed-metadata`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    uploading,
    parsing,
    transforming,
    saving,
    error,
    uploadResume,
    connectToParseStream,
    getTransformedMetadata,
    saveReviewedMetadata,
  };
}
```

### GraphQL Portfolio Hook

```typescript
// hooks/usePortfolioUpdate.ts
import { useState } from 'react';
import type { UpdatePortfolioInput } from '@/types/resume-parser';

export function usePortfolioUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePortfolio = async (
    portfolioId: string,
    input: UpdatePortfolioInput
  ) => {
    setUpdating(true);
    setError(null);

    try {
      const query = `
        mutation UpdatePortfolio($id: ID!, $input: PortfolioUpdateInput!) {
          updatePortfolio(id: $id, input: $input) {
            success
            errors
            portfolio {
              id
              first_name
              last_name
              email
              phone
              current_title
              city
              state
              country
            }
          }
        }
      `;

      const response = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL!,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            query,
            variables: { id: portfolioId, input },
          }),
        }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data.updatePortfolio.success) {
        throw new Error(
          result.data.updatePortfolio.errors?.[0] || 'Update failed'
        );
      }

      return result.data.updatePortfolio.portfolio;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { updating, error, updatePortfolio };
}
```

---

## React Components

### 1. Upload Component

```tsx
// components/ResumeUpload.tsx
'use client';

import { useState } from 'react';
import { useResumeParser } from '@/hooks/useResumeParser';
import { useRouter } from 'next/navigation';

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState('');
  const { uploadResume, uploading, error } = useResumeParser();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!resumeName) {
        setResumeName(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadResume(file, resumeName);
      // Navigate to parsing page
      router.push(`/resumes/${result.resume_id}/parse`);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Resume</h1>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select PDF Resume
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* Resume Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Resume Name
        </label>
        <input
          type="text"
          value={resumeName}
          onChange={(e) => setResumeName(e.target.value)}
          placeholder="My Professional Resume"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || !resumeName || uploading}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          font-medium transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload & Parse Resume'}
      </button>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📝 What happens next?</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Upload your PDF resume</li>
          <li>Real-time parsing with PreviewCV AI</li>
          <li>Review extracted data</li>
          <li>Select what to save to your profile</li>
        </ol>
      </div>
    </div>
  );
}
```

### 2. Parsing Progress Component (SSE)

```tsx
// components/ResumeParsingProgress.tsx
'use client';

import { useEffect, useState } from 'react';
import { useResumeParser } from '@/hooks/useResumeParser';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface Props {
  resumeId: number;
}

export default function ResumeParsingProgress({ resumeId }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const { connectToParseStream, parsing } = useResumeParser();
  const router = useRouter();

  useEffect(() => {
    const eventSource = connectToParseStream(
      resumeId,
      // On event
      (event) => {
        setEvents((prev) => [...prev, event]);
      },
      // On complete
      (metadata) => {
        setCompleted(true);
        setTimeout(() => {
          router.push(`/resumes/${resumeId}/review`);
        }, 2000);
      },
      // On error
      (error) => {
        setEvents((prev) => [
          ...prev,
          { event: 'failed', data: { message: error } },
        ]);
      }
    );

    return () => {
      eventSource?.close();
    };
  }, [resumeId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Parsing Resume...</h1>

      {/* Progress Timeline */}
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 bg-white rounded-lg shadow"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {event.event === 'completed' && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
              {event.event === 'failed' && (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              {event.event === 'progress' && (
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              )}
              {event.event === 'started' && (
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              )}
              {event.event === 'connected' && (
                <CheckCircle className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold capitalize">
                  {event.event}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 mt-1">{event.data.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {parsing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
          <Loader className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-blue-700">Parsing in progress...</span>
        </div>
      )}

      {/* Completed State */}
      {completed && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-medium">
            ✅ Parsing completed! Redirecting to review page...
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3. Review & Select Component

```tsx
// components/ResumeReview.tsx
'use client';

import { useEffect, useState } from 'react';
import { useResumeParser } from '@/hooks/useResumeParser';
import { usePortfolioUpdate } from '@/hooks/usePortfolioUpdate';
import type {
  TransformedMetadata,
  WorkExperience,
  Education,
  Skill,
  Language,
} from '@/types/resume-parser';

interface Props {
  resumeId: number;
  portfolioId?: string;
}

export default function ResumeReview({ resumeId, portfolioId }: Props) {
  const [data, setData] = useState<TransformedMetadata | null>(null);
  const [selected, setSelected] = useState({
    work_experiences: [] as WorkExperience[],
    education: [] as Education[],
    skills: [] as Skill[],
    languages: [] as Language[],
  });
  const [updatePortfolioChecked, setUpdatePortfolioChecked] = useState(false);

  const {
    getTransformedMetadata,
    saveReviewedMetadata,
    transforming,
    saving,
    error,
  } = useResumeParser();

  const { updatePortfolio, updating } = usePortfolioUpdate();

  // Load transformed data
  useEffect(() => {
    loadData();
  }, [resumeId]);

  const loadData = async () => {
    try {
      const result = await getTransformedMetadata(resumeId);
      setData(result);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const toggleItem = <T,>(
    type: keyof typeof selected,
    item: T,
    preview: string
  ) => {
    setSelected((prev) => {
      const list = prev[type] as any[];
      const exists = list.some((i: any) => i._preview === preview);
      return {
        ...prev,
        [type]: exists
          ? list.filter((i: any) => i._preview !== preview)
          : [...list, item],
      };
    });
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      // 1. Prepare clean data (remove metadata fields)
      const cleanData: any = {
        work_experiences: selected.work_experiences.map((exp) => {
          const { _preview, _original, ...clean } = exp;
          return clean;
        }),
        education: selected.education.map((edu) => {
          const { _preview, _original, ...clean } = edu;
          return clean;
        }),
        skills: selected.skills.map((skill) => {
          const { _preview, _original, _proficiency_label, _proficiency_numeric, ...clean } = skill;
          return clean;
        }),
        languages: selected.languages.map((lang) => {
          const { _preview, _original, _proficiency_label, ...clean } = lang;
          return clean;
        }),
      };

      // 2. Add portfolio data if user wants to update (✅ NEW: Pure REST!)
      if (updatePortfolioChecked && data.personal_details) {
        const { _note, _can_auto_save, _preview, _original, ...portfolioClean } = data.personal_details;
        cleanData.portfolio = portfolioClean;
      }

      // 3. Save everything via REST (including Portfolio!)
      const result = await saveReviewedMetadata(resumeId, cleanData);

      // 4. Show success message
      const message = result.portfolio_updated
        ? `✅ Success! Saved ${result.total_saved} items + updated Portfolio`
        : `✅ Success! Saved ${result.total_saved} items`;
      
      alert(message);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (transforming) {
    return <div className="p-6">Loading data...</div>;
  }

  if (!data) {
    return <div className="p-6">No data available</div>;
  }

  const totalSelected =
    selected.work_experiences.length +
    selected.education.length +
    selected.skills.length +
    selected.languages.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Review Resume Data</h1>
      <p className="text-gray-600 mb-6">
        Select the items you want to save to your profile
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Work Experiences */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Work Experience ({data.work_experiences.length})
        </h2>
        <div className="space-y-3">
          {data.work_experiences.map((exp, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.work_experiences.some(
                    (e) => e._preview === exp._preview
                  )}
                  onChange={() =>
                    toggleItem('work_experiences', exp, exp._preview)
                  }
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold">{exp._preview}</div>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {exp.description.substring(0, 150)}...
                    </p>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Education ({data.education.length})
        </h2>
        <div className="space-y-3">
          {data.education.map((edu, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.education.some(
                    (e) => e._preview === edu._preview
                  )}
                  onChange={() => toggleItem('education', edu, edu._preview)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold">{edu._preview}</div>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Skills ({data.skills.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.skills.map((skill, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.skills.some(
                    (s) => s._preview === skill._preview
                  )}
                  onChange={() => toggleItem('skills', skill, skill._preview)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{skill.skill_name}</div>
                  <div className="text-xs text-gray-500">
                    {skill.proficiency_level}/10
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Languages ({data.languages.length})
        </h2>
        <div className="space-y-3">
          {data.languages.map((lang, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.languages.some(
                    (l) => l._preview === lang._preview
                  )}
                  onChange={() => toggleItem('languages', lang, lang._preview)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <span className="font-semibold">{lang.language}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {lang.proficiency_level}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Details (Portfolio) */}
      {data.personal_details && portfolioId && (
        <section className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            {data.personal_details._note}
          </p>

          <div className="mb-4 p-4 bg-white rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span>{' '}
                {data.personal_details.first_name}{' '}
                {data.personal_details.last_name}
              </div>
              <div>
                <span className="font-medium">Email:</span>{' '}
                {data.personal_details.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span>{' '}
                {data.personal_details.phone}
              </div>
              <div>
                <span className="font-medium">City:</span>{' '}
                {data.personal_details.city}, {data.personal_details.country}
              </div>
              {data.personal_details.current_title && (
                <div className="col-span-2">
                  <span className="font-medium">Title:</span>{' '}
                  {data.personal_details.current_title}
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={updatePortfolioChecked}
              onChange={(e) => setUpdatePortfolioChecked(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-medium">
              ✨ Update my profile with these details
            </span>
          </label>
        </section>
      )}

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white border-t p-4 -mx-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalSelected} item{totalSelected !== 1 && 's'} selected
            {updatePortfolioChecked && ' + Portfolio update'}
          </div>
          <button
            onClick={handleSave}
            disabled={totalSelected === 0 || saving || updating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              font-medium transition-colors"
          >
            {saving || updating
              ? 'Saving...'
              : `Save ${totalSelected} Item${totalSelected !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Portfolio Update

### ✅ NEW: Pure REST API (No GraphQL Needed!)

**Portfolio can now be updated via the REST save endpoint!**

Simply include `portfolio` in your request:

```typescript
const result = await fetch(`/api/v1/pdf-resumes/${resumeId}/save-reviewed-metadata`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skills: [...],
    languages: [...],
    portfolio: {  // ✅ NEW: Include portfolio fields
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "+91(902) 146-1356",
      phone_code: "+91",
      country_code: "IN",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      current_title: "Software Engineer",
      profile_description: "Experienced developer"
    }
  })
});

console.log(result.portfolio_updated); // true
```

**Why Pure REST?**
- GraphQL is only used in letsmakecv
- PreviewCV needs pure REST API
- Simpler integration, no GraphQL client needed

---

### Alternative: GraphQL Mutation (Only if you're using GraphQL)

```graphql
mutation UpdatePortfolio($id: ID!, $input: PortfolioUpdateInput!) {
  updatePortfolio(id: $id, input: $input) {
    success
    errors
    portfolio {
      id
      first_name
      last_name
      email
      phone
      phone_code
      country_code
      city
      state
      country
      postal_zip_code
      address
      current_title
      profile_description
    }
  }
}
```

### Variables

```json
{
  "id": "1",
  "input": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+91(902) 146-1356",
    "phone_code": "+91",
    "country_code": "IN",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "postal_zip_code": "400001",
    "address": "123 Main Street",
    "current_title": "Software Engineer",
    "profile_description": "Experienced developer..."
  }
}
```

---

## Error Handling

### Common Errors & Solutions

```typescript
// utils/error-handler.ts

export function handleResumeParserError(error: any): string {
  if (error.message?.includes('401')) {
    return 'Please log in again';
  }

  if (error.message?.includes('404')) {
    return 'Resume not found';
  }

  if (error.message?.includes('proficiency_level')) {
    return 'Invalid skill proficiency. Must be integer 1-10';
  }

  if (error.message?.includes('beginner')) {
    return 'Invalid language proficiency. Must be: beginner, intermediate, advanced, expert, or native';
  }

  if (error.message?.includes('parsing not completed')) {
    return 'Resume is still being parsed. Please wait...';
  }

  return error.message || 'An error occurred';
}
```

---

## Example App

### Complete Page Flow

```typescript
// app/resumes/upload/page.tsx
import ResumeUpload from '@/components/ResumeUpload';

export default function UploadPage() {
  return <ResumeUpload />;
}

// app/resumes/[id]/parse/page.tsx
import ResumeParsingProgress from '@/components/ResumeParsingProgress';

export default function ParsePage({ params }: { params: { id: string } }) {
  return <ResumeParsingProgress resumeId={parseInt(params.id)} />;
}

// app/resumes/[id]/review/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import ResumeReview from '@/components/ResumeReview';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const portfolioId = session?.user?.portfolioId;

  return (
    <ResumeReview
      resumeId={parseInt(params.id)}
      portfolioId={portfolioId}
    />
  );
}
```

---

## 🎯 Quick Checklist

- [ ] Install dependencies
- [ ] Set environment variables
- [ ] Create API client
- [ ] Add TypeScript types
- [ ] Create hooks (useResumeParser, usePortfolioUpdate)
- [ ] Build upload component
- [ ] Build parsing progress component (SSE)
- [ ] Build review component
- [ ] Test upload flow
- [ ] Test SSE connection
- [ ] Test data transformation
- [ ] Test save functionality
- [ ] Test portfolio update

---

## 📚 Related Documentation

- [Complete Metadata Workflow Guide](./COMPLETE_METADATA_WORKFLOW_GUIDE.md)
- [SSE Integration Guide](./NEXTJS_SSE_INTEGRATION_GUIDE.md)
- [Tag Consolidation Summary](./TAG_CONSOLIDATION_SUMMARY.md)
- [Transform for GraphQL Guide](./TRANSFORM_FOR_GRAPHQL_GUIDE.md)

---

## ✅ Summary

This guide provides everything you need to integrate PDF resume parsing into your Next.js app:

✅ Complete TypeScript types  
✅ Custom React hooks  
✅ Ready-to-use components  
✅ SSE real-time updates  
✅ Portfolio integration  
✅ Error handling  
✅ Full examples  

**Copy, paste, customize, and you're ready to go!** 🚀
