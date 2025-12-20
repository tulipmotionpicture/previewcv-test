# Job Slug & Recruiter Profile Slug Endpoints - Quick Reference

**Date**: 2025-12-20  
**Status**: ✅ Fully Implemented and Documented

---

## 📋 Quick Summary

Both job slugs and recruiter profile usernames are **already implemented** and **fully documented** in `PREVIEWCV_API_INTEGRATION_GUIDE.md`.

---

## 🔗 Job Slug Endpoint

### **Endpoint**
```
GET /api/v1/jobs/slug/{slug}
```

### **Features**
- ✅ Public endpoint (no authentication required)
- ✅ SEO-friendly URLs
- ✅ Auto-increments view count
- ✅ Returns full job details

### **Slug Format**
Pattern: `{title}-at-{company}-{location}-{id}`

**Examples**:
- `senior-python-developer-at-google-mountain-view-ca-123`
- `frontend-engineer-at-meta-remote-456`
- `data-scientist-at-netflix-los-angeles-ca-789`

### **Example Request**
```bash
curl -X GET "https://api.previewcv.com/api/v1/jobs/slug/senior-python-developer-at-google-mountain-view-ca-123"
```

### **Frontend URL**
```
https://previewcv.com/jobs/senior-python-developer-at-google-mountain-view-ca-123
```

### **Next.js Implementation**
```typescript
// app/jobs/[slug]/page.tsx
export default async function JobPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${API_URL}/api/v1/jobs/slug/${params.slug}`);
  const data = await res.json();
  return <JobDetails job={data.job} />;
}
```

---

## 👤 Recruiter Profile Endpoint

### **Endpoint**
```
GET /api/v1/recruiters/profile/{username}
```

### **Features**
- ✅ Public endpoint (no authentication required)
- ✅ Returns public profile (hides email, phone, last_login)
- ✅ Username is case-insensitive
- ✅ Only shows active recruiters

### **Username Format**
Pattern: Alphanumeric, hyphens, underscores (lowercase)

**Examples**:
- `google-careers`
- `meta-recruiting`
- `john-tech-recruiter`
- `acme_corp`

### **Example Request**
```bash
curl -X GET "https://api.previewcv.com/api/v1/recruiters/profile/google-careers"
```

### **Frontend URL**
```
https://previewcv.com/recruiter/google-careers
```

### **Next.js Implementation**
```typescript
// app/recruiter/[username]/page.tsx
export default async function RecruiterPage({ params }: { params: { username: string } }) {
  const res = await fetch(`${API_URL}/api/v1/recruiters/profile/${params.username}`);
  const recruiter = await res.json();
  return <RecruiterProfile recruiter={recruiter} />;
}
```

---

## 💡 About the Bio Field

### **Current Implementation**
The `bio` field in the recruiter model is **already perfect** for detailed company information:

- ✅ **Type**: `Text` (unlimited length in PostgreSQL - up to 1GB)
- ✅ **Available for**: Both company and individual recruiters
- ✅ **Exposed in**: All profile APIs (public and private)
- ✅ **Updatable via**: `PUT /api/v1/recruiters/profile/me`

### **What Can Go in Bio**
The bio field can contain comprehensive company information:
- Company mission and values
- Culture and work environment
- Benefits and perks (health insurance, 401k, etc.)
- Hiring process details
- Team structure and size
- Growth opportunities
- Office locations and remote work policy
- Technologies used
- Any other relevant information

### **Example Bio Content**
```
Google is a global technology leader focused on improving the ways people connect with information.

Our Culture:
- Innovation-driven environment
- Work-life balance with flexible schedules
- Competitive compensation and benefits
- Opportunities for growth and learning

Why Join Google:
✓ Cutting-edge technology stack
✓ Collaborative team environment
✓ Comprehensive health benefits
✓ 401(k) matching
✓ Free meals and snacks
✓ On-site fitness centers
✓ Generous parental leave

Our Hiring Process:
1. Initial phone screen
2. Technical interviews
3. Team matching
4. Offer
```

### **No Additional Field Needed**
❌ **Don't need**: Separate `company_description` field  
✅ **Already have**: `bio` field with unlimited length  
✅ **Recommendation**: Use the existing `bio` field for all detailed company information

---

## 📚 Full Documentation

For complete examples, API responses, and Next.js implementation code, see:
- **`PREVIEWCV_API_INTEGRATION_GUIDE.md`** - Section: "Public URLs & SEO-Friendly Slugs"

---

## ✅ Summary

| Feature | Job Slug | Recruiter Profile |
|---------|----------|-------------------|
| **Endpoint** | `GET /api/v1/jobs/slug/{slug}` | `GET /api/v1/recruiters/profile/{username}` |
| **Auth Required** | ❌ No | ❌ No |
| **SEO Friendly** | ✅ Yes | ✅ Yes |
| **Auto-generated** | ✅ Yes (on create/update) | ❌ No (set during registration) |
| **Format** | `{title}-at-{company}-{location}-{id}` | Alphanumeric + hyphens/underscores |
| **Case Sensitive** | ✅ Yes | ❌ No (lowercase) |
| **Shareable** | ✅ Yes | ✅ Yes |
| **Documented** | ✅ Yes | ✅ Yes |

**Both endpoints are fully implemented, tested, and documented!** 🎉

