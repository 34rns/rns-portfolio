import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { authConfig } from "./config";
import { verifyPassword } from "./password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
        const adminHash = process.env.ADMIN_PASSWORD_HASH ?? "";

        if (!adminEmail || !adminHash) {
          throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be configured.");
        }

        if (email !== adminEmail) return null;
        if (!(await verifyPassword(password, adminHash))) return null;

        return { id: "admin", email: adminEmail, name: "RNS", role: "admin" };
      },
    }),
    Credentials({
      id: "visitor",
      name: "Visitor",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const rows = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        const account = rows[0];

        if (!account?.passwordHash || account.role !== "customer") return null;
        if (!(await verifyPassword(password, account.passwordHash))) return null;

        return {
          id: account.id,
          email: account.email,
          name: account.name ?? account.email.split("@")[0],
          role: "customer" as const,
        };
      },
    }),
  ],
});
