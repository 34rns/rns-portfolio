import { describe, expect, it } from "vitest";
import { cyberpunkTokens } from "@/themes/cyberpunk/tokens";
import {
  TRACE,
  advanceTrace,
  frameCode,
  signalStrength,
} from "@/themes/cyberpunk/trace";

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

describe("cyberpunk palette", () => {
  it("keeps body copy, muted copy and accent text above 4.5:1", () => {
    const { background, accent, accentText, muted, text } = cyberpunkTokens;

    expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accent, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accentText, accent)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("cyberpunk trace", () => {
  it("advances the scan and wraps inside one cell", () => {
    const next = advanceTrace({
      offset: TRACE.line - 0.1,
      dtMs: 1000 / 60,
    });

    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(TRACE.line);
  });

  it("moves faster with scroll velocity", () => {
    const idle = advanceTrace({ offset: 0, dtMs: 16, velocity: 0 });
    const moving = advanceTrace({ offset: 0, dtMs: 16, velocity: 4 });

    expect(moving).toBeGreaterThan(idle);
  });

  it("caps the boost and ignores sign", () => {
    const fast = advanceTrace({ offset: 0, dtMs: 16, velocity: 10_000 });
    const backward = advanceTrace({ offset: 0, dtMs: 16, velocity: -10_000 });

    expect(fast).toBeLessThan(TRACE.line);
    expect(backward).toBeCloseTo(fast);
  });

  it("survives missing numbers without producing NaN", () => {
    const next = advanceTrace({
      offset: Number.NaN,
      dtMs: Number.NaN,
      velocity: Number.NaN,
    });

    expect(Number.isFinite(next)).toBe(true);
    expect(next).toBe(0);
  });
});

describe("cyberpunk signal bars", () => {
  it("is deterministic per slug", () => {
    expect(signalStrength("ghostline-09")).toEqual(
      signalStrength("ghostline-09"),
    );
  });

  it("returns five bars between one and four", () => {
    const bars = signalStrength("ghostline-09");

    expect(bars).toHaveLength(5);
    for (const level of bars) {
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(4);
    }
  });

  it("gives different projects different fingerprints", () => {
    expect(signalStrength("ghostline-09")).not.toEqual(
      signalStrength("rise-hunters-ascent"),
    );
  });
});

describe("cyberpunk frame counter", () => {
  it("formats progress as four digits", () => {
    expect(frameCode(0)).toBe("0000");
    expect(frameCode(0.5)).toBe("5000");
    expect(frameCode(1)).toBe("9999");
  });

  it("clamps bad input", () => {
    expect(frameCode(Number.NaN)).toBe("0000");
    expect(frameCode(-2)).toBe("0000");
    expect(frameCode(8)).toBe("9999");
  });
});
