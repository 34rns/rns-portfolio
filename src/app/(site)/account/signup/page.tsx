import type { Metadata } from "next";
import Link from "next/link";
import { safeNextPath } from "@/lib/auth/signup";
import { VisitorSignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function VisitorSignupPage({
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
      <h1 className="display mt-10 text-[2.4rem] font-medium">Create an account</h1>
      <p className="mt-2 text-[var(--theme-muted)]">
        One account for every paid project. Checkout comes next.
      </p>
      <VisitorSignupForm next={target} />
    </main>
  );
}
