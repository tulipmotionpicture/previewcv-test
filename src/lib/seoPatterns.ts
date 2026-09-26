import type { SEOPattern } from "@/types/jobs";

/**
 * Every real landing slug the backend mints has one of these shapes:
 *   "accounting-jobs", "full-time-jobs", "jobs-in-india", "full-time-jobs-in-india".
 * The by-slug endpoint, however, accepts ANY string as a "skill" search and splits it
 * into keywords, so /jobs/eum-necessitatibus-d-at-somesh-dahatonde-pune-6 rendered
 * "11 openings" (the keyword "at" matches almost everything). That turned every typo,
 * test job slug and scraped URL into an indexable near-duplicate page; Google indexed
 * one. Anything that isn't shaped like a landing slug is a 404.
 */
export function isLandingSlugShape(slug: string): boolean {
  return /^jobs-in-[a-z0-9-]+$|^[a-z0-9-]+-jobs$|^[a-z0-9-]+-jobs-in-[a-z0-9-]+$/.test(slug);
}

/**
 * The backend mints two slugs for the same city: a city-only one ("jobs-in-chennai",
 * pattern_type "location_city") and a country-qualified one ("jobs-in-chennai-india",
 * "location_city_country"). Both rendered the same jobs with self-referencing
 * canonicals, so Google saw duplicate pages. The country-qualified slug is the one the
 * homepage links to, so it is the canonical form.
 *
 * Returns the country-qualified slug for a city-only slug, or null when there is no
 * unambiguous equivalent. It only maps when exactly one country variant exists AND it
 * lists the same number of jobs, so a city name shared by two countries (or any count
 * drift) never redirects visitors away from jobs they could see before.
 */
export function countryQualifiedSlug(
  slug: string,
  patterns: SEOPattern[],
): string | null {
  const cityPattern = patterns.find(
    (p) => p.slug === slug && p.pattern_type === "location_city",
  );
  if (!cityPattern?.location) return null;

  const city = cityPattern.location.trim().toLowerCase();
  const candidates = patterns.filter(
    (p) =>
      p.pattern_type === "location_city_country" &&
      p.slug.startsWith(`${slug}-`) &&
      (p.location ?? "").trim().toLowerCase().startsWith(`${city},`),
  );

  if (candidates.length !== 1) return null;
  const [match] = candidates;
  return match.count === cityPattern.count ? match.slug : null;
}
