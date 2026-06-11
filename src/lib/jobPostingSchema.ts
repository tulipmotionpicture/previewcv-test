// Builds schema.org `JobPosting` JSON-LD for the public job detail page so listings
// become eligible for the Google for Jobs search experience.
//
// This emits NOTHING visible — the result is serialized into an
// `<script type="application/ld+json">` tag. We are a job board hosting many employers'
// roles, so `hiringOrganization` is the actual employer (job.company_name), never
// PreviewCV, per Google's third-party/aggregator guidance:
//   https://developers.google.com/search/docs/appearance/structured-data/job-posting
//
// Google warns on empty/null values, so every optional property is added only when its
// source data exists (see `stripEmpty`).

import { Job } from "@/types/api";

// Company data comes from the public gallery endpoint (loosely typed as `any` upstream).
export interface CompanyData {
  company_website?: string;
  company_logo_url?: string;
  company_name?: string;
}

// job_type (our enum) -> schema.org employmentType enum.
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  freelance: "CONTRACTOR",
  internship: "INTERN",
  temporary: "TEMPORARY",
  other: "OTHER",
};

// salary_type (our enum) -> schema.org QuantitativeValue.unitText enum.
const SALARY_UNIT_MAP: Record<string, string> = {
  hourly: "HOUR",
  weekly: "WEEK",
  monthly: "MONTH",
  yearly: "YEAR",
};

/** Drop keys whose value is undefined/null/"" / empty object, recursively. */
function stripEmpty<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => stripEmpty(v)).filter((v) => v != null) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value == null || value === "") continue;
      const cleaned = stripEmpty(value);
      // Skip objects that became empty after cleaning (but keep numbers/booleans).
      if (
        cleaned &&
        typeof cleaned === "object" &&
        !Array.isArray(cleaned) &&
        Object.keys(cleaned).length === 0
      ) {
        continue;
      }
      out[key] = cleaned;
    }
    return out as T;
  }
  return obj;
}

/**
 * Compose the full job description as HTML for the JSON-LD `description`.
 * Google requires the COMPLETE description and keeps `<p>/<ul>/<li>/<br>` structure, so
 * we concatenate the three HTML sections shown on the page (description, responsibilities,
 * requirements) under <h3> headings — matching what a candidate actually reads.
 */
function buildDescriptionHtml(job: Job): string {
  const parts: string[] = [];
  if (job.description) parts.push(job.description);
  if (job.responsibilities) {
    parts.push(`<h3>Responsibilities</h3>${job.responsibilities}`);
  }
  if (job.requirements) {
    parts.push(`<h3>Requirements</h3>${job.requirements}`);
  }
  return parts.join("");
}

/** Structured PostalAddress from granular fields, falling back to the free-text location. */
function buildAddress(job: Job) {
  const hasGranular = job.city || job.state || job.country;
  return {
    "@type": "PostalAddress",
    addressLocality: job.city || (!hasGranular ? job.location : undefined),
    addressRegion: job.state || undefined,
    addressCountry: job.country || undefined,
  };
}

/** baseSalary MonetaryAmount, or undefined when no salary is set. */
function buildBaseSalary(job: Job) {
  if (job.salary_min == null && job.salary_max == null) return undefined;
  const unitText = job.salary_type
    ? SALARY_UNIT_MAP[job.salary_type.toLowerCase()]
    : undefined;
  return {
    "@type": "MonetaryAmount",
    currency: job.salary_currency || undefined,
    value: {
      "@type": "QuantitativeValue",
      minValue: job.salary_min ?? undefined,
      maxValue: job.salary_max ?? undefined,
      unitText,
    },
  };
}

/**
 * Build the JobPosting JSON-LD object for a job.
 *
 * Returns `null` when the job should NOT be indexed by Google Jobs — i.e. it is closed
 * (expired / deactivated / rejected / not accepting applications). The caller omits the
 * `<script>` entirely in that case so the listing drops out of the Jobs experience while
 * the human-readable page can stay live.
 */
export function buildJobPostingJsonLd(
  job: Job,
  companyData?: CompanyData | null,
): Record<string, unknown> | null {
  if (isJobClosed(job)) return null;

  const description = buildDescriptionHtml(job);
  // Required by Google: description must exist and must not equal the title.
  if (!description || description.trim() === job.title?.trim()) return null;

  const employmentType = job.job_type
    ? EMPLOYMENT_TYPE_MAP[job.job_type.toLowerCase()]
    : undefined;

  const validThrough = job.application_deadline || job.expires_at || undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.posted_date,
    validThrough,
    employmentType,
    identifier: {
      "@type": "PropertyValue",
      name: job.company_name,
      value: String(job.id),
    },
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      logo: job.company_logo_url || companyData?.company_logo_url || undefined,
      sameAs: companyData?.company_website || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: buildAddress(job),
    },
    baseSalary: buildBaseSalary(job),
    directApply: true,
  };

  // Remote roles: mark TELECOMMUTE and declare where applicants may be located.
  if (job.is_remote) {
    jsonLd.jobLocationType = "TELECOMMUTE";
    if (job.country) {
      jsonLd.applicantLocationRequirements = {
        "@type": "Country",
        name: job.country,
      };
    }
  }

  return stripEmpty(jsonLd);
}

/** A job is "closed" (and must not be listed in Google Jobs) under any of these signals. */
export function isJobClosed(job: Job): boolean {
  const closedStatuses: ReadonlyArray<Job["status"]> = [
    "expired",
    "deactivated",
    "rejected",
  ];
  return (
    closedStatuses.includes(job.status) ||
    job.is_expired === true ||
    job.accepting_applications === false
  );
}
