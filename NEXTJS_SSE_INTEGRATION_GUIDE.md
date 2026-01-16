# Next.js Integration Guide - Resume Parser with SSE

## 📚 Complete Integration Guide for Next.js 13+ (App Router)

This guide provides everything you need to integrate the Resume Parser with real-time SSE updates into your Next.js application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [TypeScript Types](#typescript-types)
4. [API Configuration](#api-configuration)
5. [Custom Hooks](#custom-hooks)
6. [UI Components](#ui-components)
7. [Complete Example](#complete-example)
8. [Pages Router (Next.js 12)](#pages-router-nextjs-12)
9. [Error Handling](#error-handling)
10. [Production Deployment](#production-deployment)

---

## 1. Prerequisites

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 2. Project Setup

### Directory Structure

```
app/
├── api/
│   └── resumes/
│       ├── upload/
│       │   └── route.ts          # Upload proxy endpoint
│       └── stream/
│           └── [id]/
│               └── route.ts      # SSE proxy endpoint (optional)
├── components/
│   ├── resume/
│   │   ├── ResumeUploader.tsx    # Main component
│   │   ├── UploadProgress.tsx    # Progress display
│   │   └── MetadataViewer.tsx    # Results display
│   └── ui/
│       ├── Button.tsx
│       └── Card.tsx
├── hooks/
│   ├── useResumeParser.ts        # SSE integration hook
│   └── useAuth.ts                # Auth hook
├── lib/
│   ├── api.ts                    # API client
│   └── types.ts                  # TypeScript types
└── page.tsx
```

---

## 3. TypeScript Types

### `lib/types.ts`

```typescript
// ==========================================
// API Response Types
// ==========================================

export interface UploadResponse {
  success: boolean;
  message: string;
  resume_id: number;
  resume_name: string;
  file_size_mb: number;
  bunny_cdn_url: string;
  permanent_link: PermanentLink;
  parse_stream_url: string;
  created_at: string;
}

export interface PermanentLink {
  token: string;
  share_url: string;
  qr_code_base64: string;
  view_count: number;
  access_count: number;
}

// ==========================================
// SSE Event Types
// ==========================================

export type SSEEventType = 
  | 'connected' 
  | 'started' 
  | 'progress' 
  | 'completed' 
  | 'failed' 
  | 'error';

export interface SSEEvent<T = any> {
  resume_id: number;
  event: SSEEventType;
  data: T;
  timestamp: string;
}

export interface ConnectedData {
  message: string;
  resume_id: number;
}

export interface StartedData {
  message: string;
  status: 'processing';
}

export interface ProgressData {
  step: 'fetch_pdf' | 'pdf_fetched' | 'parsing';
  message: string;
  status: 'processing';
}

export interface CompletedData {
  message: string;
  status: 'completed';
  metadata: ResumeMetadata;
}

export interface FailedData {
  message: string;
  status: 'failed';
  error: string;
}

// ==========================================
// Resume Metadata Types
// ==========================================

export interface ResumeMetadata {
  data: {
    skills: string[];
    education: Education[];
    experience: Experience[];
    languages: Language[];
    personal_details: PersonalDetails;
  };
  success: boolean;
  error: string | null;
}

export interface PersonalDetails {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  professional_title: string | null;
  profile_description: string | null;
}

export interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  location: string | null;
}

export interface Education {
  degree: string;
  institution: string;
  graduation_date: string;
  field_of_study: string | null;
  gpa: string | null;
}

export interface Language {
  name: string;
  proficiency: string;
}

// ==========================================
// Hook State Types
// ==========================================

export type ParsingStatus = 
  | 'idle' 
  | 'uploading' 
  | 'processing' 
  | 'completed' 
  | 'failed';

export interface ParsingState {
  status: ParsingStatus;
  progress: SSEEvent[];
  metadata: ResumeMetadata | null;
  error: string | null;
  resumeId: number | null;
}

// ==========================================
// Component Props Types
// ==========================================

export interface ResumeUploaderProps {
  onComplete?: (metadata: ResumeMetadata) => void;
  onError?: (error: string) => void;
  maxFileSizeMB?: number;
  acceptedFormats?: string[];
}

export interface UploadProgressProps {
  events: SSEEvent[];
  status: ParsingStatus;
}

export interface MetadataViewerProps {
  metadata: ResumeMetadata;
}
```

---

## 4. API Configuration

### `lib/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async uploadResume(file: File, resumeName: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resume_name', resumeName);
    formData.append('description', 'Uploaded via Next.js app');
    formData.append('is_public', 'false');

    const response = await fetch(`${this.baseURL}/pdf-resumes/upload`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  getStreamURL(streamPath: string): string {
    // Remove leading slash if present
    const path = streamPath.startsWith('/') ? streamPath.slice(1) : streamPath;
    return `${API_BASE_URL}/${path}`;
  }

  async getParseStatus(resumeId: number): Promise<ParseStatusResponse> {
    const response = await fetch(
      `${this.baseURL}/pdf-resumes/${resumeId}/parse-status`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch parse status');
    }

    return response.json();
  }
}

export const apiClient = new APIClient();
```

### Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

---

## 5. Custom Hooks

### `hooks/useResumeParser.ts`

```typescript
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type {
  SSEEvent,
  ResumeMetadata,
  ParsingStatus,
  ParsingState,
  UploadResponse,
} from '@/lib/types';

export function useResumeParser() {
  const [state, setState] = useState<ParsingState>({
    status: 'idle',
    progress: [],
    metadata: null,
    error: null,
    resumeId: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const connectToStream = useCallback((streamUrl: string) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const fullStreamUrl = apiClient.getStreamURL(streamUrl);
    const eventSource = new EventSource(fullStreamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        
        console.log('📡 SSE Event:', data.event, data.data);

        // Update progress events
        setState((prev) => ({
          ...prev,
          progress: [...prev.progress, data],
          status: data.data.status || prev.status,
        }));

        // Handle different event types
        switch (data.event) {
          case 'completed':
            setState((prev) => ({
              ...prev,
              status: 'completed',
              metadata: data.data.metadata,
            }));
            eventSource.close();
            eventSourceRef.current = null;
            break;

          case 'failed':
            setState((prev) => ({
              ...prev,
              status: 'failed',
              error: data.data.error,
            }));
            eventSource.close();
            eventSourceRef.current = null;
            break;

          case 'error':
            console.error('❌ Stream error:', data.data);
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: 'Connection to parsing stream failed',
      }));

      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  const uploadResume = useCallback(
    async (file: File, resumeName: string, token: string) => {
      try {
        // Set authentication token
        apiClient.setToken(token);

        // Reset state
        setState({
          status: 'uploading',
          progress: [],
          metadata: null,
          error: null,
          resumeId: null,
        });

        // Upload resume
        const response: UploadResponse = await apiClient.uploadResume(
          file,
          resumeName
        );

        console.log('✅ Upload successful:', response);

        // Update state with resume ID
        setState((prev) => ({
          ...prev,
          status: 'processing',
          resumeId: response.resume_id,
        }));

        // Connect to SSE stream
        connectToStream(response.parse_stream_url);

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';

        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: errorMessage,
        }));

        throw error;
      }
    },
    [connectToStream]
  );

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState({
      status: 'idle',
      progress: [],
      metadata: null,
      error: null,
      resumeId: null,
    });
  }, []);

  return {
    ...state,
    uploadResume,
    reset,
    isUploading: state.status === 'uploading',
    isProcessing: state.status === 'processing',
    isCompleted: state.status === 'completed',
    isFailed: state.status === 'failed',
  };
}
```

---

## 6. UI Components

### `components/resume/ResumeUploader.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { useResumeParser } from '@/hooks/useResumeParser';
import { UploadProgress } from './UploadProgress';
import { MetadataViewer } from './MetadataViewer';
import type { ResumeUploaderProps } from '@/lib/types';

export function ResumeUploader({
  onComplete,
  onError,
  maxFileSizeMB = 10,
  acceptedFormats = ['.pdf'],
}: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [token, setToken] = useState(''); // In real app, get from auth context
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    status,
    progress,
    metadata,
    error,
    uploadResume,
    reset,
    isUploading,
    isProcessing,
    isCompleted,
  } = useResumeParser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      alert(`File size must be less than ${maxFileSizeMB}MB`);
      return;
    }

    // Validate file type
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    if (!acceptedFormats.includes(`.${fileExtension}`)) {
      alert(`Only ${acceptedFormats.join(', ')} files are allowed`);
      return;
    }

    setFile(selectedFile);
    setResumeName(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
  };

  const handleUpload = async () => {
    if (!file || !resumeName || !token) {
      alert('Please select a file, enter resume name, and provide auth token');
      return;
    }

    try {
      await uploadResume(file, resumeName, token);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setResumeName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Upload Form */}
      {status === 'idle' && (
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Resume
            </h2>
            <p className="text-gray-600">
              Upload your resume PDF and watch it parse in real-time
            </p>
          </div>

          {/* Auth Token Input (for demo - use auth context in production) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your JWT token"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Resume Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Name
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., Software Engineer Resume 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !resumeName || !token}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Upload & Parse Resume
          </button>
        </div>
      )}

      {/* Progress Display */}
      {(isUploading || isProcessing) && (
        <UploadProgress events={progress} status={status} />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Parsing Failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {isCompleted && metadata && (
        <div className="space-y-4">
          <MetadataViewer metadata={metadata} />
          <button
            onClick={handleReset}
            className="w-full py-3 px-6 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
          >
            Upload Another Resume
          </button>
        </div>
      )}
    </div>
  );
}
```

### `components/resume/UploadProgress.tsx`

```typescript
'use client';

import type { UploadProgressProps, SSEEvent } from '@/lib/types';

const eventIcons: Record<string, string> = {
  connected: '🔌',
  started: '🚀',
  fetch_pdf: '📥',
  pdf_fetched: '✅',
  parsing: '🔍',
  completed: '✅',
  failed: '❌',
  error: '⚠️',
};

const eventColors: Record<string, string> = {
  connected: 'bg-blue-50 border-blue-200 text-blue-800',
  started: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  progress: 'bg-green-50 border-green-200 text-green-800',
  completed: 'bg-green-100 border-green-300 text-green-900',
  failed: 'bg-red-50 border-red-200 text-red-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export function UploadProgress({ events, status }: UploadProgressProps) {
  const getEventIcon = (event: SSEEvent): string => {
    if (event.event === 'progress' && event.data.step) {
      return eventIcons[event.data.step] || '⚙️';
    }
    return eventIcons[event.event] || '📄';
  };

  const getEventColor = (event: SSEEvent): string => {
    return eventColors[event.event] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Parsing Progress
        </h3>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Progress Spinner */}
      {status === 'processing' && (
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Event Log */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.map((event, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${getEventColor(event)} animate-slideIn`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">
                {getEventIcon(event)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {event.data.message}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {formatTime(event.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
```

### `components/resume/MetadataViewer.tsx`

```typescript
'use client';

import type { MetadataViewerProps } from '@/lib/types';

export function MetadataViewer({ metadata }: MetadataViewerProps) {
  const { personal_details, experience, education, skills, languages } = metadata.data;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-2xl font-bold text-gray-900">
          ✅ Resume Parsed Successfully!
        </h3>
        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          COMPLETED
        </span>
      </div>

      {/* Personal Details */}
      {personal_details && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            👤 Personal Information
          </h4>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            {personal_details.first_name && (
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {personal_details.first_name} {personal_details.last_name}
                </p>
              </div>
            )}
            {personal_details.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{personal_details.email}</p>
              </div>
            )}
            {personal_details.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{personal_details.phone}</p>
              </div>
            )}
            {personal_details.professional_title && (
              <div>
                <p className="text-sm text-gray-600">Title</p>
                <p className="font-medium">{personal_details.professional_title}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            💼 Work Experience
          </h4>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                <p className="text-gray-700">{exp.company}</p>
                <p className="text-sm text-gray-600">
                  {exp.start_date} - {exp.end_date || 'Present'}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            🎓 Education
          </h4>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.graduation_date}</p>
                {edu.field_of_study && (
                  <p className="text-sm text-gray-600">Field: {edu.field_of_study}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            🛠️ Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            🌍 Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {lang.name} - {lang.proficiency}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON (for debugging) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
          View Raw JSON
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </details>
    </div>
  );
}
```

---

## 7. Complete Example

### `app/page.tsx`

```typescript
import { ResumeUploader } from '@/components/resume/ResumeUploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume Parser with Real-Time Updates
          </h1>
          <p className="text-lg text-gray-600">
            Upload your PDF resume and watch it parse in real-time using Server-Sent Events
          </p>
        </div>

        <ResumeUploader
          onComplete={(metadata) => {
            console.log('Parsing completed:', metadata);
            // Handle success (e.g., redirect, show success message)
          }}
          onError={(error) => {
            console.error('Parsing error:', error);
            // Handle error (e.g., show error toast)
          }}
          maxFileSizeMB={10}
          acceptedFormats={['.pdf']}
        />
      </div>
    </main>
  );
}
```

### Add Tailwind CSS animations in `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
}
```

---

## 8. Pages Router (Next.js 12)

### For Next.js 12 (Pages Router)

```typescript
// pages/resume-upload.tsx
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { ResumeUploader } from '../components/resume/ResumeUploader';
import { getSession } from 'next-auth/react'; // If using NextAuth

export default function ResumeUploadPage({ token }: { token: string }) {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Upload Resume</h1>
      <ResumeUploader token={token} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get token from session
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      token: session.accessToken,
    },
  };
};
```

---

## 9. Error Handling

### Error Boundary Component

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Resume parser error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### Usage with Error Boundary

```typescript
// app/page.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ResumeUploader } from '@/components/resume/ResumeUploader';

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen py-12">
        <ResumeUploader />
      </main>
    </ErrorBoundary>
  );
}
```

---

## 10. Production Deployment

### Authentication with NextAuth

```typescript
// hooks/useAuth.ts
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    token: session?.accessToken as string | undefined,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}

// Update ResumeUploader to use auth
export function ResumeUploader() {
  const { token, isAuthenticated } = useAuth();
  const { uploadResume, ...rest } = useResumeParser();

  const handleUpload = async (file: File, resumeName: string) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    await uploadResume(file, resumeName, token);
  };

  if (!isAuthenticated) {
    return <div>Please log in to upload resumes</div>;
  }

  // ... rest of component
}
```

### Environment Variables for Production

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_VERSION=v1

# For NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
```

### CORS Configuration

Make sure your FastAPI backend allows your Next.js domain:

```python
# Backend CORS settings
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://yourdomain.com",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Vercel Deployment

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/stream/:path*",
      "destination": "https://api.yourdomain.com/api/v1/pdf-resumes/:path*/parse-stream"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

---

## 🎉 Summary

You now have:
- ✅ Complete TypeScript types
- ✅ Custom React hook for SSE
- ✅ Beautiful UI components
- ✅ Error handling
- ✅ Production-ready setup
- ✅ Authentication integration
- ✅ Both App Router & Pages Router examples

**Quick Start:**
1. Copy types to `lib/types.ts`
2. Copy API client to `lib/api.ts`
3. Copy hook to `hooks/useResumeParser.ts`
4. Copy components to `components/resume/`
5. Use in your page
6. Deploy! 🚀

**Need help?** Check the documentation or the interactive demo!
