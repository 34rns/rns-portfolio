import Link from "next/link";
import { purchaseStatus, type PurchaseStatus } from "@/lib/db/schema";
import { dbStore } from "@/lib/payments/db-store";
import {
  ORDERS_PER_PAGE,
  countOrders,
  listAuditTrail,
  listOrders,
  listPaidProjects,
} from "@/lib/payments/db-admin";
import { formatPrice } from "@/lib/projects/view";
import { ConfirmButton } from "../../confirm-button";
import { grantAccessAction, revokeAccessAction } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  page?: string;
  notice?: string;
  error?: string;
}>;

function isStatus(value: string): value is PurchaseStatus {
  return (purchaseStatus.enumValues as readonly string[]).includes(value);
}

function formatDate(value: Date) {
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: PurchaseStatus }) {
  const tone =
    status === "paid"
      ? "border-[#14171A] text-[#14171A]"
      : status === "refunded"
        ? "border-[#B3261E] text-[#B3261E]"
        : "border-[#D8D8D2] text-[#6B6B64]";

  return (
    <span
      className={`border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide ${tone}`}
    >
      {status}
    </span>
  );
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filter = params.status && isStatus(params.status) ? params.status : undefined;
  const pageValue = Number.parseInt(params.page ?? "0", 10);
  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 0;

  const [orders, total, audit, paidProjects, commerce] = await Promise.all([
    listOrders({ status: filter, page }),
    countOrders({ status: filter }),
    listAuditTrail(20),
    listPaidProjects(),
    dbStore.commerceStats(),
  ]);

  const first = orders.length === 0 ? 0 : page * ORDERS_PER_PAGE + 1;
  const last = page * ORDERS_PER_PAGE + orders.length;
  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (filter) search.set("status", filter);
    if (target > 0) search.set("page", String(target));
    const query = search.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <header>
        <h1 className="text-2xl font-medium tracking-tight">Checkouts</h1>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Every automated checkout attempt and visitor grant, newest first. Hand-
          sold licenses live under <Link href="/admin/orders" className="underline">Orders</Link>.
        </p>
      </header>

      {params.notice ? (
        <p className="mt-5 border border-[#CFE3D4] bg-[#F0F7F1] px-4 py-3 text-sm">
          {params.notice}
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border border-[#E9C6C2] bg-[#FBF1F0] px-4 py-3 text-sm text-[#8C1D16]">
          {params.error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-[#E1E1DA] py-3 text-sm">
        <span>
          <span className="mono text-[#6B6B64]">Paid orders </span>
          <span className="tabular-nums">{commerce.paidOrders}</span>
        </span>
        <span>
          <span className="mono text-[#6B6B64]">Revenue </span>
          <span className="tabular-nums">
            {commerce.revenue.length === 0
              ? formatPrice(0, "USD")
              : commerce.revenue
                  .map((entry) => formatPrice(entry.cents, entry.currency))
                  .join(" + ")}
          </span>
        </span>
        <span>
          <span className="mono text-[#6B6B64]">Visitor accounts </span>
          <span className="tabular-nums">{commerce.signups}</span>
        </span>
      </div>
      <p className="mt-2 text-xs text-[#6B6B64]">
        Manual grants are $0 rows and stay out of revenue and order counts.
      </p>

      <form
        action={grantAccessAction}
        className="mt-8 grid gap-3 border border-[#E1E1DA] bg-white p-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <h2 className="text-sm font-medium">Grant access</h2>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Comp a visitor account. The action is written to the audit trail with
            your email.
          </p>
        </div>

        <label className="block text-sm">
          <span className="mono text-[#6B6B64]">Project</span>
          <select
            name="projectId"
            required
            defaultValue={paidProjects[0]?.id ?? ""}
            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
          >
            {paidProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} — {formatPrice(project.priceCents ?? 0, project.currency)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mono text-[#6B6B64]">Buyer email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="off"
            placeholder="buyer@example.com"
            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mono text-[#6B6B64]">Reason (optional)</span>
          <input
            name="reason"
            maxLength={500}
            placeholder="Comped for a client, warranty replacement, …"
            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
          />
        </label>

        <input type="hidden" name="status" value={filter ?? ""} />
        <input type="hidden" name="page" value={page > 0 ? String(page) : ""} />

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={paidProjects.length === 0}
            className="bg-[#14171A] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-40"
          >
            Grant access
          </button>
          {paidProjects.length === 0 ? (
            <p className="mt-2 text-xs text-[#6B6B64]">
              Mark a project as paid before granting access.
            </p>
          ) : null}
        </div>
      </form>

      <nav aria-label="Filter orders" className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          href="/admin/orders"
          className={filter ? "underline text-[#6B6B64]" : "font-medium underline"}
        >
          All
        </Link>
        {purchaseStatus.enumValues.map((status) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={
              filter === status ? "font-medium underline" : "underline text-[#6B6B64]"
            }
          >
            {status}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#D8D8D2] p-10 text-center">
          <p className="text-sm text-[#6B6B64]">
            {total > 0
              ? "Nothing on this page — go back a page."
              : filter
                ? `No ${filter} orders yet.`
                : "No orders yet."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[#E1E1DA] border-y border-[#E1E1DA]">
          {orders.map((order) => (
            <li
              key={order.id}
              className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-start md:gap-6"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{order.buyerEmail}</p>
                <p className="mono mt-1 truncate text-[#6B6B64]">
                  {order.buyerName ? `${order.buyerName} · ` : ""}
                  {order.provider} · {order.reference}
                </p>
              </div>

              <div className="min-w-0">
                <Link
                  href={`/admin/projects/${order.projectId}`}
                  className="block truncate text-sm hover:underline"
                >
                  {order.projectTitle}
                </Link>
                <p className="mono mt-1 truncate text-[#6B6B64]">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:flex-col md:items-end">
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="text-sm tabular-nums">
                    {order.provider === "manual"
                      ? "Comped"
                      : formatPrice(order.amountCents, order.currency)}
                  </span>
                </div>

                {order.status === "paid" ? (
                  <form action={revokeAccessAction} className="flex items-center gap-2">
                    <input type="hidden" name="purchaseId" value={order.id} />
                    <input type="hidden" name="status" value={filter ?? ""} />
                    <input type="hidden" name="page" value={page > 0 ? String(page) : ""} />
                    <input
                      name="reason"
                      maxLength={500}
                      placeholder="Reason"
                      aria-label={`Reason for revoking ${order.buyerEmail}`}
                      className="w-24 border border-[#D8D8D2] bg-white px-2 py-1 text-xs"
                    />
                    <ConfirmButton
                      message={`Revoke ${order.buyerEmail}'s access to ${order.projectTitle}?`}
                      className="text-xs text-[#B3261E] underline"
                    >
                      Revoke
                    </ConfirmButton>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {total > 0 ? (
        <nav
          aria-label="Order pages"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
        >
          <span className="mono text-[#6B6B64]">
            {orders.length === 0
              ? `No orders on this page · ${total} total`
              : `Showing ${first}–${last} of ${total}`}
          </span>
          <span className="flex gap-4">
            {page > 0 ? (
              <Link href={pageHref(page - 1)} className="underline">
                Newer
              </Link>
            ) : null}
            {last < total ? (
              <Link href={pageHref(page + 1)} className="underline">
                Older
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}

      <section className="mt-12">
        <h2 className="text-sm font-medium">Audit trail</h2>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Manual grants and revocations, newest first.
        </p>

        {audit.length === 0 ? (
          <p className="mt-4 border border-dashed border-[#D8D8D2] p-8 text-center text-sm text-[#6B6B64]">
            No manual access changes yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[#E1E1DA] border-y border-[#E1E1DA]">
            {audit.map((entry) => (
              <li key={entry.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[auto_1fr_auto]">
                <div className="flex items-center gap-2">
                  <span
                    className={`border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide ${
                      entry.action === "grant"
                        ? "border-[#14171A] text-[#14171A]"
                        : "border-[#B3261E] text-[#B3261E]"
                    }`}
                  >
                    {entry.action}
                  </span>
                  <span className="mono text-[#6B6B64]">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate">
                    {entry.buyerEmail} · {entry.projectTitle}
                  </p>
                  <p className="mono mt-0.5 truncate text-[#6B6B64]">
                    By {entry.actorEmail}
                    {entry.reason ? ` — ${entry.reason}` : ""}
                  </p>
                </div>

                <span className="tabular-nums sm:text-right">
                  {entry.action === "grant" ? "Comped" : formatPrice(entry.amountCents, entry.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
