// Builds schema.org `Organization` JSON-LD for a public recruiter/company profile.
//
// This emits NOTHING visible — the result is serialized into an
// `<script type="application/ld+json">` tag. These profiles are SEO landing pages for the
// employer, so the organization described here is the employer itself, never PreviewCV.
//
// Google warns on empty/null values, so every optional property is added only when its
// source data exists. Nothing is inferred: `created_at` is when the account was created,
// not when the company was founded, so it is deliberately NOT emitted as `foundingDate`.

import { RecruiterProfile } from "@/types";
import { htmlToPlainText } from "@/lib/metaText";

/** Placeholder logos are seeded on signup and must not be published as a real logo. */
export function isRealLogo(url?: string | null): boolean {
  return !!url && !/via\.placeholder\.com|placehold\.(it|co)/i.test(url);
}

export function buildOrganizationJsonLd(
  profile: RecruiterProfile,
  baseUrl: string,
): Record<string, unknown> | null {
  const name =
    profile.company_name ||
    profile.display_name ||
    profile.full_name ||
    profile.username;
  if (!name) return null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
  };

  if (baseUrl && profile.username) {
    schema.url = `${baseUrl}/recruiter/${profile.username}`;
  }
  if (isRealLogo(profile.company_logo_url)) {
    schema.logo = profile.company_logo_url;
    schema.image = profile.company_logo_url;
  }
  if (profile.bio) {
    const description = htmlToPlainText(profile.bio);
    if (description) schema.description = description;
  }
  if (profile.location) {
    schema.address = profile.location;
  }
  if (profile.industry) {
    schema.knowsAbout = profile.industry;
  }
  if (profile.company_email) {
    schema.email = profile.company_email;
  }
  if (profile.company_phone) {
    schema.telephone = profile.company_phone;
  }

  // `sameAs` is for the organization's own canonical presences elsewhere.
  const sameAs = [profile.company_website, profile.linkedin_url].filter(
    (u): u is string => !!u && /^https?:\/\//i.test(u),
  );
  if (sameAs.length > 0) schema.sameAs = sameAs;

  return schema;
}
