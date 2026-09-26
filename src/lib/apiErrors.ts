/**
 * True only when the backend answered 404, i.e. the resource really does not exist.
 *
 * Pages must not treat every failed fetch as "not found": a timeout or 5xx that falls
 * through to notFound() renders Next's not-found page, which carries
 * <meta name="robots" content="noindex">, and ISR then caches that render. Google
 * reported live job and blog pages as "Excluded by 'noindex' tag" this way. Callers
 * return null for a real 404 and rethrow anything else, so a transient failure yields
 * a 5xx (never cached, retried by Google) or keeps serving the last good ISR copy.
 */
export function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { status?: unknown }).status === 404
  );
}
