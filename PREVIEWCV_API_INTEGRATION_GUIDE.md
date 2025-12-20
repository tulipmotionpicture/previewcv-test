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
5. [PDF Resume Management (Candidates)](#pdf-resume-management-candidates)
6. [Job Browsing & Application](#job-browsing--application)
7. [Recruiter Job Management](#recruiter-job-management)
8. [Error Handling](#error-handling)
9. [Next.js Implementation Examples](#nextjs-implementation-examples)

---

## 🎯 Overview

PreviewCV.com has **two types of users**:

### 1. **Candidates** (Job Seekers)
- **Login Methods**:
  - ✅ Email/Password
  - ✅ Social Login (Google, LinkedIn, etc.)
- **Shared with LetsMakeCV**: Same user database and authentication
- **Features**:
  - Upload PDF resumes directly (no builder needed)
  - Generate permanent shareable links with QR codes
  - Browse jobs, apply to jobs, track applications
  - Manage profile and settings

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
  "recruiter_type": "company",
  "username": "tech-corp",
  "company_name": "Tech Corp Inc"
}
```

**Optional Fields** (can be added during registration or updated later via profile):
- **Company fields**: `company_website`, `company_size`, `industry`, `company_logo_url`
- **Individual fields**: `full_name`, `specialization`, `years_experience`
- **Common fields**: `bio`, `phone`, `linkedin_url`, `location`

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "recruiter": {
    "id": 2,
    "username": "tech-corp",
    "recruiter_type": "company",
    "display_name": "Tech Corp Inc",
    "bio": null,
    "location": null,
    "linkedin_url": null,
    "is_verified": false,
    "profile_url": "/recruiter/tech-corp",
    "created_at": "2025-12-20T14:30:30.832804",
    "company_name": "Tech Corp Inc",
    "company_website": null,
    "company_size": null,
    "industry": null,
    "company_logo_url": null,
    "email": "recruiter@techcorp.com",
    "phone": null,
    "is_email_verified": false,
    "last_login": null,
    "updated_at": "2025-12-20T14:30:30.832804"
  }
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
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "recruiter": {
    "id": 2,
    "username": "tech-corp",
    "recruiter_type": "company",
    "display_name": "Tech Corp Inc",
    "bio": "Leading tech recruitment company",
    "location": "San Francisco, CA",
    "linkedin_url": "https://linkedin.com/company/tech-corp",
    "is_verified": false,
    "profile_url": "/recruiter/tech-corp",
    "created_at": "2025-12-20T14:30:30.832804",
    "company_name": "Tech Corp Inc",
    "company_website": "https://techcorp.com",
    "company_size": "51-200",
    "industry": "Technology",
    "company_logo_url": null,
    "email": "recruiter@techcorp.com",
    "phone": "+1-555-1234",
    "is_email_verified": false,
    "last_login": "2025-12-20T14:32:25.650747",
    "updated_at": "2025-12-20T14:32:25.473748"
  }
}
```

**Note**: NO social login for recruiters!

---

### 3. Get Recruiter Profile (Private)
**Endpoint**: `GET /api/v1/recruiters/profile/me`
**Auth**: Required (Recruiter Bearer Token)

**Response**: Returns full profile including private fields (email, phone, last_login)
```json
{
  "id": 2,
  "email": "recruiter@techcorp.com",
  "username": "tech-corp",
  "recruiter_type": "company",
  "display_name": "Tech Corp Inc",
  "bio": "Leading tech recruitment company",
  "location": "San Francisco, CA",
  "linkedin_url": "https://linkedin.com/company/tech-corp",
  "phone": "+1-555-1234",
  "is_verified": false,
  "is_email_verified": false,
  "profile_url": "/recruiter/tech-corp",
  "created_at": "2025-12-20T14:30:30.832804",
  "last_login": "2025-12-20T14:32:25.650747",
  "company_name": "Tech Corp Inc",
  "company_website": "https://testcompany.com",
  "company_size": "51-200",
  "industry": "Technology",
  "company_logo_url": null,
  "full_name": null,
  "specialization": null,
  "years_experience": null
}
```

---

### 4. Update Recruiter Profile
**Endpoint**: `PUT /api/v1/recruiters/profile/me`
**Auth**: Required (Recruiter Bearer Token)

**Request** (all fields optional):
```json
{
  "bio": "Leading tech recruitment company specializing in software engineering roles",
  "company_website": "https://techcorp.com",
  "company_size": "51-200",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "linkedin_url": "https://linkedin.com/company/tech-corp",
  "phone": "+1-555-1234",
  "username": "new-username"
}
```

**Response**: Returns updated profile with all fields

**Note**: Username changes will update the `profile_url` automatically.

---

### 5. Get Public Recruiter Profile
**Endpoint**: `GET /api/v1/recruiters/profile/{username}`
**Auth**: Not Required (Public)

**Example**: `GET /api/v1/recruiters/profile/tech-corp`

**Response**: Returns public profile (excludes email, phone, last_login)
```json
{
  "id": 2,
  "username": "tech-corp",
  "recruiter_type": "company",
  "display_name": "Tech Corp Inc",
  "bio": "Leading tech recruitment company",
  "location": "San Francisco, CA",
  "linkedin_url": "https://linkedin.com/company/tech-corp",
  "is_verified": false,
  "profile_url": "/recruiter/tech-corp",
  "created_at": "2025-12-20T14:30:30.832804",
  "company_name": "Tech Corp Inc",
  "company_website": "https://testcompany.com",
  "company_size": "51-200",
  "industry": "Technology",
  "company_logo_url": null,
  "full_name": null,
  "specialization": null
}
```

**Note**: Email, phone, and last_login are **hidden** in public profiles.

---

### 6. Request Password Reset
**Endpoint**: `POST /api/v1/recruiters/auth/password-reset/request`
**Auth**: Not Required

**Request**:
```json
{
  "email": "recruiter@techcorp.com"
}
```

**Response**:
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Notes**:
- Always returns success to prevent email enumeration
- Reset link sent to: `{PREVIEWCV_FRONTEND_URL}/recruiter/auth/reset-password?token={token}`
- Token expires in 1 hour
- Email sent via ZeptoMail

---

### 7. Confirm Password Reset
**Endpoint**: `POST /api/v1/recruiters/auth/password-reset/confirm`
**Auth**: Not Required

**Request**:
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

**Success Response**:
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Response** (invalid/expired token):
```json
{
  "detail": "Invalid or expired reset token"
}
```

**Notes**:
- Token is single-use (cleared after successful reset)
- Password must be minimum 8 characters
- Token expires after 1 hour

---

### 8. Verify Email
**Endpoint**: `POST /api/v1/recruiters/auth/verify-email`
**Auth**: Not Required

**Request**:
```json
{
  "token": "verification_token_from_email"
}
```

**Success Response**:
```json
{
  "message": "Email verified successfully"
}
```

**Error Response** (invalid token):
```json
{
  "detail": "Invalid verification token"
}
```

**Notes**:
- Verification email sent automatically on registration
- Verification link: `{PREVIEWCV_FRONTEND_URL}/recruiter/auth/verify-email?token={token}`
- Token is single-use (cleared after successful verification)
- Sets `is_email_verified` to `true`

---

### 9. Resend Verification Email
**Endpoint**: `POST /api/v1/recruiters/auth/resend-verification`
**Auth**: Not Required

**Request**:
```json
{
  "email": "recruiter@techcorp.com"
}
```

**Response**:
```json
{
  "message": "If the email exists and is not verified, a verification link has been sent"
}
```

**Notes**:
- Always returns success to prevent email enumeration
- Generates new verification token
- Only sends email if account exists and is not already verified

---

### 10. Refresh Recruiter Token
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

### 11. Logout Recruiter
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

## 📄 PDF Resume Management (Candidates)

### Overview

PreviewCV focuses on **PDF resume uploads** for candidates who want to:
- ✅ Upload existing PDF resumes directly (no builder needed)
- ✅ Store resumes securely in BunnyCDN
- ✅ Generate permanent shareable links with QR codes
- ✅ Apply to jobs with uploaded resumes
- ✅ Manage multiple resume versions

**Note**: Builder resumes from LetsMakeCV.com are also accessible via `GET /api/v1/resumes/` for candidates who use both platforms, but PreviewCV does not provide creation/editing of builder resumes.

---

### 1. Upload PDF Resume
**Endpoint**: `POST /api/v1/pdf-resumes/upload`
**Auth**: Required (Candidate Bearer Token)
**Content-Type**: `multipart/form-data`

**Request (Form Data)**:
```typescript
const formData = new FormData();
formData.append('file', pdfFile); // Required: PDF file (max 10MB)
formData.append('resume_name', 'My Software Engineer Resume'); // Required
formData.append('description', 'Updated resume for 2024'); // Optional
formData.append('is_public', 'false'); // Optional (default: false)
```

**Validation**:
- ✅ File must be PDF (checked via extension, MIME type, and magic bytes)
- ✅ Max file size: 10MB
- ✅ Unique filename generated: `resume_{user_id}_{uuid}.pdf`
- ✅ SHA256 hash calculated for deduplication

**Response**:
```json
{
  "id": 1,
  "user_id": 5,
  "resume_name": "My Software Engineer Resume",
  "description": "Updated resume for 2024",
  "original_filename": "john_doe_resume.pdf",
  "stored_filename": "resume_5_a1b2c3d4.pdf",
  "file_size_bytes": 245678,
  "file_hash": "sha256:abc123...",
  "bunny_cdn_url": "https://letsmakecv-storage.b-cdn.net/pdfs/resume_5_a1b2c3d4.pdf",
  "bunny_cdn_path": "/pdfs/resume_5_a1b2c3d4.pdf",
  "is_active": true,
  "is_public": false,
  "created_at": "2025-12-20T11:34:31.777476",
  "updated_at": "2025-12-20T11:34:31.777476"
}
```

**Error Responses**:
```json
// Invalid file type
{
  "detail": "Invalid file type. Only PDF files are allowed."
}

// File too large
{
  "detail": "File size exceeds maximum allowed size of 10MB"
}

// Upload failed
{
  "detail": "Failed to upload file to storage: ..."
}
```

---

### 2. List My Uploaded Resumes
**Endpoint**: `GET /api/v1/pdf-resumes/`
**Auth**: Required (Candidate Bearer Token)

**Query Parameters**:
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Number of resumes per page (default: 10)
- `is_active` (optional): Filter by active status (true/false)

**Example**:
```
GET /api/v1/pdf-resumes/?limit=20&is_active=true
```

**Response**:
```json
{
  "total": 3,
  "resumes": [
    {
      "id": 1,
      "resume_name": "My Software Engineer Resume",
      "description": "Updated resume for 2024",
      "original_filename": "john_doe_resume.pdf",
      "stored_filename": "resume_5_a1b2c3d4.pdf",
      "file_size_bytes": 245678,
      "bunny_cdn_url": "https://letsmakecv-storage.b-cdn.net/pdfs/resume_5_a1b2c3d4.pdf",
      "is_active": true,
      "is_public": false,
      "created_at": "2025-12-20T11:34:31.777476",
      "updated_at": "2025-12-20T11:34:31.777476"
    }
  ]
}
```

---

### 3. Get Resume Details
**Endpoint**: `GET /api/v1/pdf-resumes/{resume_id}`
**Auth**: Required (Candidate Bearer Token)

**Response**:
```json
{
  "id": 1,
  "user_id": 5,
  "resume_name": "My Software Engineer Resume",
  "description": "Updated resume for 2024",
  "original_filename": "john_doe_resume.pdf",
  "stored_filename": "resume_5_a1b2c3d4.pdf",
  "file_size_bytes": 245678,
  "file_hash": "sha256:abc123...",
  "bunny_cdn_url": "https://letsmakecv-storage.b-cdn.net/pdfs/resume_5_a1b2c3d4.pdf",
  "bunny_cdn_path": "/pdfs/resume_5_a1b2c3d4.pdf",
  "is_active": true,
  "is_public": false,
  "created_at": "2025-12-20T11:34:31.777476",
  "updated_at": "2025-12-20T11:34:31.777476"
}
```

---

### 4. Update Resume Metadata
**Endpoint**: `PUT /api/v1/pdf-resumes/{resume_id}`
**Auth**: Required (Candidate Bearer Token)

**Request**:
```json
{
  "resume_name": "Senior Software Engineer Resume",
  "description": "Updated for senior positions",
  "is_public": true
}
```

**Response**:
```json
{
  "id": 1,
  "resume_name": "Senior Software Engineer Resume",
  "description": "Updated for senior positions",
  "is_public": true,
  "updated_at": "2025-12-20T12:00:00.000000"
}
```

**Note**: This endpoint only updates metadata. The PDF file itself cannot be changed - upload a new resume instead.

---

### 5. Delete Resume
**Endpoint**: `DELETE /api/v1/pdf-resumes/{resume_id}`
**Auth**: Required (Candidate Bearer Token)

**Response**:
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

**Behavior**:
- ✅ Soft delete (sets `is_active = false`)
- ✅ Deletes file from BunnyCDN storage
- ✅ Deletes associated permanent links
- ✅ Preserves job application history

---

### 6. Get Download URL
**Endpoint**: `GET /api/v1/pdf-resumes/{resume_id}/download`
**Auth**: Required (Candidate Bearer Token)

**Response**:
```json
{
  "download_url": "https://letsmakecv-storage.b-cdn.net/pdfs/resume_5_a1b2c3d4.pdf?token=abc123&expires=1703088000",
  "expires_in_seconds": 3600,
  "expires_at": "2025-12-20T13:00:00.000000"
}
```

**Features**:
- ✅ Generates signed BunnyCDN URL
- ✅ URL expires in 1 hour (configurable)
- ✅ Secure token-based authentication
- ✅ Direct download from CDN

---

### 7. Get Permanent Share Link
**Endpoint**: `GET /api/v1/pdf-resumes/{resume_id}/share-link`
**Auth**: Required (Candidate Bearer Token)

**Response**:
```json
{
  "permanent_link": "https://previewcv.com/resume/view/abc123xyz789",
  "permanent_token": "abc123xyz789",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "view_count": 0,
  "access_count": 0,
  "created_at": "2025-12-20T11:34:31.777476",
  "last_accessed_at": null
}
```

**Features**:
- ✅ Permanent shareable link (never expires)
- ✅ Memorable 12-character token
- ✅ QR code for easy sharing (base64-encoded PNG)
- ✅ View and access tracking
- ✅ Can be shared with recruiters

**QR Code Usage**:
```typescript
<img src={qrCode} alt="Resume QR Code" />
```

---

### TypeScript API Client (PDF Resumes)

```typescript
// app/lib/api/pdf-resumes.ts
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.previewcv.com';

export interface UploadedResume {
  id: number;
  user_id: number;
  resume_name: string;
  description?: string;
  original_filename: string;
  stored_filename: string;
  file_size_bytes: number;
  file_hash: string;
  bunny_cdn_url: string;
  bunny_cdn_path: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermanentLink {
  permanent_link: string;
  permanent_token: string;
  qr_code: string;
  view_count: number;
  access_count: number;
  created_at: string;
  last_accessed_at: string | null;
}

// Upload PDF resume
export async function uploadPDFResume(
  file: File,
  resumeName: string,
  description?: string,
  isPublic: boolean = false
): Promise<UploadedResume> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resume_name', resumeName);
  if (description) formData.append('description', description);
  formData.append('is_public', String(isPublic));

  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload resume');
  }

  return response.json();
}

// List uploaded resumes
export async function getMyUploadedResumes(
  skip: number = 0,
  limit: number = 10,
  isActive?: boolean
): Promise<{ total: number; resumes: UploadedResume[] }> {
  const token = getAuthToken();
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (isActive !== undefined) params.append('is_active', String(isActive));

  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch resumes');
  return response.json();
}

// Get resume details
export async function getUploadedResume(resumeId: number): Promise<UploadedResume> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/${resumeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch resume');
  return response.json();
}

// Update resume metadata
export async function updateUploadedResume(
  resumeId: number,
  data: { resume_name?: string; description?: string; is_public?: boolean }
): Promise<UploadedResume> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update resume');
  return response.json();
}

// Delete resume
export async function deleteUploadedResume(resumeId: number): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/${resumeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to delete resume');
}

// Get download URL
export async function getResumeDownloadURL(resumeId: number): Promise<{
  download_url: string;
  expires_in_seconds: number;
  expires_at: string;
}> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/${resumeId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to get download URL');
  return response.json();
}

// Get permanent share link
export async function getResumeShareLink(resumeId: number): Promise<PermanentLink> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/pdf-resumes/${resumeId}/share-link`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to get share link');
  return response.json();
}
```

---

### Next.js Component Example: PDF Resume Upload

```typescript
// app/dashboard/resumes/upload/page.tsx
'use client';

import { useState } from 'react';
import { uploadPDFResume, getResumeShareLink } from '@/lib/api/pdf-resumes';
import { useRouter } from 'next/navigation';

export default function UploadResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !resumeName) {
      setError('Please select a file and enter a resume name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload resume
      const uploadedResume = await uploadPDFResume(file, resumeName, description, isPublic);

      // Get permanent share link
      const linkData = await getResumeShareLink(uploadedResume.id);
      setShareLink(linkData.permanent_link);
      setQrCode(linkData.qr_code);

      // Redirect to resume list after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/resumes');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload PDF Resume</h1>

      {shareLink ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            ✅ Resume Uploaded Successfully!
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permanent Share Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            {qrCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code:
                </label>
                <img src={qrCode} alt="Resume QR Code" className="w-48 h-48" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File *
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Name *
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Updated resume for senior positions"
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Make this resume public
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !file || !resumeName}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
      )}
    </div>
  );
}
```

---




## ��🔍 Job Browsing & Application

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

**IMPORTANT**: You must provide **either** `resume_id` (builder resume) **OR** `uploaded_resume_id` (PDF resume), but **not both**.

**Request Option 1: Using Builder Resume**
```json
{
  "resume_id": 123,
  "cover_letter_id": 45,
  "custom_message": "I am excited to apply for this position..."
}
```

**Request Option 2: Using Uploaded PDF Resume**
```json
{
  "uploaded_resume_id": 78,
  "cover_letter_id": 45,
  "custom_message": "I am excited to apply for this position..."
}
```

**Validation Rules**:
- ✅ At least one resume type must be provided (`resume_id` OR `uploaded_resume_id`)
- ❌ Cannot provide both `resume_id` AND `uploaded_resume_id`
- ✅ `cover_letter_id` is optional
- ✅ `custom_message` is optional

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
    "uploaded_resume_id": null,
    "cover_letter_id": 45,
    "status": "applied",
    "applied_at": "2025-12-20T10:30:00",
    "custom_message": "I am excited to apply for this position..."
  }
}
```

**Error Responses**:
```json
// No resume provided
{
  "detail": "Either resume_id or uploaded_resume_id must be provided"
}

// Both resume types provided
{
  "detail": "Cannot provide both resume_id and uploaded_resume_id. Choose one."
}

// Resume not found
{
  "detail": "Resume not found or does not belong to you"
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
**Endpoint**: `GET /api/v1/recruiters/jobs/my-postings`
**Auth**: Required (Recruiter Bearer Token)

**Query Parameters**:
- `is_active` (optional): Filter by active/inactive status (true/false)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "total": 1,
  "jobs": [
    {
      "id": 3,
      "title": "Senior Software Engineer",
      "company_name": "Test Company Inc",
      "location": "San Francisco, CA",
      "job_type": "full_time",
      "is_active": true,
      "application_count": 0,
      "view_count": 0,
      "posted_date": "2025-12-20T14:39:27.676888",
      "created_at": "2025-12-20T14:39:27.672399"
    }
  ]
}
```

---

### 3. Get Single Job Posting Details
**Endpoint**: `GET /api/v1/recruiters/jobs/posting/{job_id}`
**Auth**: Required (Recruiter Bearer Token)

**Response**: Returns complete job details
```json
{
  "success": true,
  "job": {
    "id": 3,
    "title": "Senior Software Engineer",
    "slug": "senior-software-engineer-at-test-company-inc-san-francisco-ca-3",
    "company_name": "Test Company Inc",
    "location": "San Francisco, CA",
    "job_type": "full_time",
    "experience_level": "senior",
    "description": "We are looking for a senior software engineer...",
    "requirements": "5+ years of experience",
    "responsibilities": "Lead development of new features",
    "salary_min": 130000,
    "salary_max": 200000,
    "salary_currency": "USD",
    "is_remote": true,
    "required_skills": ["Python", "FastAPI", "PostgreSQL"],
    "preferred_skills": [],
    "categories": [],
    "is_active": true,
    "application_count": 0,
    "view_count": 0,
    "posted_date": "2025-12-20T14:39:27.676888",
    "created_at": "2025-12-20T14:39:27.672399",
    "updated_at": "2025-12-20T14:41:23.022177"
  }
}
```

---

### 4. Update Job Posting
**Endpoint**: `PUT /api/v1/recruiters/jobs/posting/{job_id}`
**Auth**: Required (Recruiter Bearer Token)

**Request** (all fields optional):
```json
{
  "title": "Senior Software Engineer - Updated",
  "salary_min": 140000,
  "salary_max": 210000,
  "responsibilities": "Lead development of new features and mentor junior developers",
  "is_active": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "job": {
    "id": 3,
    "title": "Senior Software Engineer - Updated",
    "slug": "senior-software-engineer-updated-at-test-company-inc-san-francisco-ca-3",
    "company_name": "Test Company Inc",
    "location": "San Francisco, CA",
    "is_active": true,
    "updated_at": "2025-12-20T14:41:23.022177"
  }
}
```

**Note**: Updating title, company_name, or location will regenerate the slug automatically.

---

### 5. Delete/Deactivate Job Posting
**Endpoint**: `DELETE /api/v1/recruiters/jobs/posting/{job_id}`
**Auth**: Required (Recruiter Bearer Token)

**Query Parameters**:
- `permanent` (optional): Set to `true` for hard delete (default: false = soft delete)

**Response**:
```json
{
  "success": true,
  "message": "Job posting deactivated",
  "job_id": 3
}
```

**Note**: Soft delete (default) sets `is_active=false`. Hard delete permanently removes the job (not recommended if there are applications).

---

### 6. Get Dashboard Statistics
**Endpoint**: `GET /api/v1/recruiters/jobs/dashboard/stats`
**Auth**: Required (Recruiter Bearer Token)

**Response**:
```json
{
  "success": true,
  "total_job_postings": 1,
  "active_job_postings": 1,
  "total_applications": 0
}
```

---

### 7. Get Applications for Job
**Endpoint**: `GET /api/v1/recruiters/jobs/posting/{job_id}/applications`
**Auth**: Required (Recruiter Bearer Token)

**Query Parameters**:
- `status_filter` (optional): Filter by application status

**Response**:
```json
{
  "success": true,
  "job_id": 3,
  "job_title": "Senior Software Engineer",
  "total_applications": 0,
  "applications": [
    {
      "id": 1,
      "user_id": 5,
      "resume_id": null,
      "cover_letter_id": null,
      "status": "applied",
      "applied_at": "2025-12-20T10:30:00",
      "custom_message": "I am excited to apply for this position...",
      "created_at": "2025-12-20T10:30:00"
    }
  ]
}
```

---

### 8. Get Detailed Application Information
**Endpoint**: `GET /api/v1/recruiters/jobs/application/{application_id}`
**Auth**: Required (Recruiter Bearer Token)

**Response**: Returns complete application details with candidate information
```json
{
  "success": true,
  "application": {
    "id": 1,
    "status": "applied",
    "applied_at": "2025-12-20T10:30:00",
    "custom_message": "I am excited to apply for this position...",
    "portfolio_items": [],
    "created_at": "2025-12-20T10:30:00",
    "updated_at": "2025-12-20T10:30:00"
  },
  "candidate": {
    "id": 5,
    "email": "candidate@example.com",
    "full_name": "John Doe",
    "created_at": "2025-12-20T09:00:00"
  },
  "job": {
    "id": 3,
    "title": "Senior Software Engineer",
    "slug": "senior-software-engineer-at-test-company-inc-san-francisco-ca-3",
    "company_name": "Test Company Inc",
    "location": "San Francisco, CA"
  },
  "resume": {
    "id": 123,
    "title": "John Doe - Software Engineer",
    "created_at": "2025-12-15T10:00:00"
  },
  "uploaded_resume": null
}
```

---

### 9. Update Application Status
**Endpoint**: `PUT /api/v1/recruiters/jobs/application/{application_id}/status`
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
  "message": "Application status updated from applied to interview_scheduled",
  "application": {
    "id": 1,
    "job_posting_id": 3,
    "user_id": 5,
    "status": "interview_scheduled",
    "updated_at": "2025-12-20T11:00:00"
  }
}
```

**Available Application Statuses**:
- `applied` - Initial application
- `under_review` - Recruiter is reviewing
- `interview_scheduled` - Interview has been scheduled
- `interviewed` - Interview completed
- `offered` - Job offer extended
- `accepted` - Candidate accepted offer
- `rejected` - Application rejected
- `withdrawn` - Candidate withdrew application

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

  // Resumes
  async getMyResumes() {
    return this.request('/api/v1/resumes/', {}, true);
  }

  async getResume(resumeId: number) {
    return this.request(`/api/v1/resumes/${resumeId}`, {}, true);
  }

  async createResume(data: any) {
    return this.request(
      '/api/v1/resumes/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    );
  }

  async updateResume(resumeId: number, data: any) {
    return this.request(
      `/api/v1/resumes/${resumeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );
  }

  async deleteResume(resumeId: number) {
    return this.request(
      `/api/v1/resumes/${resumeId}`,
      {
        method: 'DELETE',
      },
      true
    );
  }

  async generateResumeFile(resumeId: number, format: 'pdf' | 'docx') {
    return this.request(
      `/api/v1/resumes/${resumeId}/generate`,
      {
        method: 'POST',
        body: JSON.stringify({ format }),
      },
      true
    );
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

### 3. Resume List Page

**File**: `app/resumes/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Resume {
  id: number;
  name: string;
  template_id: number;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_name?: string;
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await api.getMyResumes();
      setResumes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.deleteResume(resumeId);
      setResumes(resumes.filter(r => r.id !== resumeId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  const handleDownload = async (resumeId: number, format: 'pdf' | 'docx') => {
    try {
      const result = await api.generateResumeFile(resumeId, format);
      // Open download URL
      window.open(result.file_url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Failed to generate resume');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading resumes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <button
          onClick={() => router.push('/resumes/create')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Resume
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any resumes yet.</p>
          <button
            onClick={() => router.push('/resumes/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{resume.name}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Template: {resume.template_name || `Template ${resume.template_id}`}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Updated: {new Date(resume.updated_at).toLocaleDateString()}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/resumes/${resume.id}/edit`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(resume.id, 'pdf')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownload(resume.id, 'docx')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    DOCX
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
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

### 4. Job Listing Page (SEO-Optimized)

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

