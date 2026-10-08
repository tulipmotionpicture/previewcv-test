"use client";

import { useEffect, useState } from "react";
import {
  formatPostedAbsolute,
  formatPostedAgo,
  parseApiDate,
} from "@/lib/postedDate";

interface PostedAgoProps {
  /** Raw timestamp from the API, e.g. job.posted_date. */
  date?: string | null;
  /** Text before the date. */
  prefix?: string;
  className?: string;
}

/**
 * "Posted 3 days ago", computed in the browser.
 *
 * The server — and the first browser render, so the two agree — output the exact date
 * ("Posted Oct 7, 2026"); the relative wording replaces it once mounted. That keeps the
 * text correct on cached pages and keeps a real, crawlable date in the HTML. The date is
 * also machine-readable in <time dateTime>, and hovering shows it in full.
 */
export default function PostedAgo({
  date,
  prefix = "Posted",
  className,
}: PostedAgoProps) {
  const posted = parseApiDate(date);
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    if (posted) setRelative(formatPostedAgo(posted));
    // Keyed on the raw string: `posted` is a fresh Date object on every render.
  }, [date]);

  if (!posted) return null;

  const absolute = formatPostedAbsolute(posted);

  return (
    <time
      dateTime={posted.toISOString()}
      title={`Posted ${absolute}`}
      className={className}
    >
      {prefix ? `${prefix} ` : ""}
      {relative ?? absolute}
    </time>
  );
}
