/**
 * Pure motion math for the neon floor. Kept out of the client component so the
 * scroll behaviour can be tested without a browser.
 *
 * `base` and `max` are pixels per 60 fps frame; scroll velocity arrives as
 * pixels per millisecond. The floor always travels toward the viewer, so the
 * sign of the scroll is ignored.
 */
export const GRID_MOTION = {
  line: 72,
  base: 0.8,
  gain: 0.18,
  max: 26,
  decay: 0.88,
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Scroll delta per millisecond, clamped so a stalled tab cannot spike it. */
export function scrollVelocity(
  previousY: number,
  currentY: number,
  dtMs: number,
): number {
  if (![previousY, currentY, dtMs].every(Number.isFinite) || dtMs <= 0) {
    return 0;
  }
  return (currentY - previousY) / Math.min(dtMs, 64);
}

/** Idle drift plus a scroll boost, capped so fast flicks stay legible. */
export function gridSpeed(velocity: number): number {
  if (!Number.isFinite(velocity)) return GRID_MOTION.base;
  return GRID_MOTION.base + Math.min(Math.abs(velocity) * GRID_MOTION.gain, GRID_MOTION.max);
}

/**
 * Advance one frame. Offset wraps inside one grid cell so the value never grows
 * without bound; velocity decays toward the idle drift.
 */
export function advanceGrid({
  offset,
  velocity,
  dtMs,
}: {
  offset: number;
  velocity: number;
  dtMs: number;
}): { offset: number; velocity: number } {
  const dt = Number.isFinite(dtMs) ? clamp(dtMs, 0, 64) : 0;
  const frames = dt / (1000 / 60);
  const line = GRID_MOTION.line;
  const start = Number.isFinite(offset) ? offset : 0;
  const next = (start + gridSpeed(velocity) * frames) % line;

  return {
    offset: next < 0 ? next + line : next,
    velocity:
      (Number.isFinite(velocity) ? velocity : 0) *
      Math.pow(GRID_MOTION.decay, frames),
  };
}
