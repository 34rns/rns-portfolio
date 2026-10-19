import type { NextAuthConfig } from "next-auth";
import { isAuthorized } from "./guard";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      return isAuthorized({
        pathname: request.nextUrl.pathname,
        isLoggedIn: Boolean(auth?.user),
      });
    },
    jwt({ token, user }) {
      if (user) {
        const role = (user as { role?: "admin" | "customer" }).role ?? "admin";
        token.role = role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role === "customer" ? "customer" : "admin";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
