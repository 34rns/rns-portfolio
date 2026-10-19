import { describe, expect, it } from "vitest";
import { isAuthorized } from "@/lib/auth/guard";

describe("isAuthorized", () => {
  it("lets guests reach the guest-only pages", () => {
    expect(isAuthorized({ pathname: "/admin/login", role: null })).toBe(true);
    expect(isAuthorized({ pathname: "/account/login", role: null })).toBe(true);
    expect(isAuthorized({ pathname: "/account/signup", role: null })).toBe(true);
  });

  it("blocks guests from the admin dashboard and nested pages", () => {
    expect(isAuthorized({ pathname: "/admin", role: null })).toBe(false);
    expect(isAuthorized({ pathname: "/admin/projects", role: null })).toBe(false);
    expect(isAuthorized({ pathname: "/admin/projects/new", role: null })).toBe(false);
  });

  it("lets a signed-in admin through", () => {
    expect(isAuthorized({ pathname: "/admin", role: "admin" })).toBe(true);
    expect(isAuthorized({ pathname: "/admin/projects/abc", role: "admin" })).toBe(true);
  });

  it("keeps a visitor session out of the admin panel", () => {
    expect(isAuthorized({ pathname: "/admin", role: "customer" })).toBe(false);
    expect(isAuthorized({ pathname: "/admin/preview/abc", role: "customer" })).toBe(false);
  });

  it("requires a session for account pages", () => {
    expect(isAuthorized({ pathname: "/account/purchases", role: null })).toBe(false);
    expect(isAuthorized({ pathname: "/account/purchases", role: "customer" })).toBe(true);
    expect(isAuthorized({ pathname: "/account/purchases", role: "admin" })).toBe(true);
  });

  it("leaves public paths alone", () => {
    expect(isAuthorized({ pathname: "/", role: null })).toBe(true);
    expect(isAuthorized({ pathname: "/projects/moneykick-shop", role: null })).toBe(true);
    expect(isAuthorized({ pathname: "/administrator", role: null })).toBe(true);
  });
});
