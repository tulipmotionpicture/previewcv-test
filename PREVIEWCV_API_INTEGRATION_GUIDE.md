# PreviewCV.com - API Integration Guide for Next.js

**Date**: 2025-12-20
**API Base URL**: `https://api.previewcv.com` (or your production API URL)
**Frontend**: Next.js (PreviewCV.com)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Candidate Endpoints](#candidate-endpoints)
4. [Recruiter Endpoints](#recruiter-endpoints)
5. [Job Browsing & Application](#job-browsing--application)
6. [Error Handling](#error-handling)
7. [Next.js Implementation Examples](#nextjs-implementation-examples)

---

## 🎯 Overview

PreviewCV.com has **two types of users**:

### 1. **Candidates** (Job Seekers)
- **Login Methods**:
  - ✅ Email/Password
  - ✅ Social Login (Google, LinkedIn, etc.)
- **Shared with LetsMakeCV**: Same user database and authentication
- **Features**: Browse jobs, apply to jobs, track applications

### 2. **Recruiters** (Employers)
- **Login Methods**:
  - ✅ Email/Password ONLY
  - ❌ NO Social Login
- **Separate System**: Different database table (`recruiters` vs `users`)
- **Features**: Post jobs, manage applications, view candidate profiles

---

## 🔐 Authentication

### API Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.previewcv.com';
```

### Token Storage
```typescript
// Store in localStorage or cookies
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);
localStorage.setItem('user_type', 'candidate'); // or 'recruiter'
```

### Authorization Header
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

## 👤 Candidate Endpoints

Candidates use the **SAME authentication system** as LetsMakeCV.com.

### 1. Register Candidate
**Endpoint**: `POST /api/v1/auth/register`

**Request**:
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "candidate@example.com",
    "full_name": "John Doe"
  }
}
```

---

### 2. Login Candidate (Email/Password)
**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "candidate@example.com",
    "full_name": "John Doe"
  }
}
```

---

### 3. Social Login (Google/LinkedIn)
**Endpoint**: `POST /api/v1/auth/social-login`

**Request**:
```json
{
  "provider": "google",
  "token": "google_oauth_token_here"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "candidate@example.com",
    "full_name": "John Doe"
  }
}
```

**Note**: Social login is **ONLY for candidates**, not recruiters.

---

### 4. Get Candidate Profile
**Endpoint**: `GET /api/v1/auth/me`
**Auth**: Required (Bearer Token)

**Response**:
```json
{
  "id": 1,
  "email": "candidate@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "created_at": "2025-12-20T10:00:00"
}
```

---

### 5. Refresh Token
**Endpoint**: `POST /api/v1/auth/refresh`

**Request**:
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response**:
```json
{
  "access_token": "new_access_token_here",
  "token_type": "bearer"
}
```

---

### 6. Logout
**Endpoint**: `POST /api/v1/auth/logout`
**Auth**: Required (Bearer Token)

**Response**:
```json
{
  "message": "Successfully logged out"
}
```

---

## 💼 Recruiter Endpoints

Recruiters have a **SEPARATE authentication system** (email/password ONLY).

### 1. Register Recruiter
**Endpoint**: `POST /api/v1/recruiters/auth/register`

**Request**:
```json
{
  "email": "recruiter@techcorp.com",
  "password": "SecurePass123!",
  "company_name": "Tech Corp",
  "full_name": "Jane Smith",
  "phone": "+1234567890",
  "company_website": "https://techcorp.com",
  "bio": "Leading tech recruitment agency"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Recruiter registered successfully",
  "recruiter": {
    "id": 1,
    "email": "recruiter@techcorp.com",
    "company_name": "Tech Corp",
    "full_name": "Jane Smith",
    "username": "tech-corp"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

---

### 2. Login Recruiter
**Endpoint**: `POST /api/v1/recruiters/auth/login`

**Request**:
```json
{
  "email": "recruiter@techcorp.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "recruiter": {
    "id": 1,
    "email": "recruiter@techcorp.com",
    "company_name": "Tech Corp",
    "full_name": "Jane Smith",
    "username": "tech-corp"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Note**: NO social login for recruiters!

---

### 3. Get Recruiter Profile (Private)
**Endpoint**: `GET /api/v1/recruiters/profile/me`
**Auth**: Required (Recruiter Bearer Token)

**Response**:
```json
{
  "success": true,
  "recruiter": {
    "id": 1,
    "email": "recruiter@techcorp.com",
    "company_name": "Tech Corp",
    "full_name": "Jane Smith",
    "username": "tech-corp",
    "phone": "+1234567890",
    "company_website": "https://techcorp.com",
    "bio": "Leading tech recruitment agency",
    "is_verified": false,
    "last_login": "2025-12-20T10:00:00"
  }
}
```

---

### 4. Get Public Recruiter Profile
**Endpoint**: `GET /api/v1/recruiters/profile/{username}`
**Auth**: Not Required (Public)

**Example**: `GET /api/v1/recruiters/profile/tech-corp`

**Response**:
```json
{
  "success": true,
  "recruiter": {
    "company_name": "Tech Corp",
    "full_name": "Jane Smith",
    "username": "tech-corp",
    "company_website": "https://techcorp.com",
    "bio": "Leading tech recruitment agency",
    "is_verified": false
  }
}
```

**Note**: Email, phone, and last_login are **hidden** in public profiles.

---

### 5. Refresh Recruiter Token
**Endpoint**: `POST /api/v1/recruiters/auth/refresh`

**Request**:
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response**:
```json
{
  "success": true,
  "access_token": "new_access_token_here"
}
```

---

### 6. Logout Recruiter
**Endpoint**: `POST /api/v1/recruiters/auth/logout`
**Auth**: Required (Recruiter Bearer Token)

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---





---

## 🔍 Job Browsing & Application

### 1. Browse All Jobs (Public)
**Endpoint**: `GET /api/v1/jobs/list`
**Auth**: Not Required (Public)

**Query Parameters**:
- `limit` (optional): Number of jobs per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `job_type` (optional): Filter by job type (full_time, part_time, contract, etc.)
- `experience_level` (optional): Filter by experience (entry, junior, mid, senior, etc.)
- `location` (optional): Filter by location
- `remote_only` (optional): Show only remote jobs (true/false)

**Example**:
```
GET /api/v1/jobs/list?limit=20&offset=0&job_type=full_time&remote_only=true
```

**Response**:
```json
{
  "success": true,
  "total": 50,
  "limit": 20,
  "offset": 0,
  "jobs": [
    {
      "id": 1,
      "slug": "senior-python-developer-at-google-mountain-view-ca-1",
      "title": "Senior Python Developer",
      "company_name": "Google",
      "company_logo_url": null,
      "location": "Mountain View, CA",
      "job_type": "full_time",
      "experience_level": "senior",
      "salary_min": 150000,
      "salary_max": 220000,
      "salary_currency": "USD",
      "is_remote": false,
      "required_skills": ["Python", "Django", "PostgreSQL"],
      "preferred_skills": ["Docker", "Kubernetes"],
      "posted_date": "2025-12-20T09:54:11.817970",
      "application_count": 5,
      "view_count": 120
    }
  ]
}
```

---

### 2. Get Job Details by Slug (SEO-Optimized) ⭐
**Endpoint**: `GET /api/v1/jobs/slug/{slug}`
**Auth**: Not Required (Public)

**Example**:
```
GET /api/v1/jobs/slug/senior-python-developer-at-google-mountain-view-ca-1
```

**Response**:
```json
{
  "success": true,
  "job": {
    "id": 1,
    "slug": "senior-python-developer-at-google-mountain-view-ca-1",
    "title": "Senior Python Developer",
    "company_name": "Google",
    "company_logo_url": null,
    "location": "Mountain View, CA",
    "job_type": "full_time",
    "experience_level": "senior",
    "description": "Join our team to build amazing products...",
    "requirements": "5+ years Python experience...",
    "responsibilities": "Design and develop scalable systems...",
    "salary_min": 150000,
    "salary_max": 220000,
    "salary_currency": "USD",
    "is_remote": false,
    "required_skills": ["Python", "Django", "PostgreSQL"],
    "preferred_skills": ["Docker", "Kubernetes"],
    "categories": ["Engineering", "Backend"],
    "posted_date": "2025-12-20T09:54:11.817970",
    "application_deadline": "2025-01-20T23:59:59",
    "application_count": 5,
    "view_count": 121
  }
}
```

**Note**: View count is automatically incremented when this endpoint is called.

---

### 3. Get Job Details by ID (Legacy)
**Endpoint**: `GET /api/v1/jobs/{job_id}`
**Auth**: Not Required (Public)

**Example**:
```
GET /api/v1/jobs/1
```

**Response**: Same as slug endpoint

**Note**: Prefer using the slug endpoint for SEO benefits.

---

### 4. Apply to Job
**Endpoint**: `POST /api/v1/jobs/{job_id}/apply`
**Auth**: Required (Candidate Bearer Token)

**Request**:
```json
{
  "resume_id": 123,
  "cover_letter": "I am excited to apply for this position..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": 456,
    "job_id": 1,
    "user_id": 1,
    "resume_id": 123,
    "status": "applied",
    "applied_at": "2025-12-20T10:30:00",
    "cover_letter": "I am excited to apply for this position..."
  }
}
```

**Application Statuses**:
- `applied` - Initial application submitted
- `under_review` - Recruiter is reviewing
- `interview_scheduled` - Interview scheduled
- `interviewed` - Interview completed
- `offered` - Job offer extended
- `accepted` - Candidate accepted offer
- `rejected` - Application rejected
- `withdrawn` - Candidate withdrew application

---

### 5. Get My Applications
**Endpoint**: `GET /api/v1/jobs/my-applications`
**Auth**: Required (Candidate Bearer Token)

**Response**:
```json
{
  "success": true,
  "applications": [
    {
      "id": 456,
      "job_id": 1,
      "job_title": "Senior Python Developer",
      "company_name": "Google",
      "status": "under_review",
      "applied_at": "2025-12-20T10:30:00",
      "updated_at": "2025-12-20T11:00:00",
      "cover_letter": "I am excited to apply for this position..."
    }
  ]
}
```

---

## 💼 Recruiter Job Management

### 1. Create Job Posting
**Endpoint**: `POST /api/v1/recruiters/jobs/create`
**Auth**: Required (Recruiter Bearer Token)

**Request**:
```json
{
  "title": "Senior Python Developer",
  "company_name": "Google",
  "location": "Mountain View, CA",
  "job_type": "full_time",
  "experience_level": "senior",
  "description": "Join our team to build amazing products...",
  "requirements": "5+ years Python experience...",
  "responsibilities": "Design and develop scalable systems...",
  "salary_min": 150000,
  "salary_max": 220000,
  "salary_currency": "USD",
  "is_remote": false,
  "required_skills": ["Python", "Django", "PostgreSQL"],
  "preferred_skills": ["Docker", "Kubernetes"],
  "categories": ["Engineering", "Backend"]
}
```

**Response**:
```json
{
  "success": true,
  "job_id": 1,
  "slug": "senior-python-developer-at-google-mountain-view-ca-1",
  "message": "Job posting created successfully",
  "job": {
    "id": 1,
    "title": "Senior Python Developer",
    "slug": "senior-python-developer-at-google-mountain-view-ca-1",
    "company_name": "Google",
    "location": "Mountain View, CA",
    "job_type": "full_time",
    "is_active": true,
    "posted_date": "2025-12-20T09:54:11.817970"
  },
  "preview_url": "https://previewcv.com/jobs/senior-python-developer-at-google-mountain-view-ca-1"
}
```

**Job Types**:
- `full_time`
- `part_time`
- `contract`
- `freelance`
- `internship`
- `temporary`

**Experience Levels**:
- `entry`
- `junior`
- `mid`
- `senior`
- `lead`
- `executive`

---

### 2. Get My Job Postings
**Endpoint**: `GET /api/v1/recruiters/jobs/my-jobs`
**Auth**: Required (Recruiter Bearer Token)

**Response**:
```json
{
  "success": true,
  "jobs": [
    {
      "id": 1,
      "slug": "senior-python-developer-at-google-mountain-view-ca-1",
      "title": "Senior Python Developer",
      "company_name": "Google",
      "location": "Mountain View, CA",
      "job_type": "full_time",
      "is_active": true,
      "posted_date": "2025-12-20T09:54:11.817970",
      "application_count": 5,
      "view_count": 120
    }
  ]
}
```

---

### 3. Get Applications for My Job
**Endpoint**: `GET /api/v1/recruiters/jobs/{job_id}/applications`
**Auth**: Required (Recruiter Bearer Token)

**Response**:
```json
{
  "success": true,
  "job_id": 1,
  "job_title": "Senior Python Developer",
  "applications": [
    {
      "id": 456,
      "user_id": 1,
      "candidate_name": "John Doe",
      "candidate_email": "candidate@example.com",
      "resume_id": 123,
      "status": "applied",
      "applied_at": "2025-12-20T10:30:00",
      "cover_letter": "I am excited to apply for this position...",
      "notes": null
    }
  ]
}
```

---

### 4. Update Application Status
**Endpoint**: `PUT /api/v1/recruiters/jobs/applications/{application_id}/status`
**Auth**: Required (Recruiter Bearer Token)

**Request**:
```json
{
  "status": "interview_scheduled",
  "notes": "Interview scheduled for Dec 25, 2025 at 2 PM"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "application": {
    "id": 456,
    "status": "interview_scheduled",
    "notes": "Interview scheduled for Dec 25, 2025 at 2 PM",
    "updated_at": "2025-12-20T11:00:00"
  }
}
```

**Available Status Transitions**:
- `applied` → `under_review`
- `under_review` → `interview_scheduled` or `rejected`
- `interview_scheduled` → `interviewed`
- `interviewed` → `offered` or `rejected`
- `offered` → `accepted` or `rejected`
- Any status → `withdrawn` (by candidate)

---

## ⚠️ Error Handling

All API endpoints return errors in a consistent format:

**Error Response**:
```json
{
  "detail": "Error message here"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `422` - Unprocessable Entity (validation error)
- `500` - Internal Server Error

**Example Error**:
```json
{
  "detail": "Invalid credentials"
}
```

---

## 🚀 Next.js Implementation Examples

### 1. API Client Setup

**File**: `lib/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.previewcv.com';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = false
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  // Candidate Auth
  async candidateLogin(email: string, password: string) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async candidateRegister(email: string, password: string, full_name: string) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  // Recruiter Auth
  async recruiterLogin(email: string, password: string) {
    return this.request('/api/v1/recruiters/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async recruiterRegister(data: any) {
    return this.request('/api/v1/recruiters/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Jobs
  async getJobs(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v1/jobs/list?${queryString}`);
  }

  async getJobBySlug(slug: string) {
    return this.request(`/api/v1/jobs/slug/${slug}`);
  }

  async applyToJob(jobId: number, resumeId: number, coverLetter: string) {
    return this.request(
      `/api/v1/jobs/${jobId}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ resume_id: resumeId, cover_letter: coverLetter }),
      },
      true
    );
  }

  async getMyApplications() {
    return this.request('/api/v1/jobs/my-applications', {}, true);
  }

  // Recruiter Jobs
  async createJob(data: any) {
    return this.request(
      '/api/v1/recruiters/jobs/create',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    );
  }

  async getMyJobs() {
    return this.request('/api/v1/recruiters/jobs/my-jobs', {}, true);
  }

  async getJobApplications(jobId: number) {
    return this.request(`/api/v1/recruiters/jobs/${jobId}/applications`, {}, true);
  }

  async updateApplicationStatus(applicationId: number, status: string, notes?: string) {
    return this.request(
      `/api/v1/recruiters/jobs/applications/${applicationId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      },
      true
    );
  }
}

export const api = new ApiClient();
```

---

### 2. Candidate Login Page

**File**: `app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.candidateLogin(email, password);

      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_type', 'candidate');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Candidate Login</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <a href="/register" className="text-blue-600 hover:underline">
          Don't have an account? Register
        </a>
      </div>
    </div>
  );
}
```


---

### 3. Job Listing Page (SEO-Optimized)

**File**: `app/jobs/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    job_type: '',
    experience_level: '',
    remote_only: false,
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getJobs({
        limit: 20,
        offset: 0,
        ...filters,
      });
      setJobs(response.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Jobs</h1>

      {/* Filters */}
      <div className="mb-8 flex gap-4">
        <select
          value={filters.job_type}
          onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Job Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
        </select>

        <select
          value={filters.experience_level}
          onChange={(e) => setFilters({ ...filters, experience_level: e.target.value })}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Experience Levels</option>
          <option value="entry">Entry</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.remote_only}
            onChange={(e) => setFilters({ ...filters, remote_only: e.target.checked })}
          />
          Remote Only
        </label>
      </div>

      {/* Job List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/jobs/${job.slug}`}
              className="block p-6 border rounded-lg hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold mb-2">{job.title}</h2>
              <p className="text-gray-600 mb-2">{job.company_name}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📍 {job.location}</span>
                <span>💼 {job.job_type}</span>
                {job.is_remote && <span>🏠 Remote</span>}
              </div>
              {job.salary_min && job.salary_max && (
                <p className="mt-2 text-green-600 font-semibold">
                  ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} {job.salary_currency}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                {job.required_skills?.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 4. Job Details Page (Dynamic Route with Slug)

**File**: `app/jobs/[slug]/page.tsx`

```typescript
import { api } from '@/lib/api';
import { Metadata } from 'next';
import JobDetailsClient from './JobDetailsClient';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const response = await api.getJobBySlug(params.slug);
    const job = response.job;

    return {
      title: `${job.title} at ${job.company_name} | PreviewCV`,
      description: job.description?.substring(0, 160),
      openGraph: {
        title: `${job.title} at ${job.company_name}`,
        description: job.description?.substring(0, 160),
        url: `https://previewcv.com/jobs/${params.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Job Not Found | PreviewCV',
    };
  }
}

export default async function JobDetailsPage({ params }: { params: { slug: string } }) {
  try {
    const response = await api.getJobBySlug(params.slug);
    return <JobDetailsClient job={response.job} />;
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Job Not Found</h1>
        <p className="mt-4">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
}
```

**File**: `app/jobs/[slug]/JobDetailsClient.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function JobDetailsClient({ job }: { job: any }) {
  const router = useRouter();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeId, setResumeId] = useState('');

  const handleApply = async () => {
    try {
      await api.applyToJob(job.id, parseInt(resumeId), coverLetter);
      alert('Application submitted successfully!');
      setShowApplyModal(false);
      router.push('/dashboard/applications');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Job Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
        <div className="flex items-center gap-4 text-lg text-gray-600">
          <span className="font-semibold">{job.company_name}</span>
          <span>•</span>
          <span>📍 {job.location}</span>
          {job.is_remote && (
            <>
              <span>•</span>
              <span>🏠 Remote</span>
            </>
          )}
        </div>
        {job.salary_min && job.salary_max && (
          <p className="mt-4 text-2xl text-green-600 font-bold">
            ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} {job.salary_currency}
          </p>
        )}
      </div>

      {/* Apply Button */}
      <button
        onClick={() => setShowApplyModal(true)}
        className="mb-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
      >
        Apply Now
      </button>

      {/* Job Details */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </section>

          {job.requirements && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
            </section>
          )}

          {job.responsibilities && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Responsibilities</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Job Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Job Type:</span>
                <p className="font-semibold capitalize">{job.job_type.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-gray-600">Experience Level:</span>
                <p className="font-semibold capitalize">{job.experience_level}</p>
              </div>
              <div>
                <span className="text-gray-600">Posted:</span>
                <p className="font-semibold">{new Date(job.posted_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Applications:</span>
                <p className="font-semibold">{job.application_count}</p>
              </div>
            </div>
          </div>

          {job.required_skills?.length > 0 && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>

            <div className="mb-4">
              <label className="block mb-2">Resume ID</label>
              <input
                type="number"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder="Enter your resume ID"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Cover Letter</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-4 py-2 border rounded h-32"
                placeholder="Tell us why you're a great fit..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleApply}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Submit Application
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 5. Recruiter Dashboard

**File**: `app/recruiter/dashboard/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyJobs();
  }, []);

  const loadMyJobs = async () => {
    try {
      const response = await api.getMyJobs();
      setJobs(response.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Job Postings</h1>
        <Link
          href="/recruiter/jobs/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create New Job
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
          <Link
            href="/recruiter/jobs/create"
            className="text-blue-600 hover:underline"
          >
            Create your first job posting
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job: any) => (
            <div key={job.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">{job.title}</h2>
                  <p className="text-gray-600 mb-2">{job.company_name}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.job_type}</span>
                    <span>👁️ {job.view_count} views</span>
                    <span>📝 {job.application_count} applications</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    View
                  </Link>
                  <Link
                    href={`/recruiter/jobs/${job.id}/applications`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Applications ({job.application_count})
                  </Link>
                </div>
              </div>
              <div className="mt-4">
                <span className={`px-3 py-1 rounded text-sm ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {job.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Summary

### Key Points for Next.js Developer:

1. **Two Separate Auth Systems**:
   - Candidates: Email/password + social login
   - Recruiters: Email/password ONLY (no social login)

2. **SEO-Optimized Job URLs**:
   - Use slug-based routes: `/jobs/[slug]`
   - Implement `generateMetadata()` for SEO
   - Slugs are auto-generated on job creation

3. **Token Management**:
   - Store tokens in localStorage or cookies
   - Include `Authorization: Bearer {token}` header for protected routes
   - Implement token refresh logic

4. **Error Handling**:
   - All errors return `{ "detail": "error message" }`
   - Handle 401 errors by redirecting to login
   - Show user-friendly error messages

5. **Application Flow**:
   - Candidate browses jobs → applies with resume + cover letter
   - Recruiter views applications → updates status → adds notes
   - Status transitions: applied → under_review → interview_scheduled → interviewed → offered → accepted/rejected

6. **Shared User Database**:
   - LetsMakeCV and PreviewCV share the same candidate database
   - Candidates can use the same login on both platforms
   - Recruiters are separate and PreviewCV-only

---

## 🚀 Ready to Build!

This guide provides everything your Next.js developer needs to integrate PreviewCV.com with the backend API. All endpoints are tested and working! 🎉

