import { describe, expect, it } from "vitest";
import {
  GRID_MOTION,
  advanceGrid,
  gridSpeed,
  scrollVelocity,
} from "@/themes/synthwave/motion";
import { synthwaveTokens } from "@/themes/synthwave/tokens";

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const r = channel(Number.parseInt(value.slice(0, 2), 16));
  const g = channel(Number.parseInt(value.slice(2, 4), 16));
  const b = channel(Number.parseInt(value.slice(4, 6), 16));
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function contrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("synthwave palette", () => {
  it("keeps body copy, muted copy and accent text above 4.5:1", () => {
    const { background, accent, accentText, muted, text } = synthwaveTokens;

    expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accent, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accentText, accent)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("synthwave grid motion", () => {
  it("idles forward with no scroll", () => {
    expect(gridSpeed(0)).toBe(GRID_MOTION.base);
  });

  it("accelerates with scroll speed and clamps the boost", () => {
    expect(gridSpeed(1)).toBeGreaterThan(gridSpeed(0.2));
    expect(gridSpeed(10_000)).toBe(GRID_MOTION.base + GRID_MOTION.max);
  });

  it("moves the floor in one direction whatever the scroll sign", () => {
    expect(gridSpeed(-2)).toBeCloseTo(gridSpeed(2));
  });

  it("wraps the offset inside one grid cell", () => {
    const step = advanceGrid({
      offset: GRID_MOTION.line - 0.1,
      velocity: 0,
      dtMs: 1000 / 60,
    });

    expect(step.offset).toBeGreaterThanOrEqual(0);
    expect(step.offset).toBeLessThan(GRID_MOTION.line);
  });

  it("decays velocity back toward the idle drift", () => {
    const step = advanceGrid({ offset: 0, velocity: 4, dtMs: 1000 / 60 });

    expect(step.velocity).toBeLessThan(4);
    expect(step.velocity).toBeGreaterThan(0);
  });

  it("turns a scroll delta into velocity", () => {
    expect(scrollVelocity(100, 200, 50)).toBeCloseTo(2);
    expect(scrollVelocity(100, 200, 0)).toBe(0);
    expect(scrollVelocity(Number.NaN, 200, 16)).toBe(0);
  });

  it("survives missing numbers without producing NaN", () => {
    const step = advanceGrid({
      offset: Number.NaN,
      velocity: Number.NaN,
      dtMs: Number.NaN,
    });

    expect(Number.isFinite(step.offset)).toBe(true);
    expect(Number.isFinite(step.velocity)).toBe(true);
  });
});
