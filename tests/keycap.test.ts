import { describe, expect, it } from "vitest";
import {
  banglishRows,
  galleryShots,
  languagePlates,
  proofPoints,
  themeShots,
  tickerItems,
} from "@/themes/keycap/specimen";
import { keycapTokens } from "@/themes/keycap/tokens";

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

describe("keycap palette", () => {
  it("keeps body, muted and accent copy above 4.5:1", () => {
    const { background, accent, accentText, muted, text } = keycapTokens;

    expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accent, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accentText, accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("uses a warm paper ground rather than plain white", () => {
    expect(keycapTokens.background).toBe("#F4EFE2");
    expect(keycapTokens.accent).toBe("#B5341F");
  });
});

describe("keycap specimen", () => {
  it("gives the three language decks one plate each", () => {
    expect(languagePlates.map((plate) => plate.name)).toEqual([
      "Bangla",
      "Banglish",
      "English",
    ]);

    for (const plate of languagePlates) {
      expect(plate.src).toMatch(/^\/projects\/shobdo\//);
      expect(plate.caption.length).toBeGreaterThan(0);
      expect(plate.note.length).toBeGreaterThan(40);
    }
  });

  it("lists all thirteen themes exactly once", () => {
    expect(themeShots).toHaveLength(13);
    expect(new Set(themeShots.map((shot) => shot.name)).size).toBe(13);
    expect(new Set(themeShots.map((shot) => shot.src)).size).toBe(13);

    for (const shot of themeShots) {
      expect(shot.src).toMatch(/^\/projects\/shobdo\/themes\/t-.+\.png$/);
    }
  });

  it("demonstrates the Banglish mapping the README promises", () => {
    const byRoman = new Map(banglishRows.map((row) => [row.roman, row.bangla]));

    expect(byRoman.get("ami")).toBe("আমি");
    expect(byRoman.get("tumi")).toBe("তুমি");
    expect(byRoman.get("desh")).toBe("দেশ");
    expect(byRoman.get("pr")).toBe("প্র");
    expect(byRoman.get("123")).toBe("১২৩");
  });

  it("has a caption and aspect ratio for every gallery shot", () => {
    expect(galleryShots.length).toBeGreaterThanOrEqual(5);
    expect(new Set(galleryShots.map((shot) => shot.src)).size).toBe(
      galleryShots.length,
    );

    for (const shot of galleryShots) {
      expect(shot.src).toMatch(/^\/projects\/shobdo\//);
      expect(shot.caption.length).toBeGreaterThan(20);
      expect(shot.ratio).toMatch(/^\d+ \/ \d+$/);
    }
  });

  it("keeps the proof panel and ticker factual and non-empty", () => {
    expect(proofPoints.map((point) => point.value)).toEqual(["13", "98", "3.99", "0"]);
    expect(tickerItems.length).toBeGreaterThanOrEqual(5);
    for (const item of tickerItems) expect(item.length).toBeGreaterThan(0);
  });
});
