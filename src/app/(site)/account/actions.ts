"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { signIn, signOut } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { authRateLimit } from "@/lib/auth/rate-limit";
import { parseSignupForm, safeNextPath } from "@/lib/auth/signup";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type VisitorFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function clientKey(scope: string): Promise<string> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${scope}:${ip}`;
}

export async function signupAction(
  _state: VisitorFormState,
  formData: FormData,
): Promise<VisitorFormState> {
  const limit = authRateLimit.check(await clientKey("visitor-signup"));
  if (!limit.allowed) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const parsed = parseSignupForm(formData);
  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: parsed.errors };
  }

  const { email, password, name } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    return {
      error: "That email already has an account.",
      fieldErrors: { email: "Already registered" },
    };
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({
      email,
      name: name && name.length > 0 ? name : null,
      passwordHash,
      role: "customer",
    });
  } catch {
    return { error: "That email already has an account." };
  }

  try {
    await signIn("visitor", {
      email,
      password,
      redirectTo: safeNextPath(String(formData.get("next") ?? "")),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created. Sign in to continue." };
    }
    throw error;
  }
}

export async function visitorLoginAction(
  _state: VisitorFormState,
  formData: FormData,
): Promise<VisitorFormState> {
  const limit = authRateLimit.check(await clientKey("visitor-login"));
  if (!limit.allowed) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  try {
    await signIn("visitor", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: safeNextPath(String(formData.get("next") ?? "")),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Wrong email or password." };
    }
    throw error;
  }
}

export async function visitorLogoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
