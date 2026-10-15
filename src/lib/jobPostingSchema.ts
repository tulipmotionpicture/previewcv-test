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
import { parseApiDate } from "@/lib/postedDate";

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
    // Only real values from the backend — never derived or guessed, which Google's
    // structured-data policy treats as misleading markup.
    streetAddress: job.street_address?.trim() || undefined,
    postalCode: job.postal_code?.trim() || undefined,
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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A date for Google in ISO 8601 with an explicit time zone.
 *
 * The API sends naive UTC timestamps ("2026-10-07T15:04:34.494109") with no offset, which
 * leaves Google to guess the zone — read as IST, every posting looked 5h30m earlier than it
 * was, and expired 5h30m early too. They are emitted as UTC ("…T15:04:34.494Z"). Date-only
 * values carry no time to place in a zone, so they pass through unchanged.
 */
function toSchemaDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (DATE_ONLY.test(value)) return value;
  return parseApiDate(value)?.toISOString() ?? value;
}

/** The instant a posting stops being valid. A date-only deadline runs to the end of that day. */
function validUntil(value?: string | null): Date | null {
  if (!value) return null;
  if (DATE_ONLY.test(value)) return new Date(`${value}T23:59:59.999Z`);
  return parseApiDate(value);
}

/**
 * Build the JobPosting JSON-LD object for a job.
 *
 * Returns `null` when the job should NOT be indexed by Google Jobs — i.e. it is closed
 * (expired / deactivated / rejected / not accepting applications), or its expiry time has
 * passed. The caller omits the `<script>` entirely in that case so the listing drops out of
 * the Jobs experience while the human-readable page can stay live.
 */
export function buildJobPostingJsonLd(
  job: Job,
  companyData?: CompanyData | null,
  now: Date = new Date(),
): Record<string, unknown> | null {
  if (isJobClosed(job)) return null;

  const validThroughRaw = job.application_deadline || job.expires_at;

  // Expiry guard — Google data only. The backend marks jobs expired in a batch that runs well
  // after `expires_at` (14+ hours observed), and until then reports them as published and
  // accepting applications. Publishing a JobPosting whose validThrough is already in the past
  // tells Google a job is open and closed at once, so the data is withheld from the moment
  // the expiry passes. The page itself — Apply button, closed notice — still follows the
  // backend's own flags. A renewal moves `expires_at` forward, so the data returns with it.
  // Deliberately not part of isJobClosed(), which the sitemap shares.
  const until = validUntil(validThroughRaw);
  if (until && until.getTime() <= now.getTime()) return null;

  const description = buildDescriptionHtml(job);
  // Required by Google: description must exist and must not equal the title.
  if (!description || description.trim() === job.title?.trim()) return null;

  const employmentType = job.job_type
    ? EMPLOYMENT_TYPE_MAP[job.job_type.toLowerCase()]
    : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: toSchemaDate(job.posted_date),
    validThrough: toSchemaDate(validThroughRaw),
    employmentType,
    identifier: {
      "@type": "PropertyValue",
      name: job.company_name,
      value: String(job.id),
    },
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      // The live profile logo first: the job keeps a copy taken when it was posted.
      logo: companyData?.company_logo_url || job.company_logo_url || undefined,
      sameAs: companyData?.company_website || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: buildAddress(job),
    },
    baseSalary: buildBaseSalary(job),
    // schema.org's count of open positions. Not in Google's documented JobPosting
    // properties (Google ignores what it doesn't use), but valid for other consumers.
    // Only sent when the recruiter gave a number, per schema.org: "Do not use if the
    // number of positions is unclear or not known."
    totalJobOpenings:
      job.vacancies && job.vacancies > 0 ? job.vacancies : undefined,
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
