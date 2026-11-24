// Catches salaries that were almost certainly typed in the wrong unit or pay period, e.g.
// "30" to "40" a year meaning 30-40 lakhs. These are live on job pages and in Google Jobs
// as typed. It only warns: the recruiter decides.

import { formatSalaryRange } from "./salary";

export type SalaryType = "hourly" | "weekly" | "monthly" | "yearly";

export interface SalaryInput {
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  salary_type: SalaryType;
}

export interface SalaryWarning {
  message: string;
  /** The salary the recruiter probably meant, when that is clear. */
  suggestion?: SalaryInput;
}

function scaled(input: SalaryInput, factor: number): SalaryInput {
  return {
    ...input,
    salary_min: Math.round(input.salary_min * factor),
    salary_max: Math.round(input.salary_max * factor),
  };
}

function suggestedSalary(input: SalaryInput): SalaryInput | null | undefined {
  const { salary_max: max, salary_currency: currency, salary_type: type } = input;

  if (currency.toUpperCase() === "INR") {
    if (type === "yearly") {
      if (max <= 100) return scaled(input, 100000); // lakhs
      if (max < 1000) return scaled(input, 1000); // thousands
      if (max < 60000) return { ...input, salary_type: "monthly" }; // under 5,000 a month
    }
    if (type === "monthly") {
      if (max >= 10 && max <= 100) return scaled(input, 1000); // thousands
      if (max < 1000) return null;
      if (max >= 1000000) return { ...input, salary_type: "yearly" };
    }
    if (type === "weekly" && max < 100) return null;
    if (type === "hourly" && max > 10000) return null;
    return undefined;
  }

  // Other currencies vary too much to judge high amounts, so only clearly low ones.
  if (type === "yearly" && max < 1000) return scaled(input, 1000);
  if (type === "monthly" && max < 50) return null;
  return undefined;
}

/** A warning for an unlikely salary, or null when it looks fine or isn't complete yet. */
export function checkSalary(fields: {
  salary_min: string | number | null | undefined;
  salary_max: string | number | null | undefined;
  salary_currency: string;
  salary_type: string;
}): SalaryWarning | null {
  const min = Number(fields.salary_min);
  const max = Number(fields.salary_max);
  // Nothing to judge until both are in (so it doesn't flash up mid-typing).
  if (!(min > 0) || !(max >= min)) return null;

  const input: SalaryInput = {
    salary_min: min,
    salary_max: max,
    salary_currency: fields.salary_currency,
    salary_type: fields.salary_type as SalaryType,
  };
  // Displayed amounts are rounded, so decimals ("3.5" lakhs) aren't echoed back as "₹4".
  const entered =
    Number.isInteger(min) && Number.isInteger(max) ? formatSalaryRange(input) : "This salary";

  const suggestion = suggestedSalary(input);
  if (suggestion) {
    return {
      message: `${entered} looks wrong. Did you mean ${formatSalaryRange(suggestion)}?`,
      suggestion,
    };
  }
  if (suggestion === null) {
    return { message: `${entered} looks wrong. Please check the amounts and pay period.` };
  }
  if (max >= min * 10) {
    return {
      message: `${entered} is a very wide range. Please check for a missing or extra zero.`,
    };
  }
  return null;
}

// An amount of money in text: "₹30,000", "Rs. 4.5 LPA", "AED 2500", "30k per month", "5 lakhs".
const AMOUNT_IN_TEXT =
  /(?:₹|\$|€|£|\b(?:rs\.?|inr|usd|aed|eur|gbp|sar|qar|cad|aud|sgd)\s?)\s?\d|\d(?:[\d,.]*)\s?(?:k\b|lakhs?\b|lacs?\b|lpa\b|crores?\b)|\d[\d,.]*\s?(?:\/|per\s|a\s)\s?(?:month|annum|year|hour|week)\b/i;

/** Whether rich text (HTML) seems to state an amount of money, so a recruiter hiding the
 *  salary can be told it is still readable there (by candidates and by Google). */
export function mentionsAmount(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  return AMOUNT_IN_TEXT.test(text);
}
