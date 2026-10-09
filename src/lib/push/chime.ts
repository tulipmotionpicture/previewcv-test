// A short two-note chime for new notifications, synthesised with the Web Audio API
// (no audio file to download or license).
//
// Browsers only allow sound after the user has interacted with the page, so the audio
// context is created/resumed on the first pointer or key press; until then playChime()
// is silently skipped.

const SOUND_PREF_KEY = "notification_sound";

let context: AudioContext | null = null;
let unlockListening = false;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  return context;
}

/** Create/resume the audio context on the first interaction, as browsers require. */
export function unlockChimeOnInteraction(): void {
  if (unlockListening || typeof window === "undefined") return;
  unlockListening = true;
  const unlock = () => {
    const ctx = audioContext();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export function isChimeEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setChimeEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(SOUND_PREF_KEY);
    else localStorage.setItem(SOUND_PREF_KEY, "off");
  } catch {
    /* preference just won't persist */
  }
}

/** Two soft rising notes (~0.4s). No-op when muted or before the page was interacted with. */
export function playChime(): void {
  if (!isChimeEnabled()) return;
  const ctx = audioContext();
  if (!ctx || ctx.state !== "running") return;

  const start = ctx.currentTime;
  [
    { freq: 784, at: 0 }, // G5
    { freq: 1047, at: 0.12 }, // C6
  ].forEach(({ freq, at }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start + at);
    gain.gain.exponentialRampToValueAtTime(0.18, start + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + at + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + at);
    osc.stop(start + at + 0.3);
  });
}
