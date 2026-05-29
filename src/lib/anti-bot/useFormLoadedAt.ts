/**
 * Hook to capture the epoch-seconds timestamp when a form mounts.
 *
 * The backend uses this to detect sub-2-second submissions (a strong
 * bot signal). The timestamp is captured once on mount and stays stable
 * for the lifetime of the component.
 *
 * The value is in SECONDS (not ms) to match the backend's `time.time()`
 * convention.
 *
 * Usage:
 *   const formLoadedAt = useFormLoadedAt();
 *   // ...send formLoadedAt as `form_loaded_at` in the request body.
 */

"use client";

import { useRef } from "react";

export function useFormLoadedAt(): number {
  // useRef instead of useState so we don't trigger a re-render and so
  // the value is captured synchronously during the initial render.
  const ref = useRef<number>(Date.now() / 1000);
  return ref.current;
}
