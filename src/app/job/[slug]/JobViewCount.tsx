"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/**
 * Live job view count — rendered client-side on purpose:
 *  - The number is always fresh, independent of the page's ISR cache.
 *  - The POST that registers the view carries the REAL visitor IP, so the
 *    backend's per-IP / 30-min gate dedupes per real person (a server-side call
 *    would carry the Cloudflare Worker IP and collapse every visitor into one).
 *
 * MUST stay client-only. Seeded with the SSR value so there's no flicker/gap.
 */
export default function JobViewCount({
  jobId,
  initial,
}: {
  jobId: number;
  initial: number;
}) {
  const [count, setCount] = useState(initial);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return; // once per mount (guards re-render / StrictMode)
    fired.current = true;

    api
      .registerJobView(jobId)
      .then((res) => {
        if (typeof res?.view_count === "number") setCount(res.view_count);
      })
      .catch(() => {
        /* keep the SSR value on failure */
      });
  }, [jobId]);

  return <>{count} views</>;
}
