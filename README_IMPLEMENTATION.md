# PreviewCV - Implementation Guide

**Welcome to the PreviewCV Implementation Documentation!**

This guide provides a complete overview of the recent implementation work and how to continue development.

---

## 📚 Documentation Index

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **PREVIEWCV_API_INTEGRATION_GUIDE.md** | Complete API reference | When integrating new endpoints |
| **IMPLEMENTATION_PLAN.md** | Detailed task breakdown | For planning and estimation |
| **IMPLEMENTATION_SUMMARY.md** | What was completed | To understand recent changes |
| **PROGRESS_REPORT.md** | Current status & metrics | To track overall progress |
| **README_IMPLEMENTATION.md** | This file - Quick start guide | To get started quickly |

---

## 🚀 Quick Start

### What's Been Implemented

✅ **Phase 1 Complete: Authentication & Token Management**
- Automatic token refresh on 401 errors
- Server-side logout for both user types
- Social login callback handlers (Google & LinkedIn)
- Profile update API methods
- PDF resume management API methods
- Toast notification system

### What's Next

🔄 **Phase 2: Profile Management UI** (Start Here!)
- Build candidate profile settings page
- Build recruiter profile settings page
- Add photo/logo upload functionality
- Add password change feature

---

## 🏗️ Architecture Overview

### API Client (`src/lib/api.ts`)
The central API client with automatic token refresh:

```typescript
// Automatic token refresh on 401
// No manual intervention needed!
const user = await api.getCandidateProfile();

// New methods available:
await api.updateCandidateProfile({ full_name: "John Doe" });
await api.updateRecruiterProfile({ display_name: "Tech Corp" });
await api.getPdfResumeShareLink(resumeId);
await api.candidateLogout();
await api.recruiterLogout();
```

### Authentication Contexts

**Candidate Auth** (`src/context/AuthContext.tsx`):
```typescript
const { user, login, logout, updateProfile, isAuthenticated } = useAuth();

// Update profile
await updateProfile({ full_name: "New Name" });

// Logout (calls API + clears storage)
await logout();
```

**Recruiter Auth** (`src/context/RecruiterAuthContext.tsx`):
```typescript
const { recruiter, login, logout, updateProfile, isAuthenticated } = useRecruiterAuth();

// Update profile
await updateProfile({ display_name: "New Company" });

// Logout (calls API + clears storage)
await logout();
```

### Toast Notifications

**Toast Context** (`src/context/ToastContext.tsx`):
```typescript
const toast = useToast();

toast.success('Profile updated successfully!');
toast.error('Failed to save changes');
toast.warning('Please verify your email');
toast.info('New feature available!');
```

---

## 🎯 Implementation Priorities

### 1. Profile Settings Pages (HIGH PRIORITY)

**Candidate Profile Settings** - Create `/candidate/settings`
```typescript
// Example structure:
- Personal Information (name, email, phone)
- Profile Photo Upload
- Password Change
- Email Change (with verification)
- Account Settings
```

**Recruiter Profile Settings** - Update `/recruiter/dashboard/profile`
```typescript
// Example structure:
- Company/Individual Information
- Company Logo Upload
- Password Change
- Email Change (with verification)
- Account Settings
```

### 2. PDF Resume Dashboard (HIGH PRIORITY)

**Resume Management** - Create `/candidate/resumes`
```typescript
// Features to implement:
- List all PDF resumes
- Resume cards with thumbnails
- Share link generation with QR code
- Download functionality
- Edit metadata (name, description)
- Public/Private toggle
- Delete resume
```

### 3. UX Improvements (MEDIUM PRIORITY)

**Essential UX Enhancements**:
- Loading states (skeleton screens)
- Form validation (real-time)
- Error messages (user-friendly)
- Confirmation dialogs (delete, logout)
- Empty states (no data)
- Mobile responsiveness

---

## 💻 Code Examples

### Creating a Profile Settings Page

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProfileSettings() {
    const { user, updateProfile } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Full Name"
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}
```

### Using PDF Resume APIs

```typescript
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function ResumeCard({ resume }) {
    const toast = useToast();

    const handleGetShareLink = async () => {
        try {
            const { permanent_link, qr_code_url } = await api.getPdfResumeShareLink(resume.id);
            // Copy to clipboard
            navigator.clipboard.writeText(permanent_link);
            toast.success('Share link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to generate share link');
        }
    };

    const handleDownload = async () => {
        try {
            const { download_url } = await api.getPdfResumeDownloadUrl(resume.id);
            window.open(download_url, '_blank');
        } catch (error) {
            toast.error('Failed to get download link');
        }
    };

    return (
        <div>
            <h3>{resume.resume_name}</h3>
            <button onClick={handleGetShareLink}>Share</button>
            <button onClick={handleDownload}>Download</button>
        </div>
    );
}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**:
- [ ] Login as candidate
- [ ] Login as recruiter
- [ ] Social login (Google)
- [ ] Social login (LinkedIn)
- [ ] Logout (both user types)
- [ ] Token auto-refresh (wait for token expiry)

**Profile Management**:
- [ ] Update candidate profile
- [ ] Update recruiter profile
- [ ] Upload profile photo
- [ ] Change password

**PDF Resumes**:
- [ ] List all resumes
- [ ] Get resume details
- [ ] Update resume metadata
- [ ] Generate share link
- [ ] Download resume
- [ ] Delete resume

**UI/UX**:
- [ ] Toast notifications appear
- [ ] Toast auto-dismiss works
- [ ] Loading states show
- [ ] Error messages display
- [ ] Mobile responsive

---

## 🐛 Troubleshooting

### Common Issues

**Token Refresh Not Working**:
- Check browser console for errors
- Verify refresh_token is stored in localStorage
- Check API endpoint is correct

**Social Login Fails**:
- Verify callback URLs are correct
- Check backend OAuth configuration
- Ensure tokens are in URL parameters

**Toast Not Showing**:
- Verify ToastProvider is in layout
- Check z-index conflicts
- Verify toast context is imported

---

## 📞 Next Steps

1. **Read** `PROGRESS_REPORT.md` for current status
2. **Review** `IMPLEMENTATION_PLAN.md` for detailed tasks
3. **Start** with Profile Settings pages (highest priority)
4. **Test** each feature thoroughly
5. **Update** progress in task list

---

**Happy Coding! 🚀**

