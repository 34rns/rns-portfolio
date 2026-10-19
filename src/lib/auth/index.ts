import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./config";
import { verifyPassword } from "./password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
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
  ],
});
