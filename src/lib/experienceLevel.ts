// Display labels for a job's `experience_level`, matching the options recruiters pick in
// the job form (CreateJob EXPERIENCE_LEVEL_OPTIONS): the level's name and its years.

const LEVELS: Record<string, { label: string; years?: string }> = {
  entry: { label: "Entry Level", years: "0-1 yrs" },
  junior: { label: "Junior", years: "1-3 yrs" },
  mid: { label: "Mid Level", years: "3-5 yrs" },
  senior: { label: "Senior", years: "5-10 yrs" },
  lead: { label: "Lead", years: "10+ yrs" },
  director: { label: "Director" },
  executive: { label: "Executive" },
};

/** "Junior", "Mid Level", … ; an unknown value is title-cased; null when there is none. */
export function experienceLevelLabel(level?: string | null): string | null {
  const key = (level || "").trim().toLowerCase();
  if (!key) return null;
  return (
    LEVELS[key]?.label ??
    key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** "1-3 yrs" for levels that have a years range; null otherwise. */
export function experienceYears(level?: string | null): string | null {
  return LEVELS[(level || "").trim().toLowerCase()]?.years ?? null;
}
