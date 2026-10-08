// "Posted …" dates for job listings.
//
// Pages show relative text ("Today", "3 days ago", "2 months ago"), but that text depends on
// *when* it is read, so it is only ever computed in the browser (see components/PostedAgo).
// The server renders the exact date instead: job pages are cached for minutes to hours, and a
// relative string baked into cached HTML would stay "Today" for as long as the cache lived.

/**
 * Parse a timestamp from the API.
 *
 * The backend emits naive ISO timestamps in UTC with no offset ("2026-10-07T15:04:34.494109").
 * `new Date()` reads a naive timestamp as LOCAL time, which shifted every date by the viewer's
 * offset (5h30m in India) — enough to turn "Today" into "1 day ago" near midnight. Timestamps
 * that carry no offset are therefore read as UTC; ones that do are respected as-is.
 */
export function parseApiDate(value?: string | null): Date | null {
  if (!value) return null;
  const hasTime = value.includes("T");
  const hasOffset = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasTime && !hasOffset ? `${value}Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Exact posted date, e.g. "Oct 7, 2026".
 *
 * Locale and time zone are pinned so the server and the first browser render produce the
 * same string — otherwise React reports a hydration mismatch.
 */
export function formatPostedAbsolute(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Midnight of the given date's calendar day in the runtime's (the viewer's) time zone. */
function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}

/**
 * Relative posted date, counted in calendar days in the viewer's time zone.
 *
 *   same day          -> "Today"
 *   1 day             -> "1 day ago"
 *   2–30 days         -> "N days ago"
 *   31–364 days       -> "N months ago"
 *   365 days or more  -> "N years ago"
 *
 * Calendar days rather than elapsed hours, so a job posted at 11 pm yesterday reads
 * "1 day ago" at 1 am today. A date in the future (a skewed device clock) reads "Today"
 * rather than a negative count.
 */
export function formatPostedAgo(posted: Date, now: Date = new Date()): string {
  const days = Math.round(
    // Rounding absorbs the 23- and 25-hour days at daylight-saving changes.
    (startOfLocalDay(now) - startOfLocalDay(posted)) / 86_400_000,
  );

  if (days <= 0) return "Today";
  if (days <= 30) return plural(days, "day");

  if (days < 365) {
    // Whole calendar months, counting a month only once its day-of-month has been reached.
    let months =
      (now.getFullYear() - posted.getFullYear()) * 12 +
      (now.getMonth() - posted.getMonth());
    if (now.getDate() < posted.getDate()) months -= 1;
    return plural(Math.min(11, Math.max(1, months)), "month");
  }

  let years = now.getFullYear() - posted.getFullYear();
  if (
    now.getMonth() < posted.getMonth() ||
    (now.getMonth() === posted.getMonth() && now.getDate() < posted.getDate())
  ) {
    years -= 1;
  }
  return plural(Math.max(1, years), "year");
}
