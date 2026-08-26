// Shared presentation helpers for plan pricing.
//
// Plans carry a `billing_period` from the API (every plan is currently "monthly"), but the
// pricing cards never showed it, so prices appeared with no indication of what period they
// covered. Driving the label off the field rather than hardcoding "per month" means adding
// an annual plan later needs no change here.

/**
 * Human label for a plan's billing period, e.g. "monthly" -> "per month".
 *
 * Unrecognised values fall through to `per {value}` rather than an empty string, so an
 * unexpected period from the API still renders something truthful instead of a bare price.
 */
export function billingPeriodLabel(billingPeriod?: string | null): string {
  const period = (billingPeriod || "").trim().toLowerCase();
  if (!period) return "";
  switch (period) {
    case "monthly":
    case "month":
      return "per month";
    case "yearly":
    case "annual":
    case "annually":
    case "year":
      return "per year";
    case "weekly":
    case "week":
      return "per week";
    case "quarterly":
      return "per quarter";
    default:
      return `per ${period}`;
  }
}

/** Shown on every paid plan card so the listed price is not mistaken for the final amount. */
export const TAX_NOTE = "excl. taxes";

/**
 * The line under a price: billing period plus the tax note.
 *
 * Returns an empty string for free plans — "per month · excl. taxes" under a zero price
 * would be noise at best and misleading at worst.
 */
export function priceSubLabel(
  billingPeriod?: string | null,
  isFree = false,
): string {
  if (isFree) return "";
  const period = billingPeriodLabel(billingPeriod);
  return period ? `${period} · ${TAX_NOTE}` : TAX_NOTE;
}
