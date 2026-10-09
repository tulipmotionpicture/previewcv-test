import { Job } from "@/types/api";

type JobAddressFields = Pick<
  Job,
  "location" | "city" | "state" | "country" | "street_address" | "postal_code"
>;

/**
 * The job's full address for display, e.g. "12 MG Road, Chennai, Tamil Nadu 600001, India".
 * Street address and postal code are optional (and the street is withheld for confidential
 * jobs by the API), so most jobs show just the location. Showing them here also keeps the
 * page in step with the address in the JobPosting data.
 */
export function formatJobAddress(job: JobAddressFields): string {
  const street = job.street_address?.trim();
  const postal = job.postal_code?.trim();
  if (!street && !postal) return job.location;
  if (!job.city && !job.state && !job.country) {
    return [street, job.location, postal].filter(Boolean).join(", ");
  }
  // The postal code follows the most specific region before the country.
  const region = job.state || job.city;
  return [
    street,
    job.city && job.city !== region ? job.city : null,
    region ? [region, postal].filter(Boolean).join(" ") : postal,
    job.country,
  ]
    .filter(Boolean)
    .join(", ");
}
