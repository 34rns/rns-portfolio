import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { site } from "@/content/site";
import { dbLicenseStore } from "@/lib/licensing/db-store";
import { dbOrderStore } from "@/lib/orders/db-store";
import { orderProgress } from "@/lib/orders/service";
import { buildInstallSteps } from "@/lib/orders/template";
import { normalizeOrderToken, orderTokenHash } from "@/lib/orders/token";
import { formatPrice } from "@/lib/projects/view";
import { decryptValue } from "@/lib/security/secrets";

export const dynamic = "force-dynamic";

/**
 * Private to whoever holds the link: no account, no email, and never indexed.
 * The token is the credential, so a bad token is a plain 404 with no hint that
 * anything exists.
 */
export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false, nocache: true },
};

function formatDate(value: Date) {
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const normalized = normalizeOrderToken(token);
  if (!normalized) notFound();

  const order = await dbOrderStore.findOrderByTokenHash(orderTokenHash(normalized));
  if (!order) notFound();

  const project = await dbOrderStore.getProjectById(order.projectId);
  const license = order.status === "paid" ? await dbLicenseStore.findLicenseByOrderId(order.id) : null;

  let key: string | null = null;
  if (license) {
    try {
      key = decryptValue(license.keyCiphertext);
    } catch {
      key = null;
    }
  }

  const { steps, cancelled } = orderProgress(order.status);
  const amount = order.amountCents != null ? formatPrice(order.amountCents, order.currency) : null;

  return (
    <main className="mx-auto max-w-[720px] px-5 py-12 md:px-8 md:py-16">
      <p className="mono text-[#6B6B64]">
        {site.name} · order {order.id.slice(0, 8)}
      </p>
      <h1 className="display mt-2 text-[2rem] font-medium tracking-tight">
        {project?.title ?? "Your order"}
      </h1>
      <p className="mt-2 text-sm text-[#6B6B64]">
        Requested {formatDate(order.createdAt)}
        {order.method ? ` · ${order.method}` : ""}
        {amount ? ` · ${amount}` : ""}
      </p>

      {cancelled ? (
        <p className="mt-6 border border-[#E9C6C2] bg-[#FBF1F0] px-4 py-3 text-sm text-[#8C1D16]">
          This order was cancelled. Reply to whichever message thread we used and I
          can pick it up again.
        </p>
      ) : (
        <ol className="mt-8 grid gap-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`border-l-2 pl-4 ${
                step.done ? "border-[#14171A]" : "border-[#D8D8D2]"
              }`}
            >
              <p className={step.done ? "text-sm font-medium" : "text-sm text-[#6B6B64]"}>
                {step.label}
              </p>
              <p className="mt-0.5 text-sm text-[#6B6B64]">{step.blurb}</p>
            </li>
          ))}
        </ol>
      )}

      {key ? (
        <section className="mt-10 border border-[#14171A] p-5">
          <h2 className="mono text-[#6B6B64]">Your license key</h2>
          <p className="mt-3 break-all font-mono text-[1.15rem] tracking-tight">{key}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <CopyButton value={key} label="Copy key" className="bg-[#14171A] px-4 py-2 text-sm text-white" />
            <span className="text-sm text-[#6B6B64]">
              Activates up to {license?.maxDevices} device(s)
              {license?.type === "permanent" ? " · never expires" : ""}
              {license?.type === "timelimited" && license.days
                ? ` · ${license.days} days from first activation`
                : ""}
            </span>
          </div>

          <h3 className="mt-7 text-sm font-medium">How to activate</h3>
          <ol className="mt-2 grid gap-1.5 text-sm text-[#3D3D39]">
            {buildInstallSteps(project?.title ?? "the app").map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </section>
      ) : order.status === "paid" ? (
        <p className="mt-10 border border-[#D8D8D2] px-4 py-3 text-sm">
          Payment is confirmed. Your key is being prepared and will appear here as
          soon as it is generated.
        </p>
      ) : null}

      <section className="mt-10 grid gap-4 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="mono text-[#6B6B64]">Project</span>
          {project && project.status === "published" ? (
            <Link href={`/projects/${project.slug}`} className="underline">
              {project.title}
            </Link>
          ) : (
            <span>{project?.title ?? "Unavailable"}</span>
          )}
        </div>

        {project?.downloadUrl ? (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="mono text-[#6B6B64]">Free download</span>
            <a href={project.downloadUrl} className="underline">
              Download the app
            </a>
          </div>
        ) : null}

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="mono text-[#6B6B64]">Name</span>
          <span>{order.name}</span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="mono text-[#6B6B64]">Email</span>
          <span>{order.email}</span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="mono text-[#6B6B64]">Status</span>
          <span className="uppercase tracking-wide">{order.status}</span>
        </div>

        {order.message ? (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="mono text-[#6B6B64]">Your note</span>
            <span className="whitespace-pre-wrap">{order.message}</span>
          </div>
        ) : null}
      </section>

      <section className="mt-10 border-t border-[#E1E1DA] pt-5">
        <h2 className="text-sm font-medium">Keep this link</h2>
        <p className="mt-1 text-sm text-[#6B6B64]">
          It is the only way back to this page — no account, no password. Bookmark
          it or copy it somewhere safe; anyone with the link can read it.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CopyButton value={`${site.name} order: ${normalized}`} label="Copy order token" />
          <span className="mono break-all text-[#6B6B64]">{normalized}</span>
        </div>
      </section>
    </main>
  );
}
