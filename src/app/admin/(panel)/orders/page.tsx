import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { dbLicenseStore } from "@/lib/licensing/db-store";
import { licenseStatus } from "@/lib/licensing/service";
import { dbOrderStore } from "@/lib/orders/db-store";
import { isOrderStatus } from "@/lib/orders/service";
import {
  MESSAGE_CHANNELS,
  buildOrderMessage,
} from "@/lib/orders/template";
import { ORDER_STATUSES, PAYMENT_METHODS, type OrderRow } from "@/lib/orders/store";
import { formatPrice } from "@/lib/projects/view";
import { decryptValue } from "@/lib/security/secrets";
import { siteUrl } from "@/lib/seo";
import { generateLicenseAction, updateOrderAction } from "./actions";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  notice?: string;
  error?: string;
}>;

function formatDate(value: Date) {
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  const tone =
    status === "paid"
      ? "border-[#14171A] text-[#14171A]"
      : status === "cancelled"
        ? "border-[#B3261E] text-[#B3261E]"
        : status === "contacted"
          ? "border-[#1B3BFF] text-[#1B3BFF]"
          : "border-[#D8D8D2] text-[#6B6B64]";

  return (
    <span className={`border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide ${tone}`}>
      {status}
    </span>
  );
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filter = params.status && isOrderStatus(params.status) ? params.status : undefined;
  const query = params.q?.trim() || undefined;
  const pageValue = Number.parseInt(params.page ?? "0", 10);
  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 0;

  const [orders, total, counts, allCount] = await Promise.all([
    dbOrderStore.listOrders({ status: filter, query, page, perPage: PER_PAGE }),
    dbOrderStore.countOrders({ status: filter, query }),
    Promise.all(
      ORDER_STATUSES.map((status) => dbOrderStore.countOrders({ status })),
    ),
    dbOrderStore.countOrders({}),
  ]);

  const licenses = await dbLicenseStore.listLicensesByOrderIds(orders.map((order) => order.id));
  const licenseByOrder = new Map(licenses.map((license) => [license.orderId, license]));
  const statusCounts = new Map(ORDER_STATUSES.map((status, index) => [status, counts[index]]));

  const state = { status: filter ?? "", q: query ?? "" };
  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (filter) search.set("status", filter);
    if (query) search.set("q", query);
    if (target > 0) search.set("page", String(target));
    const suffix = search.toString();
    return `/admin/orders${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <div>
      <header>
        <h1 className="text-2xl font-medium tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Requests from the Request Pro form. Confirm payment yourself, record the
          agreed amount, then generate the license key and send the buyer their
          message.
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
          <span className="mono text-[#6B6B64]">All </span>
          <span className="tabular-nums">{allCount}</span>
        </span>
        {ORDER_STATUSES.map((status) => (
          <span key={status}>
            <span className="mono text-[#6B6B64]">{status} </span>
            <span className="tabular-nums">{statusCounts.get(status) ?? 0}</span>
          </span>
        ))}
      </div>

      <form action="/admin/orders" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mono text-[#6B6B64]">Search</span>
          <input
            name="q"
            defaultValue={query ?? ""}
            placeholder="name, email or project"
            className="mt-1 w-64 border border-[#D8D8D2] bg-white px-2 py-1.5"
          />
        </label>
        {filter ? <input type="hidden" name="status" value={filter} /> : null}
        <button type="submit" className="border border-[#14171A] px-3 py-1.5 text-sm">
          Search
        </button>
        {query ? (
          <Link href={filter ? `/admin/orders?status=${filter}` : "/admin/orders"} className="text-sm underline">
            Clear
          </Link>
        ) : null}
      </form>

      <nav aria-label="Filter orders" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          href={query ? `/admin/orders?q=${encodeURIComponent(query)}` : "/admin/orders"}
          className={filter ? "underline text-[#6B6B64]" : "font-medium underline"}
        >
          All
        </Link>
        {ORDER_STATUSES.map((status) => {
          const search = new URLSearchParams({ status });
          if (query) search.set("q", query);
          return (
            <Link
              key={status}
              href={`/admin/orders?${search.toString()}`}
              className={filter === status ? "font-medium underline" : "underline text-[#6B6B64]"}
            >
              {status}
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#D8D8D2] p-10 text-center">
          <p className="text-sm text-[#6B6B64]">
            {total > 0
              ? "Nothing on this page — go back a page."
              : filter || query
                ? "No orders match that filter."
                : "No requests yet."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5">
          {orders.map((order) => {
            const license = licenseByOrder.get(order.id) ?? null;
            const status = license ? licenseStatus(license) : null;

            let buyerToken: string | null = null;
            try {
              buyerToken = decryptValue(order.tokenCiphertext);
            } catch {
              buyerToken = null;
            }

            let key: string | null = null;
            if (license) {
              try {
                key = decryptValue(license.keyCiphertext);
              } catch {
                key = null;
              }
            }

            const orderUrl = buyerToken ? `${siteUrl()}/order/${buyerToken}` : "";
            const amount = order.amountCents != null
              ? formatPrice(order.amountCents, order.currency)
              : "No amount agreed";

            return (
              <li key={order.id} className="border border-[#E1E1DA] bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {order.name} ·{" "}
                      <a href={`mailto:${order.email}`} className="underline">
                        {order.email}
                      </a>
                    </p>
                    <p className="mono mt-1 truncate text-[#6B6B64]">
                      {order.projectTitle}
                      {order.method ? ` · ${order.method}` : ""} · {amount} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mono mt-1 truncate text-[#6B6B64]">
                      order {order.id.slice(0, 8)}
                      {order.notes ? ` · note: ${order.notes}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {order.message ? (
                  <p className="border-t border-[#E1E1DA] whitespace-pre-wrap px-5 py-4 text-sm text-[#3D3D39]">
                    {order.message}
                  </p>
                ) : null}

                <div className="grid gap-6 border-t border-[#E1E1DA] p-5">
                  <form action={updateOrderAction} className="grid gap-3 sm:grid-cols-4">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="filterStatus" value={state.status} />
                    <input type="hidden" name="filterQuery" value={state.q} />
                    <input type="hidden" name="filterPage" value={page > 0 ? String(page) : ""} />

                    <label className="block text-sm">
                      <span className="mono text-[#6B6B64]">Status</span>
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
                      >
                        {ORDER_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm">
                      <span className="mono text-[#6B6B64]">Agreed amount</span>
                      <input
                        name="amount"
                        defaultValue={
                          order.amountCents != null ? (order.amountCents / 100).toString() : ""
                        }
                        placeholder="19.00"
                        className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5 tabular-nums"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mono text-[#6B6B64]">Currency</span>
                      <input
                        name="currency"
                        defaultValue={order.currency}
                        maxLength={3}
                        className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5 uppercase"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mono text-[#6B6B64]">Notes (private)</span>
                      <input
                        name="notes"
                        defaultValue={order.notes ?? ""}
                        maxLength={2000}
                        placeholder="Paid by bKash, key sent on WhatsApp"
                        className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
                      />
                    </label>

                    <div className="sm:col-span-4 flex flex-wrap items-center gap-4">
                      <button
                        type="submit"
                        className="bg-[#14171A] px-4 py-2 text-sm text-white hover:opacity-90"
                      >
                        Save order
                      </button>
                      {orderUrl ? (
                        <a
                          href={orderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline"
                        >
                          Open the buyer&apos;s page
                        </a>
                      ) : (
                        <span className="text-xs text-[#B3261E]">
                          Order link is unreadable with the current LICENSE_SECRET.
                        </span>
                      )}
                    </div>
                  </form>

                  <div className="border-t border-[#E1E1DA] pt-5">
                    {license ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="mono text-[#6B6B64]">License</span>
                        <span className="border border-[#14171A] px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide">
                          {status}
                        </span>
                        <span className="tabular-nums">
                          {license.activationCount}/{license.maxDevices} devices
                        </span>
                        <span className="text-[#6B6B64]">
                          {license.type === "permanent"
                            ? "permanent"
                            : `${license.days} days from first activation`}
                        </span>
                        <Link href={`/admin/licenses?reveal=${license.id}`} className="underline">
                          Re-show key
                        </Link>
                      </div>
                    ) : (
                      <form action={generateLicenseAction} className="grid gap-3 sm:grid-cols-4">
                        <input type="hidden" name="orderId" value={order.id} />
                        <p className="sm:col-span-4 text-sm">
                          <span className="font-medium">Generate license key</span>{" "}
                          <span className="text-[#6B6B64]">
                            — unlocks {order.projectSlug}, shown once on the licenses page.
                          </span>
                        </p>

                        <label className="block text-sm">
                          <span className="mono text-[#6B6B64]">Type</span>
                          <select
                            name="licenseType"
                            defaultValue="permanent"
                            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
                          >
                            <option value="permanent">permanent</option>
                            <option value="timelimited">time-limited</option>
                          </select>
                        </label>

                        <label className="block text-sm">
                          <span className="mono text-[#6B6B64]">Days (if limited)</span>
                          <input
                            name="days"
                            defaultValue="365"
                            inputMode="numeric"
                            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5 tabular-nums"
                          />
                        </label>

                        <label className="block text-sm">
                          <span className="mono text-[#6B6B64]">Max devices</span>
                          <input
                            name="maxDevices"
                            defaultValue="2"
                            inputMode="numeric"
                            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5 tabular-nums"
                          />
                        </label>

                        <label className="block text-sm">
                          <span className="mono text-[#6B6B64]">Note</span>
                          <input
                            name="note"
                            placeholder={`Order ${order.id.slice(0, 8)}`}
                            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
                          />
                        </label>

                        <div className="sm:col-span-4">
                          <button
                            type="submit"
                            className="border border-[#14171A] px-4 py-2 text-sm hover:bg-[#14171A] hover:text-white"
                          >
                            Generate license key
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {buyerToken ? (
                    <details className="border-t border-[#E1E1DA] pt-5">
                      <summary className="cursor-pointer text-sm font-medium">
                        Message template
                      </summary>
                      <div className="mt-3 grid gap-3">
                        {MESSAGE_CHANNELS.map((channel) => {
                          const message = buildOrderMessage({
                            channel: channel.id,
                            order,
                            projectTitle: order.projectTitle,
                            key,
                            orderUrl,
                          });
                          const text = message.subject
                            ? `Subject: ${message.subject}\n\n${message.body}`
                            : message.body;

                          return (
                            <details key={channel.id} className="border border-[#E1E1DA]">
                              <summary className="cursor-pointer px-3 py-2 text-sm">
                                {channel.label}
                              </summary>
                              <div className="border-t border-[#E1E1DA] p-3">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.6]">
                                  {text}
                                </pre>
                                <div className="mt-3">
                                  <CopyButton value={text} label={`Copy ${channel.label} message`} />
                                </div>
                              </div>
                            </details>
                          );
                        })}
                        <p className="text-xs text-[#6B6B64]">
                          {key
                            ? "The key is included. Payment methods on file: " +
                              PAYMENT_METHODS.join(", ") +
                              "."
                            : "Generate a key first and the message will include it."}
                        </p>
                      </div>
                    </details>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {total > 0 ? (
        <nav aria-label="Order pages" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="mono text-[#6B6B64]">
            {`${page * PER_PAGE + 1}–${page * PER_PAGE + orders.length} of ${total}`}
          </span>
          <span className="flex gap-4">
            {page > 0 ? (
              <Link href={pageHref(page - 1)} className="underline">
                Newer
              </Link>
            ) : null}
            {page * PER_PAGE + orders.length < total ? (
              <Link href={pageHref(page + 1)} className="underline">
                Older
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}
    </div>
  );
}
