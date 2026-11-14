import type { DefaultSession } from "next-auth";

type AppRole = "admin" | "customer" | "staff";

declare module "next-auth" {
  interface User {
    role?: AppRole;
    sessionVersion?: number;
    authenticatedAt?: number;
  }

  interface Session {
    user: {
      id?: string;
      role?: AppRole;
      sessionVersion?: number;
      authenticatedAt?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    sessionVersion?: number;
    authenticatedAt?: number;
  }
}
