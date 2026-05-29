/**
 * Honeypot field component.
 *
 * Renders an input that is:
 *   - Visually hidden via inline styles (off-screen, zero size, opacity 0).
 *   - Removed from tab order (`tabIndex={-1}`).
 *   - Hidden from assistive tech (`aria-hidden`, `autoComplete="off"`).
 *   - Named `company_url` — plausible enough that naive form-fillers will
 *     happily populate it. The backend treats any non-empty value as a bot.
 *
 * Real users never see or touch this field. Bots that blindly fill every
 * input get silently routed to a decoy success response (see backend
 * `app/utils/anti_bot.py`).
 *
 * Usage:
 *   const [hp, setHp] = useState("");
 *   <Honeypot value={hp} onChange={setHp} />
 *   // ...then send hp as `company_url` in the request body.
 */

"use client";

interface HoneypotProps {
  value: string;
  onChange: (value: string) => void;
}

// Inline styles (instead of a CSS class) so the field stays hidden even
// if the host page hasn't loaded its stylesheet yet, and so we don't
// depend on any utility framework being available.
const HIDDEN_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

export function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div aria-hidden="true" style={HIDDEN_STYLE}>
      <label htmlFor="company_url">
        Company website (leave empty)
      </label>
      <input
        id="company_url"
        name="company_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
