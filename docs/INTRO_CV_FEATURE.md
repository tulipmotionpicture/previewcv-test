# Intro CV Feature — Frontend Integration Guide

Captures a lightweight onboarding profile right after a user's **first login** (before they build a CV), and surfaces those open‑to‑work users to recruiters in **CV search** until they create a real CV.

- **Candidate side**: submit/read the intro profile.
- **Recruiter side**: intro users appear in CV search as regular profiles flagged `is_intro_only` ("No CV"), and can be **unlocked** (1 credit, 90 days) to reveal all their info.

All routes are under the API version prefix (default `v1`), e.g. base `https://<host>/api/v1`.

Auth: send `Authorization: Bearer <JWT>`.
- Candidate endpoints require a **user** token (`entity: "user"`).
- Recruiter endpoints require a **verified recruiter** token (`entity: "recruiter"`).

---

## 1. Candidate — Create intro profile

`POST /api/v1/intro-cv`

Insert‑only: **one intro record per user**. Call this after first login.

**Headers**
```
Authorization: Bearer <USER_JWT>
Content-Type: application/json
```

**Request body**
```json
{
  "professional_title": "Full Stack Web Developer",
  "personal_details": {
    "first_name": "Aswin",
    "last_name": "M",
    "email": "aswinmsd777@gmail.com",
    "phone": { "country_code": "+91", "number": "8220789344" },
    "gender": "female"
  },
  "address": {
    "country": "India",
    "state": "Tamil Nadu",
    "city": "Nagercoil",
    "street_number": "Mannarkovil",
    "postal_zip_code": "785001",
    "full_address": "Nagercoil, Kanyakumari, Tamil Nadu, India"
  },
  "open_to_work": true,
  "notice_period": "1 Month"
}
```

**Field notes**
- All fields are optional **except** the request must be valid JSON. `open_to_work` defaults to `false`.
- `notice_period` — if provided, must be one of:
  `"Immediately Available"`, `"15 Days"`, `"1 Month"`, `"2 Months"`, `"3 Months"`.
- `personal_details` and `address` are nested objects; `phone` is a nested object with `country_code` + `number`.

**Success — `201 Created`**
```json
{
  "id": 1,
  "user_id": 4,
  "professional_title": "Full Stack Web Developer",
  "personal_details": {
    "first_name": "Aswin",
    "last_name": "M",
    "email": "aswinmsd777@gmail.com",
    "phone": { "country_code": "+91", "number": "8220789344" },
    "gender": "female"
  },
  "address": {
    "country": "India",
    "state": "Tamil Nadu",
    "city": "Nagercoil",
    "street_number": "Mannarkovil",
    "postal_zip_code": "785001",
    "full_address": "Nagercoil, Kanyakumari, Tamil Nadu, India"
  },
  "open_to_work": true,
  "notice_period": "1 Month",
  "created_at": "2026-06-26T21:50:48.475664",
  "updated_at": "2026-06-26T21:50:48.475664"
}
```

**Errors**
| Status | When | Body |
|---|---|---|
| `409 Conflict` | User already submitted intro info | `{"detail":"Intro CV info already exists for this user"}` |
| `422 Unprocessable Entity` | Invalid `notice_period` (or bad body) | see below |
| `401 Unauthorized` | Missing/invalid user token | `{"detail":"Could not validate credentials"}` |

`422` example (bad notice period):
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "notice_period"],
      "msg": "Value error, Invalid notice period. Allowed values: Immediately Available, 15 Days, 1 Month, 2 Months, 3 Months",
      "input": "6 Months"
    }
  ]
}
```

> Editing an existing intro record is not supported yet (POST is insert‑only). A `PUT /api/v1/intro-cv/me` can be added if needed.

---

## 2. Candidate — Get my intro profile

`GET /api/v1/intro-cv/me`

**Headers**
```
Authorization: Bearer <USER_JWT>
```

**Success — `200 OK`** — same shape as the create response above.

**Errors**
| Status | When | Body |
|---|---|---|
| `404 Not Found` | No intro record for this user | `{"detail":"Intro CV info not found"}` |
| `401 Unauthorized` | Missing/invalid user token | `{"detail":"Could not validate credentials"}` |

Use `404` to decide whether to show the onboarding form (no record yet) vs. a "submitted" state.

---

## 3. Recruiter — CV search (intro candidates included)

`POST /api/v1/recruiter/cv-search/search`  *(unchanged route)*

Intro (No‑CV) candidates now appear in results **as regular CV profiles** with extra flags. Everything else about the response is unchanged.

### What's new on each result (`CVSearchResult`)
| Field | Type | Meaning |
|---|---|---|
| `resume_id` | `int \| null` | **Now nullable.** `null` for intro‑only candidates. |
| `is_intro_only` | `bool` | `true` → this is a No‑CV onboarding candidate. Badge it in the UI. |
| `intro_cv_info_id` | `int \| null` | Use this to **unlock** an intro candidate (see §4). `null` for normal resumes. |

For intro candidates: resume‑derived fields are empty (`skills`, `experience_years`, `current_company`, `highest_education`, `certifications_count` → `null`). `open_to_work`, `notice_period`, `location`, `professional_title`, and `full_name` are populated.

### When do intro candidates appear?
- Only users who are **open to work** AND have **no real CV** (no active builder resume and no uploaded PDF). Once they create either, they drop out of these results automatically.
- They are included **only** when the search uses filters intro data can satisfy: `open_to_work_only`, location (`country`/`state`/`city`), `keyword_search`, notice‑period filters, `last_active_days`, pagination/sort.
- They are **excluded** when any resume‑only filter is set (`skills`, `job_titles`, `companies`, experience ranges, education filters, `industry`, `languages`, `certifications`, `min_projects_count`, `has_volunteer_experience`, `has_github`, `has_linkedin`, bucket filters).
- Ordering: intro candidates are appended **after** resume results (they have no resume‑derived rank); pagination/total counts include them.

### Sample request
```json
{ "open_to_work_only": true, "page": 1, "page_size": 20 }
```

### Sample intro result (locked — before unlock)
```json
{
  "resume_id": null,
  "resume_name": "Backend Engineer Intro",
  "professional_title": "Backend Engineer Intro",
  "is_intro_only": true,
  "intro_cv_info_id": 4,
  "user_id": 1,
  "is_unlocked": false,
  "unlocked_until": null,
  "full_name": "Ravi K.",
  "profile_image_url": null,
  "location": "Bengaluru, Karnataka, India",
  "skills": null,
  "experience_years": null,
  "current_company": null,
  "highest_education": null,
  "languages": null,
  "certifications_count": null,
  "profile_summary": null,
  "user_other_resumes": null,
  "in_buckets": [],
  "bucket_count": 0,
  "last_active": "2026-06-26T22:01:05.842930",
  "open_to_work": true,
  "notice_period": "1 Month",
  "created_at": "2026-06-26T22:01:05.842930",
  "updated_at": "2026-06-26T22:01:05.842930"
}
```

After the recruiter unlocks the candidate, the **same search result** shows `"is_unlocked": true`, the real `"full_name"` (e.g. `"Ravi Kumar"`), and a populated `"unlocked_until"`.

---

## 4. Recruiter — Unlock an intro candidate

`POST /api/v1/recruiter/cv-search/unlock-intro/{intro_cv_info_id}`

Unlocks a No‑CV candidate and **reveals all stored info**. Costs **1 credit**; access lasts **90 days**. Re‑unlocking within that window is free (idempotent).

> Use the `intro_cv_info_id` from the search result — **not** a `resume_id`. The normal `POST /unlock/{resume_id}` endpoint does not apply to intro candidates.

**Headers**
```
Authorization: Bearer <RECRUITER_JWT>
```

**Optional query param**: `source` (default `"search"`).

**Success — `200 OK`**
```json
{
  "success": true,
  "message": "Intro profile unlocked successfully",
  "credits_remaining": 485,
  "intro_cv_info_id": 4,
  "user_id": 1,
  "professional_title": "Backend Engineer Intro",
  "full_name": "Ravi Kumar",
  "first_name": "Ravi",
  "last_name": "Kumar",
  "email": "ravi.k@example.com",
  "phone_country_code": "+91",
  "phone_number": "9000000000",
  "gender": "male",
  "country": "India",
  "state": "Karnataka",
  "city": "Bengaluru",
  "street_number": "12 MG Road",
  "postal_zip_code": "560001",
  "full_address": "12 MG Road, Bengaluru, Karnataka, India",
  "open_to_work": true,
  "notice_period": "1 Month",
  "unlocked_at": "2026-06-26T22:01:44.689817",
  "unlocked_until": "2026-09-24T22:01:44.689817"
}
```

**Already unlocked** (no extra charge): same body with `"message": "Intro profile already unlocked"` and unchanged `credits_remaining`.

**Errors**
| Status | When | Body |
|---|---|---|
| `404 Not Found` | `intro_cv_info_id` doesn't exist | `{"detail":"Intro profile {id} not found"}` |
| `400 Bad Request` | Insufficient credits | `{"detail":"Insufficient credits. Need 1, have 0"}` |
| `400 Bad Request` | No active CV subscription | `{"detail":"No active CV subscription found"}` |
| `401 Unauthorized` | Missing/invalid recruiter token | — |

Check remaining credits any time via `GET /api/v1/recruiter/cv-search/credits`.

---

## 5. Frontend integration checklist

1. **Onboarding**: after first login, call `GET /api/v1/intro-cv/me`. On `404`, show the intro form and `POST /api/v1/intro-cv`. On `409`, treat as already submitted.
2. **Notice period dropdown**: restrict to the 5 allowed values listed in §1.
3. **CV search results**: branch on `is_intro_only`.
   - `true` → render a "No CV" badge; resume‑specific fields (skills/experience/education) will be empty.
   - To unlock, call `POST /unlock-intro/{intro_cv_info_id}` (NOT `/unlock/{resume_id}`).
   - `false` → existing behavior; unlock via `POST /unlock/{resume_id}`.
4. **Unlock responses differ**:
   - Resume unlock → `CVUnlockResponse` (includes `resume_pdf_url`, `resume_data`).
   - Intro unlock → `IntroUnlockResponse` (flat contact/profile fields, no PDF/resume data — an intro candidate has no CV to download).
5. **Post‑unlock**: re‑rendering search will show `is_unlocked: true` and the real `full_name`; you can also use the unlock response directly to populate a contact panel.

---

## Reference — endpoint summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/intro-cv` | user | Create intro profile (409 if exists) |
| `GET` | `/api/v1/intro-cv/me` | user | Get my intro profile (404 if none) |
| `POST` | `/api/v1/recruiter/cv-search/search` | recruiter | Search CVs; intro candidates flagged `is_intro_only` |
| `POST` | `/api/v1/recruiter/cv-search/unlock-intro/{intro_cv_info_id}` | recruiter | Unlock intro candidate, reveal all info (1 credit, 90 days) |
| `GET` | `/api/v1/recruiter/cv-search/credits` | recruiter | Remaining CV credits |
