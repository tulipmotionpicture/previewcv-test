"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Users } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Live applicant and view counts — refreshed client-side on purpose:
 *  - The page's server-rendered counts come from its cached (ISR) render, so they can be
 *    minutes old; these are always fresh, like the counts on the /jobs cards.
 *  - The POST that registers the view carries the REAL visitor IP, so the
 *    backend's per-IP / 30-min gate dedupes per real person (a server-side call
 *    would carry the Cloudflare Worker IP and collapse every visitor into one).
 *
 * MUST stay client-only. Seeded with the SSR values, so the server-rendered HTML still
 * contains both counts and there's no flicker/gap.
 */
export default function JobLiveStats({
  jobId,
  initialApplicants,
  initialViews,
}: {
  jobId: number;
  initialApplicants: number;
  initialViews: number;
}) {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [views, setViews] = useState(initialViews);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return; // once per mount (guards re-render / StrictMode)
    fired.current = true;

    api
      .registerJobView(jobId)
      .then((res) => {
        if (typeof res?.view_count === "number") setViews(res.view_count);
        if (typeof res?.application_count === "number") setApplicants(res.application_count);
      })
      .catch(() => {
        /* keep the SSR values on failure */
      });
  }, [jobId]);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        {applicants} applicants
      </div>
      <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
      <div className="flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5" />
        {views} views
      </div>
    </>
  );
}
