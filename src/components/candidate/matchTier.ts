import type { ApplicationMatch } from "@/types/api";

// Candidate-facing labels for the recruiter ATS tiers (same 80/60/40 bands). "Weak" is
// shown to candidates as "Low".
const TIERS: Record<ApplicationMatch["tier"], { label: string; text: string; chip: string; bar: string }> = {
  excellent: {
    label: "Excellent",
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
    bar: "bg-emerald-500",
  },
  good: {
    label: "Good",
    text: "text-blue-600 dark:text-blue-400",
    chip: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    bar: "bg-blue-500",
  },
  fair: {
    label: "Fair",
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    bar: "bg-amber-500",
  },
  weak: {
    label: "Low",
    text: "text-red-600 dark:text-red-400",
    chip: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    bar: "bg-red-500",
  },
};

export function matchTierMeta(match: ApplicationMatch) {
  return TIERS[match.tier] ?? TIERS.weak;
}
