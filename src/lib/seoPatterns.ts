import type { SEOPattern } from "@/types/jobs";

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
