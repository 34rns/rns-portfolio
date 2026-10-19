import Link from "next/link";
import { getAllProjects, getAdminStats } from "@/lib/db/queries";
import { dbStore } from "@/lib/payments/db-store";
import { formatPrice } from "@/lib/projects/view";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, recent, commerce] = await Promise.all([
    getAdminStats(),
    getAllProjects(),
    dbStore.commerceStats(),
  ]);

  return (
    <div>
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-medium tracking-tight">Overview</h1>
        <Link
          href="/admin/projects/new"
          className="bg-[#14171A] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          New project
        </Link>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projects" value={stats.total} />
        <Stat label="Published" value={stats.published} />
        <Stat label="Drafts" value={stats.drafts} />
        <Stat label="Paid" value={stats.paid} />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-[#6B6B64]">Recent projects</h2>
        <ul className="mt-3 divide-y divide-[#E1E1DA] border-y border-[#E1E1DA]">
          {recent.slice(0, 5).map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {project.title}
                </Link>
                <p className="mono mt-0.5 truncate text-[#6B6B64]">
                  /{project.slug} · {project.status} · {project.theme}
                </p>
              </div>
              <span className="mono shrink-0 text-[#6B6B64]">
                {project.updatedAt.toLocaleDateString("en-GB")}
              </span>
            </li>
          ))}
          {recent.length === 0 ? (
            <li className="py-6 text-sm text-[#6B6B64]">
              No projects yet. Create the first one.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        <div className="border border-[#E1E1DA] bg-white p-5">
          <h2 className="text-sm font-medium">Signups</h2>
          <p className="mt-2 text-3xl font-medium tabular-nums">{commerce.signups}</p>
          <p className="mt-1 text-sm text-[#6B6B64]">Visitor accounts</p>
        </div>
        <div className="border border-[#E1E1DA] bg-white p-5">
          <h2 className="text-sm font-medium">Revenue</h2>
          <p className="mt-2 text-3xl font-medium tabular-nums">
            {commerce.revenue.length === 0
              ? formatPrice(0, "USD")
              : commerce.revenue
                  .map((entry) => formatPrice(entry.cents, entry.currency))
                  .join(" + ")}
          </p>
          <p className="mt-1 text-sm text-[#6B6B64]">
            {commerce.paidOrders} paid {commerce.paidOrders === 1 ? "order" : "orders"}
          </p>
          <Link href="/admin/orders" className="mt-3 inline-block text-sm underline">
            View orders
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#E1E1DA] bg-white p-4">
      <p className="mono text-[#6B6B64]">{label}</p>
      <p className="mt-2 text-3xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
