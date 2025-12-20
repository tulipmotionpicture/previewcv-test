# getPublicRecruiterProfile() - Implementation & Usage Guide

**Date**: 2025-12-20  
**Function**: `getPublicRecruiterProfile(username: string)`  
**Location**: `src/lib/api.ts:223`

---

## 📋 Overview

The `getPublicRecruiterProfile()` function fetches **public** recruiter profile information by username. This is different from `getRecruiterProfile()` which fetches the **private** profile of the currently authenticated recruiter.

---

## 🔍 Implementation Details

### **Function Signature**

```typescript
async getPublicRecruiterProfile(username: string): Promise<RecruiterProfileResponse> {
    return this.request<RecruiterProfileResponse>(`/api/v1/recruiters/profile/${username}`);
}
```

**Location**: `src/lib/api.ts:223-225`

---

### **Key Characteristics**

1. **Public Endpoint** - No authentication required
2. **Username-based** - Fetches profile by username (not ID)
3. **Limited Information** - Returns public profile data only (no sensitive info like email, phone)
4. **Response Type** - Returns `RecruiterProfileResponse` (same as private profile)

---

## 🔐 Private vs Public Profile

### **Private Profile** (`getRecruiterProfile()`)
- **Endpoint**: `GET /api/v1/recruiters/profile/me`
- **Authentication**: ✅ Required (Bearer token)
- **Returns**: Full profile including email, phone, private fields
- **Usage**: Recruiter's own profile settings page

### **Public Profile** (`getPublicRecruiterProfile(username)`)
- **Endpoint**: `GET /api/v1/recruiters/profile/{username}`
- **Authentication**: ❌ Not required (public)
- **Returns**: Limited public information only
- **Usage**: Public recruiter profile pages visible to candidates

---

## 📊 Response Schema

### **RecruiterPublicProfileResponse** (from Swagger)

```typescript
{
  id: number;
  username: string;
  recruiter_type: string;
  display_name: string;
  bio?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  is_verified: boolean;
  profile_url: string;
  created_at: string; // date-time
  company_name?: string | null;
  company_website?: string | null;
  company_size?: string | null;
  industry?: string | null;
  company_logo_url?: string | null;
  full_name?: string | null;
  specialization?: string | null;
}
```

**Fields NOT included in public profile**:
- ❌ `email` - Private
- ❌ `phone` - Private
- ❌ `is_email_verified` - Private
- ❌ `last_login` - Private
- ❌ `years_experience` - Private (not in public schema)

---

## 🚀 Current Usage

### **1. Public Recruiter Profile Page**

**File**: `src/app/recruiter/profile/[username]/page.tsx`

**Current Status**: ⚠️ **Using Mock Data** (not connected to API yet)

```typescript
// Line 103 - Currently using mock data
const profile = MOCK_RECRUITER_PROFILES[username as keyof typeof MOCK_RECRUITER_PROFILES];
```

**TODO**: Replace mock data with actual API call:

```typescript
// Recommended implementation:
const [profile, setProfile] = useState<RecruiterProfile | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchProfile = async () => {
        try {
            const response = await api.getPublicRecruiterProfile(username);
            if (response.success && response.recruiter) {
                setProfile(response.recruiter);
            }
        } catch (error) {
            console.error('Failed to fetch recruiter profile:', error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchProfile();
}, [username]);
```

---

## 🎯 Use Cases

### **1. Public Recruiter Profile Pages**
- Candidates viewing recruiter profiles
- Displaying company information
- Showing active job postings from recruiter
- Recruiter verification badges

### **2. Recruiter Directory**
- Browse all recruiters
- Search recruiters by industry/location
- Filter by company size

### **3. Job Posting Attribution**
- Show recruiter info on job listings
- Link to recruiter profile from job posts
- Display recruiter verification status

---

## 🔗 URL Structure

### **Public Profile URL Format**

```
https://previewcv.com/recruiter/{username}
```

**Examples**:
- `https://previewcv.com/recruiter/techcorp`
- `https://previewcv.com/recruiter/john-recruiter`

**Note**: The current implementation in `src/app/recruiter/dashboard/profile/page.tsx:156` incorrectly uses recruiter ID instead of username:

```typescript
// ❌ INCORRECT (Line 156)
const publicProfileUrl = `https://previewcv.com/recruiter/${recruiter?.id || ''}`;

// ✅ CORRECT (should be)
const publicProfileUrl = `https://previewcv.com/recruiter/${recruiter?.username || ''}`;
```

---

## ✅ Summary

**Implementation Status**: ✅ **Fully Implemented**

**Current Usage**: ⚠️ **Partially Used** (mock data in public profile page)

**Next Steps**:
1. ✅ **DONE**: Added `specialization`, `years_experience`, `company_logo_url` to profile form
2. ⚠️ **TODO**: Replace mock data in `/recruiter/profile/[username]/page.tsx` with real API call
3. ⚠️ **TODO**: Fix public profile URL to use `username` instead of `id`

---

## 🎉 Conclusion

The `getPublicRecruiterProfile()` function is **fully implemented and ready to use**. It provides a secure way to fetch public recruiter information without exposing sensitive data. The next step is to integrate it into the public profile page to replace the mock data.

