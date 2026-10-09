import { useEffect, useRef, useState } from "react";
import { isRealLogo } from "@/lib/organizationSchema";

/**
 * Decide whether a company logo can be shown, falling back when it can't.
 *
 * Returns `logoUrl` (null when the fallback should render), a ref for the <img>, and an
 * error handler. A logo is skipped when it's a seeded placeholder (via.placeholder.com
 * URLs never load) or when it fails to load.
 *
 * Two details:
 * - The failed URL is remembered rather than a plain "failed" flag, so a view that swaps to
 *   a different company without remounting doesn't keep showing the fallback.
 * - If the image failed before React attached its onError handler (an image in
 *   server-rendered HTML can error before hydration), the event is lost. The mount check
 *   catches that case by reading the image's own load state.
 */
export function useLogoFallback(url?: string | null) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const logoUrl = isRealLogo(url) && failedUrl !== url ? url : null;

  useEffect(() => {
    const img = imgRef.current;
    if (logoUrl && img && img.complete && img.naturalWidth === 0) {
      setFailedUrl(logoUrl);
    }
  }, [logoUrl]);

  return {
    logoUrl,
    imgRef,
    onLogoError: () => setFailedUrl(url ?? null),
  };
}
