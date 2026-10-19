import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";
import { isAuthorized } from "@/lib/auth/guard";

const { auth } = NextAuth(authConfig);

/**
 * Admin pages require the admin role; account pages require any session, with
 * their own login pages public. Each area redirects to its own sign-in page.
 */
export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const role = request.auth?.user?.role ?? null;

  if (isAuthorized({ pathname, role })) return NextResponse.next();

  const isAccount = pathname === "/account" || pathname.startsWith("/account/");
  const login = isAccount ? "/account/login" : "/admin/login";
  const url = new URL(login, request.nextUrl.origin);
  if (isAccount) url.searchParams.set("next", pathname);

  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
