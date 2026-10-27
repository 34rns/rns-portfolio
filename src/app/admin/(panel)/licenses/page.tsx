import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { revealLicenseKey } from "@/lib/licensing/admin";
import { dbLicenseStore } from "@/lib/licensing/db-store";
import { licenseExpiresAt, licenseStatus } from "@/lib/licensing/service";
import {
  LICENSE_DAYS_PRESETS,
  LICENSE_STATUSES,
  isLicenseStatus,
  type LicenseStatus,
} from "@/lib/licensing/store";
import { requireAdmin } from "@/lib/auth/require-admin";
import { secretsConfigured } from "@/lib/security/secrets";
import {
  createLicenseAction,
  extendLicenseAction,
  resetDevicesAction,
  revokeLicenseAction,
} from "./actions";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  reveal?: string;
  notice?: string;
  error?: string;
}>;

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: LicenseStatus }) {
  const tone =
    status === "active"
      ? "border-[#14171A] text-[#14171A]"
      : status === "revoked"
        ? "border-[#B3261E] text-[#B3261E]"
        : status === "expired"
          ? "border-[#8C6D1F] text-[#8C6D1F]"
          : "border-[#D8D8D2] text-[#6B6B64]";

  return (
    <span className={`border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide ${tone}`}>
      {status}
    </span>
  );
}

export default async function LicensesPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filter = params.status && isLicenseStatus(params.status) ? params.status : undefined;
  const query = params.q?.trim() || undefined;
  const pageValue = Number.parseInt(params.page ?? "0", 10);
  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 0;

  const [licenses, total, projectSlugs, events] = await Promise.all([
    dbLicenseStore.listLicenses({ status: filter, query, page, perPage: PER_PAGE }),
    dbLicenseStore.countLicenses({ status: filter, query }),
    dbLicenseStore.listProjectSlugs(),
    dbLicenseStore.listEvents(30),
  ]);

  const activations = await dbLicenseStore.listActivationsForLicenses(
    licenses.map((license) => license.id),
  );
  const lastSeenByLicense = new Map<string, Date>();
  for (const activation of activations) {
    const current = lastSeenByLicense.get(activation.licenseId);
    if (!current || activation.lastSeen > current) {
      lastSeenByLicense.set(activation.licenseId, activation.lastSeen);
    }
  }

  const revealed = params.reveal
    ? licenses.find((license) => license.id === params.reveal) ?? null
    : null;
  // A key opened from a link outside this page (an order row, for instance) is
  // looked up directly; viewing it is recorded either way.
  const revealedKey = params.reveal
    ? await revealLicenseKey(dbLicenseStore, {
        id: params.reveal,
        actorEmail: admin.email ?? "admin",
      })
    : null;

  const state = { status: filter ?? "", q: query ?? "" };
  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (filter) search.set("status", filter);
    if (query) search.set("q", query);
    if (target > 0) search.set("page", String(target));
    const suffix = search.toString();
    return `/admin/licenses${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <div>
      <header>
        <h1 className="text-2xl font-medium tracking-tight">Licenses</h1>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Keys for the Pro unlock. The plain key is stored encrypted and hashed, so
          it can be re-shown here but never read out of a database dump.
        </p>
      </header>

      {!secretsConfigured() ? (
        <p className="mt-5 border border-[#E9C6C2] bg-[#FBF1F0] px-4 py-3 text-sm text-[#8C1D16]">
          LICENSE_SECRET is not set in this environment, so keys cannot be generated,
          shown or verified. Set it (and the token signing key) before selling.
        </p>
      ) : null}

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

      {params.reveal ? (
        <section className="mt-5 border border-[#14171A] bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium">License key</h2>
            <Link href={params.status || query ? pageHref(page) : "/admin/licenses"} className="text-sm underline">
              Close
            </Link>
          </div>
          {revealedKey?.ok && revealedKey.key ? (
            <>
              <p className="mt-3 break-all font-mono text-[1.05rem]">{revealedKey.key}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <CopyButton value={revealedKey.key} label="Copy key" />
                <span className="text-xs text-[#6B6B64]">
                  Send it to the buyer, then close this panel. Viewing a key is recorded
                  in the audit trail.
                </span>
              </div>
              {revealed ? (
                <p className="mono mt-3 text-[#6B6B64]">
                  {revealed.type === "permanent"
                    ? "permanent"
                    : `${revealed.days} days from first activation`}{" "}
                  · up to {revealed.maxDevices} device(s) ·{" "}
                  {revealed.projectSlugs.length === 0
                    ? "all projects"
                    : revealed.projectSlugs.join(", ")}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-[#8C1D16]">
              {revealedKey && !revealedKey.ok
                ? revealedKey.error
                : "That key could not be shown."}
            </p>
          )}
        </section>
      ) : null}

      <form
        action={createLicenseAction}
        className="mt-8 grid gap-4 border border-[#E1E1DA] bg-white p-5 sm:grid-cols-3"
      >
        <input type="hidden" name="filterStatus" value={state.status} />
        <input type="hidden" name="filterQuery" value={state.q} />

        <div className="sm:col-span-3">
          <h2 className="text-sm font-medium">Generate a key</h2>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Tick projects to scope the key, or leave everything unticked for a bundle
            that unlocks every project.
          </p>
        </div>

        <fieldset className="sm:col-span-3">
          <legend className="mono text-[#6B6B64]">Projects</legend>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {projectSlugs.map((slug) => (
              <label key={slug} className="flex items-center gap-2">
                <input type="checkbox" name="projectSlugs" value={slug} />
                {slug}
              </label>
            ))}
          </div>
        </fieldset>

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
          <span className="mono text-[#6B6B64]">
            Days ({LICENSE_DAYS_PRESETS.join(" / ")} or custom)
          </span>
          <input
            name="days"
            defaultValue="365"
            inputMode="numeric"
            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5 tabular-nums"
          />
          <span className="mt-1 block text-xs text-[#6B6B64]">
            Counted from the first activation, not from today.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mono text-[#6B6B64]">Activate before (optional)</span>
          <input
            type="date"
            name="activateBy"
            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
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

        <label className="block text-sm sm:col-span-2">
          <span className="mono text-[#6B6B64]">Note</span>
          <input
            name="note"
            placeholder="Buyer name, order, renewal date…"
            className="mt-1 w-full border border-[#D8D8D2] bg-white px-2 py-1.5"
          />
        </label>

        <div className="sm:col-span-3">
          <button
            type="submit"
            className="bg-[#14171A] px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Generate key
          </button>
        </div>
      </form>

      <form action="/admin/licenses" className="mt-8 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mono text-[#6B6B64]">Search</span>
          <input
            name="q"
            defaultValue={query ?? ""}
            placeholder="note or order email"
            className="mt-1 w-64 border border-[#D8D8D2] bg-white px-2 py-1.5"
          />
        </label>
        {filter ? <input type="hidden" name="status" value={filter} /> : null}
        <button type="submit" className="border border-[#14171A] px-3 py-1.5 text-sm">
          Search
        </button>
      </form>

      <nav aria-label="Filter licenses" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          href={query ? `/admin/licenses?q=${encodeURIComponent(query)}` : "/admin/licenses"}
          className={filter ? "underline text-[#6B6B64]" : "font-medium underline"}
        >
          All
        </Link>
        {LICENSE_STATUSES.map((status) => {
          const search = new URLSearchParams({ status });
          if (query) search.set("q", query);
          return (
            <Link
              key={status}
              href={`/admin/licenses?${search.toString()}`}
              className={filter === status ? "font-medium underline" : "underline text-[#6B6B64]"}
            >
              {status}
            </Link>
          );
        })}
      </nav>

      {licenses.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#D8D8D2] p-10 text-center">
          <p className="text-sm text-[#6B6B64]">
            {total > 0 ? "Nothing on this page." : "No keys yet."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[#E1E1DA] border-y border-[#E1E1DA]">
          {licenses.map((license) => {
            const status = licenseStatus(license);
            const expiresAt = licenseExpiresAt(license);
            const lastSeen = lastSeenByLicense.get(license.id) ?? null;

            return (
              <li key={license.id} className="grid gap-4 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mono truncate text-[#6B6B64]">
                      {license.projectSlugs.length === 0
                        ? "bundle — all projects"
                        : license.projectSlugs.join(", ")}{" "}
                      · {license.type === "permanent" ? "permanent" : `${license.days} days`} ·{" "}
                      up to {license.maxDevices} device(s)
                    </p>
                    <p className="mono mt-1 truncate text-[#6B6B64]">
                      {license.activationCount} activated · first{" "}
                      {formatDate(license.firstActivatedAt)} · expires{" "}
                      {expiresAt ? formatDate(expiresAt) : "never"} · last seen{" "}
                      {formatDate(lastSeen)}
                    </p>
                    <p className="mono mt-1 truncate text-[#6B6B64]">
                      created {formatDate(license.createdAt)}
                      {license.activateBy ? ` · activate before ${formatDate(license.activateBy)}` : ""}
                      {license.note ? ` · ${license.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <Link href={`/admin/licenses?reveal=${license.id}`} className="text-sm underline">
                      Re-show key
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <form action={revokeLicenseAction} className="flex items-end gap-2">
                    <input type="hidden" name="licenseId" value={license.id} />
                    <input type="hidden" name="filterStatus" value={state.status} />
                    <input type="hidden" name="filterQuery" value={state.q} />
                    <input type="hidden" name="filterPage" value={page > 0 ? String(page) : ""} />
                    <input type="hidden" name="revoked" value={license.revokedAt ? "false" : "true"} />
                    {license.revokedAt ? null : (
                      <label className="block text-sm">
                        <span className="mono text-[#6B6B64]">Reason</span>
                        <input
                          name="reason"
                          maxLength={500}
                          className="mt-1 w-40 border border-[#D8D8D2] bg-white px-2 py-1"
                        />
                      </label>
                    )}
                    <button
                      type="submit"
                      className={
                        license.revokedAt
                          ? "border border-[#14171A] px-3 py-1.5 text-sm hover:bg-[#14171A] hover:text-white"
                          : "border border-[#B3261E] px-3 py-1.5 text-sm text-[#B3261E] hover:bg-[#B3261E] hover:text-white"
                      }
                    >
                      {license.revokedAt ? "Un-revoke" : "Revoke"}
                    </button>
                  </form>

                  <form action={extendLicenseAction} className="flex items-end gap-2">
                    <input type="hidden" name="licenseId" value={license.id} />
                    <input type="hidden" name="filterStatus" value={state.status} />
                    <input type="hidden" name="filterQuery" value={state.q} />
                    <input type="hidden" name="filterPage" value={page > 0 ? String(page) : ""} />
                    <label className="block text-sm">
                      <span className="mono text-[#6B6B64]">Extend by</span>
                      <input
                        name="days"
                        defaultValue="30"
                        inputMode="numeric"
                        className="mt-1 w-20 border border-[#D8D8D2] bg-white px-2 py-1 tabular-nums"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={license.type === "permanent"}
                      className="border border-[#D8D8D2] px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Extend
                    </button>
                  </form>

                  <form action={resetDevicesAction}>
                    <input type="hidden" name="licenseId" value={license.id} />
                    <input type="hidden" name="filterStatus" value={state.status} />
                    <input type="hidden" name="filterQuery" value={state.q} />
                    <input type="hidden" name="filterPage" value={page > 0 ? String(page) : ""} />
                    <button
                      type="submit"
                      disabled={license.activationCount === 0}
                      className="border border-[#D8D8D2] px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Reset devices
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {total > 0 ? (
        <nav aria-label="License pages" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="mono text-[#6B6B64]">
            {`${page * PER_PAGE + 1}–${page * PER_PAGE + licenses.length} of ${total}`}
          </span>
          <span className="flex gap-4">
            {page > 0 ? (
              <Link href={pageHref(page - 1)} className="underline">
                Newer
              </Link>
            ) : null}
            {page * PER_PAGE + licenses.length < total ? (
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
          Every key action, newest first — creation, activation, revocation, extension,
          device resets and every time a key was shown.
        </p>

        {events.length === 0 ? (
          <p className="mt-4 border border-dashed border-[#D8D8D2] p-8 text-center text-sm text-[#6B6B64]">
            No key activity yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[#E1E1DA] border-y border-[#E1E1DA]">
            {events.map((event) => (
              <li key={event.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[auto_1fr]">
                <span className="mono text-[#6B6B64]">{formatDate(event.createdAt)}</span>
                <span className="min-w-0">
                  <span className="border border-[#D8D8D2] px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide">
                    {event.action}
                  </span>{" "}
                  <span className="text-[#6B6B64]">
                    {event.actorEmail}
                    {event.detail ? ` — ${event.detail}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
