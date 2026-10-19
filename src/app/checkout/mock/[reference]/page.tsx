import Link from "next/link";
import { notFound } from "next/navigation";
import { dbStore } from "@/lib/payments/db-store";
import { mockEventBody, signMockPayload } from "@/lib/payments/mock";
import { formatPrice } from "@/lib/projects/view";
import { MockCheckout } from "./mock-checkout";

export const dynamic = "force-dynamic";

/**
 * Stand-in for a hosted checkout. The buttons post signed events to the real
 * webhook endpoint, so success is granted by the same server-side path a live
 * provider would use — never by this page.
 */
export default async function MockCheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const purchase = await dbStore.findPurchaseByReference(reference);

  if (!purchase || purchase.provider !== "mock") notFound();

  const project = await dbStore.getProjectById(purchase.projectId);
  if (!project) notFound();

  const base = {
    reference,
    amountCents: purchase.amountCents,
    currency: purchase.currency,
    email: "",
    userId: purchase.userId,
    projectSlug: project.slug,
  };

  const successBody = mockEventBody({
    ...base,
    type: "payment.succeeded",
    id: `evt_mock_${crypto.randomUUID()}`,
  });
  const failedBody = mockEventBody({
    ...base,
    type: "payment.failed",
    id: `evt_mock_${crypto.randomUUID()}`,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-center px-5 py-16">
      <p className="mono text-[#6B6B64]">Mock provider · local testing only</p>
      <h1 className="display mt-3 text-[2.2rem] font-medium">{project.title}</h1>
      <p className="mt-2 text-[#4A4A44]">
        {formatPrice(purchase.amountCents, purchase.currency)} · no money moves.
      </p>

      {purchase.status === "paid" ? (
        <div className="mt-8 border border-[#CFE3D4] bg-[#F0F7F1] p-5">
          <p className="text-sm">This purchase is already paid.</p>
          <Link href={`/projects/${project.slug}`} className="mt-3 inline-block underline">
            Back to the project
          </Link>
        </div>
      ) : (
        <MockCheckout
          slug={project.slug}
          successBody={successBody}
          successSignature={signMockPayload(successBody)}
          failedBody={failedBody}
          failedSignature={signMockPayload(failedBody)}
        />
      )}

      <p className="mt-8 text-xs leading-relaxed text-[#6B6B64]">
        Both buttons send an HMAC-signed event to
        <span className="mono"> /api/webhooks/payments/mock</span>. The grant is
        written by the webhook handler, not by this page.
      </p>
    </main>
  );
}
