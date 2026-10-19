export type AuthRole = "admin" | "customer" | null;

/**
 * Pure authorization rule shared by the proxy and unit tests. Admin pages need
 * the admin role; account pages need any signed-in visitor. Login and signup
 * stay public.
 */
export function isAuthorized({
  pathname,
  role,
}: {
  pathname: string;
  role: AuthRole;
}): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return true;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return role === "admin";
  }

  if (pathname === "/account/login" || pathname.startsWith("/account/login/")) return true;
  if (pathname === "/account/signup" || pathname.startsWith("/account/signup/")) return true;

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    return role !== null;
  }

  return true;
}
