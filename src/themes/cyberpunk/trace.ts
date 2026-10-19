/**
 * Deterministic telemetry for the Cyberpunk theme: the drifting scan offset,
 * the signal-strength bars in the related list, and the frame counter in the
 * HUD. Pure functions so they can be checked without a browser.
 */
export const TRACE = {
  line: 96,
  base: 0.35,
  gain: 0.12,
  max: 12,
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Advance the drifting trace by one frame. `velocity` is scroll velocity in
 * pixels per millisecond; the offset wraps inside one scan cell so the value
 * never grows without bound.
 */
export function advanceTrace({
  offset,
  dtMs,
  velocity = 0,
}: {
  offset: number;
  dtMs: number;
  velocity?: number;
}): number {
  const dt = Number.isFinite(dtMs) ? clamp(dtMs, 0, 64) : 0;
  const frames = dt / (1000 / 60);
  const start = Number.isFinite(offset) ? offset : 0;
  const speed = Number.isFinite(velocity) ? Math.abs(velocity) : 0;
  const next =
    start + (TRACE.base + Math.min(speed * TRACE.gain, TRACE.max)) * frames;
  const wrapped = next % TRACE.line;
  return wrapped < 0 ? wrapped + TRACE.line : wrapped;
}

/** 32-bit FNV-1a, so a slug always produces the same bars on server and client. */
function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

/**
 * Five bars of receiver strength, 1–4 each. Deterministic by slug: the same
 * project keeps the same fingerprint every render.
 */
export function signalStrength(slug: string, bars = 5): number[] {
  const seed = hash(slug || "unknown");
  return Array.from({ length: bars }, (_, index) => {
    const shifted = (seed >>> (index * 3)) % 4;
    return 1 + shifted;
  });
}

/** Scroll progress (0–1) as the four-digit frame counter shown in the HUD. */
export function frameCode(progress: number): string {
  const safe = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
  return String(Math.round(safe * 9999)).padStart(4, "0");
}
