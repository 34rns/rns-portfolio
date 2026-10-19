import type { DefaultSession } from "next-auth";

type AppRole = "admin" | "customer";

declare module "next-auth" {
  interface User {
    role?: AppRole;
  }

  interface Session {
    user: {
      role?: AppRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
  }
}
