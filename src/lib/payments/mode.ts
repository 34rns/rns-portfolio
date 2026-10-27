import { isProductionRuntime } from "./types";

/**
 * How paid projects are sold.
 *
 * `manual` is the production default: the buyer sends a request, payment is
 * confirmed by hand, and a license key is handed over. `provider` keeps the
 * automated checkout for polar/lemonsqueezy, and `mock` is the simulated,
 * local-only checkout.
 */
export type PaymentMode = "manual" | "provider" | "mock";

export function paymentMode(value = process.env.PAYMENT_PROVIDER): PaymentMode {
  const slug = (value ?? "").trim().toLowerCase();

  if (slug === "manual") return "manual";
  if (!slug || slug === "mock") {
    // An unconfigured deployment takes orders by hand rather than falling back
    // to a provider that signs its own webhooks.
    return isProductionRuntime() ? "manual" : "mock";
  }
  return "provider";
}

/** True when the paid project page should show the Request Pro form. */
export function manualPaymentsEnabled(value = process.env.PAYMENT_PROVIDER): boolean {
  return paymentMode(value) === "manual";
}
