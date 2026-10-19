/**
 * Pure authorization rule shared by the proxy and unit tests.
 * Login stays public; everything else under /admin requires a session.
 */
export function isAuthorized({
  pathname,
  isLoggedIn,
}: {
  pathname: string;
  isLoggedIn: boolean;
}): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return isLoggedIn;
  return true;
}
