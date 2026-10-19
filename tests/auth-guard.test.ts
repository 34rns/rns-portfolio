import { describe, expect, it } from "vitest";
import { isAuthorized } from "@/lib/auth/guard";

describe("isAuthorized", () => {
  it("lets guests reach the login page", () => {
    expect(isAuthorized({ pathname: "/admin/login", isLoggedIn: false })).toBe(true);
  });

  it("blocks guests from the admin dashboard and nested pages", () => {
    expect(isAuthorized({ pathname: "/admin", isLoggedIn: false })).toBe(false);
    expect(isAuthorized({ pathname: "/admin/projects", isLoggedIn: false })).toBe(false);
    expect(isAuthorized({ pathname: "/admin/projects/new", isLoggedIn: false })).toBe(false);
  });

  it("lets a signed-in admin through", () => {
    expect(isAuthorized({ pathname: "/admin", isLoggedIn: true })).toBe(true);
    expect(isAuthorized({ pathname: "/admin/projects/abc", isLoggedIn: true })).toBe(true);
  });

  it("leaves public paths alone", () => {
    expect(isAuthorized({ pathname: "/", isLoggedIn: false })).toBe(true);
    expect(isAuthorized({ pathname: "/projects/moneykick-shop", isLoggedIn: false })).toBe(true);
    expect(isAuthorized({ pathname: "/administrator", isLoggedIn: false })).toBe(true);
  });
});
