// Recruiter profile username (the public page link previewcv.com/recruiter/<username>):
// suggestion from the company or person name, clean-up while typing, and the checks that
// can run instantly. Mirrors the backend rules (letters, digits, "-" and "_", 3+ chars,
// reserved names, stored lowercase); the backend still has the final say on availability.

export const USERNAME_MIN = 3;
// The backend allows 100; kept shorter so the public link stays readable.
export const USERNAME_MAX = 50;

// Same list as the backend (recruiter_auth_service.RESERVED_USERNAMES).
const RESERVED = new Set([
  "admin", "administrator", "api", "auth", "contact", "dashboard",
  "help", "jobs", "login", "logout", "me", "oauth", "profile",
  "recruiter", "recruiters", "register", "root", "settings",
  "signin", "signup", "support", "system", "user", "users",
]);

// Legal-form endings dropped from a company name before suggesting a username
// ("Acme Technologies Pvt Ltd" -> "acme-technologies"). Only stripped at the end.
const LEGAL_SUFFIX =
  /[\s,.-]+(private\s+limited|pvt\.?\s*ltd\.?|pvt\.?|ltd\.?|limited|l\.?l\.?c\.?|l\.?l\.?p\.?|inc\.?|incorporated|corp\.?|corporation|plc|gmbh|fz-?llc|fzco|fze|fzc)\s*$/i;

function stripLegalSuffix(name: string): string {
  let out = name.trim();
  // Repeat for stacked forms ("Acme Corp Inc.")
  for (let i = 0; i < 3; i++) {
    const next = out.replace(LEGAL_SUFFIX, "").trim();
    if (next === out || !next) break;
    out = next;
  }
  return out;
}

/** Turn any text into a valid username: lowercase, a-z 0-9 "-" "_", no leading,
 *  trailing or doubled separators, at most USERNAME_MAX characters. */
export function toUsername(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // accents: "Café" -> "Cafe"
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9_-]+/g, "-") // spaces, dots and anything else become "-"
    .replace(/[-_]{2,}/g, (m) => m[0])
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, USERNAME_MAX)
    .replace(/[-_]+$/g, "");
}

export function suggestUsername(recruiterType: "company" | "individual", companyName: string, fullName: string): string {
  return recruiterType === "company" ? toUsername(stripLegalSuffix(companyName)) : toUsername(fullName);
}

/** Clean-up applied as the recruiter types: like toUsername, but a trailing "-" or "_"
 *  is kept so "acme-" can still become "acme-tech". */
export function cleanUsernameInput(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/[-_]{2,}/g, (m) => m[0])
    .replace(/^[-_]+/g, "")
    .slice(0, USERNAME_MAX);
}

/** A problem that can be reported without asking the server; null if none. */
export function usernameProblem(username: string): string | null {
  if (!username) return null;
  if (username.length < USERNAME_MIN) return `Use at least ${USERNAME_MIN} characters.`;
  if (RESERVED.has(username)) return "This name is reserved. Please choose another.";
  return null;
}

/** Whether the username visibly relates to the company name (shares a word of 3+ letters
 *  with it), for the "use your company name" tip. */
export function looksLikeCompany(username: string, companyName: string): boolean {
  const words = toUsername(stripLegalSuffix(companyName)).split(/[-_]/).filter((w) => w.length >= 3);
  if (!words.length) return true;
  return words.some((w) => username.includes(w));
}

/** Alternatives to offer when the suggested username is taken. */
export function usernameAlternatives(base: string, city: string): string[] {
  const root = base.replace(/[-_]+$/g, "");
  const citySlug = toUsername(city);
  const candidates = [
    citySlug ? `${root}-${citySlug}` : "",
    `${root}-careers`,
    `${root}-hiring`,
    `${root}-hr`,
  ];
  return [...new Set(candidates.filter((c) => c && c.length <= USERNAME_MAX && c !== base))];
}
