import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { revalidateProject } from "@/lib/projects/revalidate";

describe("revalidateProject", () => {
  beforeEach(() => {
    mocks.revalidatePath.mockClear();
  });

  it("invalidates the landing page, sitemap and project route", () => {
    revalidateProject("moneykick-shop");

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/moneykick-shop");
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(3);
  });

  it("also invalidates the old route after a slug change", () => {
    revalidateProject("new-slug", "old-slug");

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/new-slug");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/old-slug");
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(4);
  });

  it("does not double-invalidate when the slug did not change", () => {
    revalidateProject("same-slug", "same-slug");

    expect(mocks.revalidatePath).toHaveBeenCalledTimes(3);
  });
});
