/**
 * Hook to load Google reCAPTCHA v3 once and expose an `execute` function.
 *
 * Site key is read from `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. If the key is
 * missing or the script fails to load, `execute()` returns null (the
 * backend treats a missing token as a soft pass — other defenses still
 * apply, and we'd rather submit without a token than block signup).
 *
 * The reCAPTCHA badge is shown automatically by Google; styling/hiding
 * is handled by Google's script per their TOS.
 *
 * Usage:
 *   const execute = useRecaptcha();
 *   // inside submit handler:
 *   const token = await execute("register");
 *   // ...send token as `recaptcha_token` in the request body.
 */

"use client";

import { useEffect, useRef } from "react";
import { load } from "recaptcha-v3";

// Re-export so callers don't need to import from `recaptcha-v3` directly.
type ReCaptchaInstance = Awaited<ReturnType<typeof load>>;

export function useRecaptcha(): (action: string) => Promise<string | null> {
  const instanceRef = useRef<ReCaptchaInstance | null>(null);
  const loadingRef = useRef<Promise<ReCaptchaInstance | null> | null>(null);

  useEffect(() => {
    // Kick off loading on mount. We don't `await` here — the execute()
    // closure below will await `loadingRef.current` when called.
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      // No key configured -> execute() will always return null.
      // Backend's fail-OPEN behaviour means signup still works.
      console.warn(
        "[anti-bot] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not set; reCAPTCHA disabled."
      );
      return;
    }

    loadingRef.current = load(siteKey)
      .then((inst) => {
        instanceRef.current = inst;
        return inst;
      })
      .catch((err) => {
        // Network failures, script blocked by ad-blocker, etc. We swallow
        // the error so signup isn't gated on Google's availability.
        console.warn("[anti-bot] reCAPTCHA failed to load:", err);
        return null;
      });
  }, []);

  return async (action: string): Promise<string | null> => {
    try {
      // If load is still in flight, wait for it.
      const inst = instanceRef.current ?? (await loadingRef.current);
      if (!inst) return null;
      return await inst.execute(action);
    } catch (err) {
      console.warn("[anti-bot] reCAPTCHA execute failed:", err);
      return null;
    }
  };
}
