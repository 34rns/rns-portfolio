import type { NextAuthConfig } from "next-auth";

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
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.authenticatedAt = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role === "customer" || token.role === "admin" || token.role === "staff" ? token.role : undefined;
        session.user.sessionVersion = typeof token.sessionVersion === "number" ? token.sessionVersion : undefined;
        session.user.authenticatedAt = typeof token.authenticatedAt === "number" ? token.authenticatedAt : undefined;
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
