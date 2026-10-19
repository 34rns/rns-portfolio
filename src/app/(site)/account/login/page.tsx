import type { Metadata } from "next";
import Link from "next/link";
import { safeNextPath } from "@/lib/auth/signup";
import { VisitorLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function VisitorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNextPath(next);

  return (
    <main id="main" className="mx-auto max-w-[440px] px-5 py-20">
      <Link href="/" className="display text-[1.2rem] font-semibold">
        RNS
      </Link>
      <h1 className="display mt-10 text-[2.4rem] font-medium">Sign in</h1>
      <p className="mt-2 text-[var(--theme-muted)]">
        Access the projects you have bought.
      </p>
      <VisitorLoginForm next={target} />
    </main>
  );
}
