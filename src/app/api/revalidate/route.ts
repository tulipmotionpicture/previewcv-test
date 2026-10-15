import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// On-demand ISR refresh, called by the backend after a change is committed (job created,
// edited, approved, deactivated or expired; company profile, logo or gallery updated), so
// those pages show the change at once instead of after their revalidate window.
//
//   POST /api/revalidate
//   x-revalidate-secret: <PREVIEWCV_REVALIDATE_SECRET>
//   { "jobs": ["<job slug>", ...], "recruiters": ["<username>", ...], "listings": true }
//
// "listings" also refreshes the pages that list jobs (the homepage and /jobs/<category>).
// Needs the NEXT_TAG_CACHE_D1 binding (open-next.config.ts tagCache); without it
// revalidatePath is a no-op and the pages refresh on their timer only.

export const dynamic = "force-dynamic";

const MAX_PATHS = 1000;
// Job slugs and usernames are lowercase letters, digits, "-" and "_".
const SEGMENT = /^[a-z0-9][a-z0-9_-]{0,299}$/;

function secretMatches(given: string, expected: string): boolean {
  // Constant-time comparison so the secret can't be guessed from response timing.
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function segments(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim().toLowerCase())
        .filter((v) => SEGMENT.test(v)),
    ),
  ];
}

export async function POST(request: NextRequest) {
  const expected = process.env.PREVIEWCV_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 });
  }
  if (!secretMatches(request.headers.get("x-revalidate-secret") ?? "", expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { jobs?: unknown; recruiters?: unknown; listings?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paths = [
    ...segments(body.jobs).map((slug) => `/job/${slug}`),
    ...segments(body.recruiters).map((username) => `/recruiter/${username}`),
  ];
  if (paths.length > MAX_PATHS) {
    return NextResponse.json({ error: `At most ${MAX_PATHS} pages per request` }, { status: 400 });
  }

  for (const path of paths) revalidatePath(path);
  if (body.listings === true) {
    revalidatePath("/");
    revalidatePath("/jobs/[slug]", "page");
  }

  return NextResponse.json({ revalidated: paths.length, listings: body.listings === true });
}
