import { describe, expect, it } from "vitest";
import { computeReorder } from "@/lib/projects/order";

const ids = ["a", "b", "c"];

describe("computeReorder", () => {
  it("moves an item up", () => {
    expect(computeReorder(ids, "b", "up")).toEqual(["b", "a", "c"]);
  });

  it("moves an item down", () => {
    expect(computeReorder(ids, "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("is a no-op at the edges", () => {
    expect(computeReorder(ids, "a", "up")).toEqual(ids);
    expect(computeReorder(ids, "c", "down")).toEqual(ids);
  });

  it("is a no-op for unknown ids", () => {
    expect(computeReorder(ids, "missing", "up")).toEqual(ids);
  });

  it("does not mutate the input", () => {
    const input = [...ids];
    computeReorder(input, "a", "down");
    expect(input).toEqual(ids);
  });
});
