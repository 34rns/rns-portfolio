import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbStore } from "@/lib/payments/db-store";
import { formatPrice } from "@/lib/projects/view";
import { visitorLogoutAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your purchases",
  robots: { index: false, follow: false },
};

const statusCopy: Record<string, string> = {
  paid: "Paid",
  pending: "Awaiting payment",
  failed: "Payment failed",
  refunded: "Refunded",
};

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/account/login?next=/account/purchases");
  }

  const [purchases, params] = await Promise.all([
    dbStore.listPurchases(session.user.id),
    searchParams,
  ]);

  return (
    <main id="main" className="mx-auto max-w-[760px] px-5 py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Link href="/" className="display text-[1.2rem] font-semibold">
          RNS
        </Link>
        <div className="flex items-center gap-4 text-sm text-[var(--theme-muted)]">
          <span className="truncate">{session.user.email}</span>
          <form action={visitorLogoutAction}>
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <h1 className="display mt-12 text-[2.6rem] font-medium">Your purchases</h1>

      {params.paid === "1" ? (
        <p className="mt-4 border border-[#CFE3D4] bg-[#F0F7F1] px-4 py-3 text-sm">
          Payment received. Access unlocks once the provider webhook confirms
          the order — usually within seconds.
        </p>
      ) : null}

      {purchases.length === 0 ? (
        <div className="mt-10 border-t border-[var(--theme-line)] pt-6">
          <p className="text-[var(--theme-muted)]">
            No purchases yet. Paid projects appear here after checkout.
          </p>
          <Link href="/#work" className="mt-4 inline-block underline">
            Browse projects
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-[var(--theme-line)] border-y border-[var(--theme-line)]">
          {purchases.map((purchase) => (
            <li
              key={purchase.id}
              className="flex flex-wrap items-baseline justify-between gap-3 py-5"
            >
              <div className="min-w-0">
                <Link
                  href={`/projects/${purchase.projectSlug}`}
                  className="text-[1.15rem] hover:underline"
                >
                  {purchase.projectTitle}
                </Link>
                <p className="mono mt-1 text-[var(--theme-muted)]">
                  {purchase.createdAt.toLocaleDateString("en-GB")} ·{" "}
                  {statusCopy[purchase.status] ?? purchase.status}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular-nums">
                  {formatPrice(purchase.amountCents, purchase.currency)}
                </p>
                {purchase.status === "paid" ? (
                  <Link
                    href={`/projects/${purchase.projectSlug}`}
                    className="mt-1 inline-block text-sm underline"
                  >
                    Open access
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
