import { describe, expect, it } from "vitest";
import { Path, Shape } from "three";
import { extrudeShape, geometryBytes } from "./logo-geometry";
import { canAnimateLogo } from "./logo-policy";

describe("logo power policy", () => {
  const capable = { reducedMotion: false, cores: 8, memory: 8, saveData: false, webgl: true };
  it("allows a capable device", () => expect(canAnimateLogo(capable)).toBe(true));
  it.each([
    { reducedMotion: true }, { cores: 4 }, { memory: 2 }, { saveData: true }, { webgl: false },
  ])("retains the poster for %o", override => {
    expect(canAnimateLogo({ ...capable, ...override })).toBe(false);
  });
});

describe("beveled logo geometry", () => {
  it("preserves a real hole and produces finite outward normals", () => {
    const shape = new Shape();
    shape.moveTo(-2, -2); shape.lineTo(2, -2); shape.lineTo(2, 2); shape.lineTo(-2, 2); shape.closePath();
    const hole = new Path();
    hole.moveTo(-.6, -.6); hole.lineTo(-.6, .6); hole.lineTo(.6, .6); hole.lineTo(.6, -.6); hole.closePath();
    shape.holes.push(hole);
    const geometry = extrudeShape(shape);
    const positions = geometry.getAttribute("position");
    const normals = geometry.getAttribute("normal");
    const index = geometry.getIndex();
    expect(positions).toBeDefined();
    expect(positions.count).toBeGreaterThan(24);
    expect(Array.from(normals.array).every(Number.isFinite)).toBe(true);
    let caps = 0;
    for (const group of geometry.groups.filter(g => g.materialIndex === 0)) {
      for (let n = group.start; n < group.start + group.count; n += 3) {
        const a = index ? index.getX(n) : n;
        const b = index ? index.getX(n + 1) : n + 1;
        const c = index ? index.getX(n + 2) : n + 2;
        const x = (positions.getX(a) + positions.getX(b) + positions.getX(c)) / 3;
        const y = (positions.getY(a) + positions.getY(b) + positions.getY(c)) / 3;
        expect(Math.abs(x) < .5 && Math.abs(y) < .5).toBe(false);
        expect(Math.abs(normals.getZ(a))).toBeCloseTo(1);
        caps++;
      }
    }
    expect(caps).toBeGreaterThan(0);
    expect(geometryBytes(geometry)).toBeLessThan(300_000);
    geometry.dispose();
  });
});
