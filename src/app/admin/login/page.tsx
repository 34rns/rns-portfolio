import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="display text-2xl font-semibold">RNS</p>
        <h1 className="mt-10 text-2xl font-medium tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6B64]">
          Projects, drafts and themes live behind this door.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
