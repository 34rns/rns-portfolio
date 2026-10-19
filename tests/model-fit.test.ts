import { describe, expect, it } from "vitest";
import {
  MODEL_HEIGHT_FRACTION,
  fitModelToStage,
  stageVisibleHeight,
} from "@/components/model-stage/fit";

const targetHeight = stageVisibleHeight() * MODEL_HEIGHT_FRACTION;

describe("fitModelToStage", () => {
  it("normalizes a tiny model exported in centimetres", () => {
    const fit = fitModelToStage({
      size: [0.8, 1, 0.6],
      center: [120, -45, 3],
    });

    expect(fit.scale * 1).toBeCloseTo(targetHeight, 6);
    expect(fit.centerOffset).toEqual([-120, 45, -3]);

    // The scaled model's center must land on the orbit target.
    const worldCenter = fit.centerOffset.map((value) => value * fit.scale);
    const scaledModelCenter = [120, -45, 3].map((value) => value * fit.scale);
    worldCenter.forEach((value, index) => {
      expect(value + scaledModelCenter[index]).toBeCloseTo(0, 6);
    });
  });

  it("normalizes a huge model exported in millimetres", () => {
    const fit = fitModelToStage({
      size: [12000, 9000, 8000],
      center: [5000, -2000, 750],
    });

    expect(fit.scale * 9000).toBeCloseTo(targetHeight, 6);
    expect(fit.scale).toBeLessThan(0.001);
  });

  it("gives both extremes the same on-screen height", () => {
    const tiny = fitModelToStage({ size: [0.01, 0.01, 0.01], center: [0, 0, 0] });
    const huge = fitModelToStage({ size: [1000, 1000, 1000], center: [0, 0, 0] });

    expect(tiny.scale * 0.01).toBeCloseTo(huge.scale * 1000, 6);
  });

  it("uses the longest footprint for a flat model", () => {
    const fit = fitModelToStage({
      size: [4, 0, 2],
      center: [0, 0, 0],
    });

    expect(fit.scale * 4).toBeCloseTo(targetHeight, 6);
  });

  it("leaves an empty or invalid box alone", () => {
    expect(fitModelToStage({ size: [0, 0, 0], center: [0, 0, 0] })).toEqual({
      scale: 1,
      centerOffset: [0, 0, 0],
    });
    expect(
      fitModelToStage({ size: [Number.NaN, 1, 1], center: [0, 0, 0] }),
    ).toEqual({ scale: 1, centerOffset: [0, 0, 0] });
  });

  it("honours a custom height fraction for tests and previews", () => {
    const fit = fitModelToStage(
      { size: [1, 2, 1], center: [0, 0, 0] },
      { heightFraction: 0.5, visibleHeight: 4 },
    );

    expect(fit.scale * 2).toBeCloseTo(2, 6);
  });
});
