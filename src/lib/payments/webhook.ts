import type { PaymentStore } from "./store";
import type { PaymentEvent, PaymentProvider, WebhookHeaders } from "./types";

export type WebhookResult = {
  status: 200 | 400 | 401 | 422;
  duplicate?: boolean;
  ignored?: boolean;
  reason?: string;
  purchaseId?: string;
};

/**
 * Verifies, normalises and applies a provider webhook.
 *
 * Ordering matters: the signature is checked before anything is read, metadata
 * is validated before the event is written to the ledger (so a fixable problem
 * still returns an error the provider will retry), and the ledger insert is what
 * makes a repeated delivery a no-op. A client-side "success" is never trusted.
 */
export async function handlePaymentWebhook({
  provider,
  store,
  rawBody,
  headers,
}: {
  provider: PaymentProvider;
  store: PaymentStore;
  rawBody: string;
  headers: WebhookHeaders;
}): Promise<WebhookResult> {
  let verified = false;
  try {
    verified = await provider.verifyWebhook(rawBody, headers);
  } catch {
    verified = false;
  }
  if (!verified) return { status: 401, reason: "invalid-signature" };

  let event: PaymentEvent;
  try {
    event = provider.parseEvent(rawBody);
  } catch {
    return { status: 400, reason: "unparsable-event" };
  }

  if (event.type === "ignored") return { status: 200, ignored: true };
  if (!event.id) return { status: 400, reason: "missing-event-id" };

  const byReference = event.reference
    ? await store.findPurchaseByReference(event.reference)
    : null;
  const byOrder =
    !byReference && event.orderId
      ? await store.findPurchaseByOrder(provider.id, event.orderId)
      : null;
  const existing = byReference ?? byOrder;

  let project: Awaited<ReturnType<PaymentStore["getProjectBySlug"]>> = null;
  if (!existing) {
    if (event.type !== "payment.succeeded") {
      await store.recordWebhookEvent({
        provider: provider.id,
        eventId: event.id,
        type: event.type,
      });
      return { status: 200, ignored: true };
    }

    if (!event.projectSlug || !event.userId) {
      return { status: 422, reason: "missing-metadata" };
    }

    project = await store.getProjectBySlug(event.projectSlug);
    if (!project || !(await store.userExists(event.userId))) {
      return { status: 422, reason: "unknown-metadata" };
    }
  }

  const fresh = await store.recordWebhookEvent({
    provider: provider.id,
    eventId: event.id,
    type: event.type,
  });
  if (!fresh) return { status: 200, duplicate: true };

  if (existing?.status === "refunded" && event.type === "payment.succeeded") {
    // A refund is final for that order; a new purchase gets a new reference.
    return { status: 200, ignored: true, purchaseId: existing.id };
  }

  if (event.type === "payment.succeeded") {
    if (existing) {
      await store.updatePurchase(existing.id, {
        status: "paid",
        providerOrderId: event.orderId ?? existing.providerOrderId,
        amountCents: event.amountCents ?? existing.amountCents,
        currency: event.currency ?? existing.currency,
      });
      return { status: 200, purchaseId: existing.id };
    }

    const created = await store.createPurchase({
      reference: event.reference ?? event.id,
      userId: event.userId as string,
      projectId: (project as NonNullable<typeof project>).id,
      provider: provider.id,
      providerOrderId: event.orderId,
      status: "paid",
      amountCents: event.amountCents ?? (project as NonNullable<typeof project>).priceCents ?? 0,
      currency:
        event.currency ?? (project as NonNullable<typeof project>).currency,
    });
    return { status: 200, purchaseId: created.id };
  }

  if (!existing) return { status: 200, ignored: true };

  await store.updatePurchase(existing.id, {
    status: event.type === "payment.refunded" ? "refunded" : "failed",
  });
  return { status: 200, purchaseId: existing.id };
}
