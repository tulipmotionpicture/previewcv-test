// Shared salary / currency formatting.
//
// Everything is driven through the platform `Intl` APIs so that symbols and
// names are correct for every ISO 4217 currency — nothing is hardcoded and a
// wrong/misleading symbol can never be shown. Unknown codes fall back safely to
// the bare code (e.g. "XTS 1,234").

// Full ISO 4217 active currency code list.
export const CURRENCY_CODES: string[] = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS",
  "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR",
  "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD",
  "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU",
  "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK",
  "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG",
  "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK",
  "SGD", "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL",
  "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH",
  "UGX", "USD", "UYU", "UZS", "VED", "VES", "VND", "VUV", "WST", "XAF",
  "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL",
];

const currencyNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

/** Human-readable name for a currency code, e.g. "US Dollar". Falls back to the code. */
export function currencyName(code: string): string {
  try {
    return currencyNames?.of(code) || code;
  } catch {
    return code;
  }
}

/** Options for a currency `<select>`: `{ value: "USD", label: "USD — US Dollar" }`. */
export function getCurrencyOptions(): { value: string; label: string }[] {
  return CURRENCY_CODES.map((code) => ({
    value: code,
    label: `${code} — ${currencyName(code)}`,
  }));
}

// A couple of currencies read more naturally in their local grouping.
function localeFor(currency: string): string {
  return currency?.toUpperCase() === "INR" ? "en-IN" : "en-US";
}

/** Format a single amount in the given currency, e.g. "₹10,00,000". Safe for unknown codes. */
export function formatAmount(amount: number, currency?: string | null): string {
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(localeFor(code), {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Invalid/unsupported currency code — never show a misleading symbol.
    return `${code} ${amount.toLocaleString("en-US")}`;
  }
}

const PERIOD_SUFFIX: Record<string, string> = {
  hourly: "/hr",
  weekly: "/wk",
  monthly: "/mo",
  yearly: "/yr",
};

/** Compact pay-period suffix, e.g. "/yr". Empty string when the type is unknown/absent. */
export function salaryPeriodSuffix(type?: string | null): string {
  if (!type) return "";
  return PERIOD_SUFFIX[type.toLowerCase()] || "";
}

export interface SalaryFields {
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_type?: string | null;
}

export interface FormatSalaryOptions {
  withPeriod?: boolean;
  fallback?: string;
}

/**
 * Format a job's salary for display, e.g. "₹10,00,000 – ₹18,00,000 /yr".
 * Handles ranges, single-bound (From/Up to), and missing values (fallback).
 */
export function formatSalaryRange(
  job: SalaryFields,
  opts: FormatSalaryOptions = {},
): string {
  const { withPeriod = true, fallback = "Competitive Salary" } = opts;
  const { salary_min, salary_max, salary_currency, salary_type } = job;
  const suffix = withPeriod ? salaryPeriodSuffix(salary_type) : "";
  const tail = suffix ? ` ${suffix}` : "";

  if (salary_min != null && salary_max != null) {
    return `${formatAmount(salary_min, salary_currency)} – ${formatAmount(salary_max, salary_currency)}${tail}`;
  }
  if (salary_min != null) {
    return `From ${formatAmount(salary_min, salary_currency)}${tail}`;
  }
  if (salary_max != null) {
    return `Up to ${formatAmount(salary_max, salary_currency)}${tail}`;
  }
  return fallback;
}
