import type { PaymentStore } from "./store";
import type { PaymentProvider } from "./types";

export type CheckoutResult =
  | { ok: true; url: string; reference: string }
  | { ok: false; status: 400 | 403 | 404; error: string };

export type CheckoutUser = {
  id: string;
  email: string;
};

/**
 * Creates the pending purchase first, then asks the provider for a checkout.
 * The reference we generate is the thread the webhook follows back to the row,
 * so the grant never depends on the browser returning to the success URL.
 */
export async function startCheckout({
  store,
  provider,
  user,
  slug,
  origin,
  reference,
}: {
  store: PaymentStore;
  provider: PaymentProvider;
  user: CheckoutUser;
  slug: string;
  origin: string;
  reference?: string;
}): Promise<CheckoutResult> {
  const project = await store.getProjectBySlug(slug);
  if (!project || project.status !== "published") {
    return { ok: false, status: 404, error: "That project is not available." };
  }
  if (!project.isPaid || !project.priceCents || project.priceCents <= 0) {
    return { ok: false, status: 400, error: "This project is not for sale." };
  }
  if (!project.providerProductId) {
    return { ok: false, status: 400, error: "This project has no product configured yet." };
  }
  if (!(await store.userExists(user.id))) {
    return { ok: false, status: 403, error: "Sign in with a visitor account to buy." };
  }

  const ref = reference ?? `chk_${globalThis.crypto.randomUUID()}`;

  await store.createPurchase({
    reference: ref,
    userId: user.id,
    projectId: project.id,
    provider: provider.id,
    providerOrderId: provider.id === "mock" ? ref : null,
    status: "pending",
    amountCents: project.priceCents,
    currency: project.currency,
  });

  try {
    const session = await provider.createCheckout({
      reference: ref,
      productId: project.providerProductId,
      email: user.email,
      userId: user.id,
      projectSlug: project.slug,
      amountCents: project.priceCents,
      currency: project.currency,
      successUrl: `${origin}/account/purchases?paid=1`,
      cancelUrl: `${origin}/projects/${project.slug}?payment=cancelled`,
    });

    return { ok: true, url: session.url, reference: ref };
  } catch (error) {
    const pending = await store.findPurchaseByReference(ref);
    if (pending) {
      await store.updatePurchase(pending.id, { status: "failed" });
    }
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return { ok: false, status: 400, error: message };
  }
}
