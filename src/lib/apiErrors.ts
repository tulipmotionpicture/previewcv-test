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

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * The message to show a user for a failed API call.
 *
 * A 4xx answer carries our own validation message ("File too large", "Passwords do not
 * match"), which is worth showing. Anything else (5xx, network failures, 429) may carry
 * an upstream service's raw error, e.g. the AI provider's "429 Your prepayment credits are
 * depleted. Please go to AI Studio...", which must never reach users, so it becomes the
 * generic message. The backend already returns neutral text for AI failures; this is the
 * safety net.
 */
export function userFacingErrorMessage(
  error: unknown,
  fallback: string = GENERIC_ERROR_MESSAGE,
): string {
  if (typeof error !== "object" || error === null) return fallback;
  const { status, message } = error as { status?: unknown; message?: unknown };
  if (
    typeof status === "number" &&
    status >= 400 &&
    status < 500 &&
    status !== 429 &&
    typeof message === "string" &&
    message.trim()
  ) {
    return message;
  }
  return fallback;
}
