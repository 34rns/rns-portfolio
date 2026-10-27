import { z } from "zod";
import { encryptValue, SecretNotConfiguredError } from "@/lib/security/secrets";
import { generateOrderToken, orderTokenHash } from "./token";
import {
  ORDER_STATUSES,
  type OrderRecord,
  type OrderStatus,
  type OrderStore,
} from "./store";

export const orderRequestSchema = z.object({
  slug: z.string().trim().min(1, "Missing project").max(120),
  name: z.string().trim().min(1, "Add your name").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .pipe(z.email("Enter a valid email address")),
  message: z.string().trim().max(2000).optional(),
  method: z.string().trim().max(60).optional(),
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/**
 * A form filled faster than this is a script, not a person. A timestamp in the
 * future is ignored rather than punished: browser clocks drift, and refusing a
 * real buyer over a few minutes of skew would cost more than the spam it stops.
 */
export const MIN_FILL_MS = 1500;
export const MAX_FILL_MS = 24 * 60 * 60 * 1000;

export type GuardResult =
  | { ok: true }
  | { ok: false; reason: "honeypot" | "too-fast" | "too-old" };

export function checkSubmissionGuards({
  website,
  renderedAt,
  now = Date.now(),
}: {
  website?: string | null;
  renderedAt?: number | null;
  now?: number;
}): GuardResult {
  // The field is hidden from people and visible to form-filling bots.
  if (website && website.trim()) return { ok: false, reason: "honeypot" };

  const stamp = Number(renderedAt);
  if (!Number.isFinite(stamp) || stamp <= 0) return { ok: false, reason: "too-fast" };

  const age = now - stamp;
  if (age > MAX_FILL_MS) return { ok: false, reason: "too-old" };
  if (age >= 0 && age < MIN_FILL_MS) return { ok: false, reason: "too-fast" };

  return { ok: true };
}

export type RequestOrderResult =
  | { ok: true; order: OrderRecord; token: string }
  | { ok: false; status: 400 | 404 | 503; error: string };

/**
 * Creates the buyer's order and the private token that addresses it. No account
 * and no email are involved: the token is the whole credential, so a failure to
 * generate or store it must refuse the request rather than hand back a link
 * that cannot be opened later.
 */
export async function requestProOrder({
  store,
  input,
  token = generateOrderToken(),
}: {
  store: OrderStore;
  input: OrderRequestInput;
  /** Injected by tests; production always generates a fresh one. */
  token?: string;
}): Promise<RequestOrderResult> {
  const project = await store.getProjectBySlug(input.slug);
  if (!project || project.status !== "published" || !project.isPaid) {
    return { ok: false, status: 404, error: "That project is not taking requests." };
  }

  let tokenCiphertext: string;
  try {
    tokenCiphertext = encryptValue(token);
  } catch (error) {
    if (error instanceof SecretNotConfiguredError) {
      return { ok: false, status: 503, error: error.message };
    }
    throw error;
  }

  const order = await store.createOrder({
    projectId: project.id,
    name: input.name,
    email: input.email,
    message: input.message?.trim() ? input.message.trim() : null,
    method: input.method?.trim() ? input.method.trim() : null,
    // The asking price is recorded; the agreed amount is what an admin sets
    // later, so the buyer's page never claims a total nobody confirmed.
    amountCents: project.priceCents ?? null,
    currency: project.currency,
    tokenHash: orderTokenHash(token),
    tokenCiphertext,
  });

  return { ok: true, order, token };
}

/** `"12.5"` -> 1250, `""` -> null (cleared), anything else -> invalid. */
export function parseAmountToCents(value: string): number | null | undefined {
  const trimmed = value.trim().replace(/[, ]/g, "");
  if (!trimmed) return null;

  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000) return undefined;

  return Math.round(amount * 100);
}

export function normalizeCurrency(value: string): string | null {
  const code = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

export type OrderUpdateResult =
  | { ok: true; order: OrderRecord }
  | { ok: false; status: 400 | 404; error: string };

/**
 * Notes, agreed amount and status. Changing the status here is what the buyer
 * sees on `/order/<token>`, so every value is validated before it is written.
 */
export async function updateOrder({
  store,
  id,
  status,
  notes,
  amountCents,
  currency,
}: {
  store: OrderStore;
  id: string;
  status?: string;
  notes?: string;
  amountCents?: number | null;
  currency?: string;
}): Promise<OrderUpdateResult> {
  const order = await store.findOrderById(id);
  if (!order) return { ok: false, status: 404, error: "That order no longer exists." };

  const patch: Parameters<OrderStore["updateOrder"]>[1] = {};

  if (status !== undefined) {
    if (!isOrderStatus(status)) {
      return { ok: false, status: 400, error: "Unknown order status." };
    }
    patch.status = status;
  }

  if (notes !== undefined) patch.notes = notes.trim().slice(0, 2000) || null;

  if (amountCents !== undefined) {
    if (amountCents !== null && (amountCents < 0 || amountCents > 10_000_000)) {
      return { ok: false, status: 400, error: "That amount is out of range." };
    }
    patch.amountCents = amountCents;
  }

  if (currency !== undefined) {
    const code = normalizeCurrency(currency);
    if (!code) return { ok: false, status: 400, error: "Use a 3-letter currency code." };
    patch.currency = code;
  }

  await store.updateOrder(order.id, patch);
  return { ok: true, order: { ...order, ...patch, updatedAt: new Date() } };
}

export type OrderStep = {
  id: "requested" | "contacted" | "paid";
  label: string;
  blurb: string;
  done: boolean;
  current: boolean;
};

const STEPS: { id: OrderStep["id"]; label: string; blurb: string }[] = [
  {
    id: "requested",
    label: "Request received",
    blurb: "Your request is in the queue.",
  },
  {
    id: "contacted",
    label: "In contact",
    blurb: "Payment details have been arranged with you.",
  },
  {
    id: "paid",
    label: "Paid",
    blurb: "Payment confirmed. Your key is below.",
  },
];

/** The buyer's progress rail. `cancelled` short-circuits the three happy stages. */
export function orderProgress(status: OrderStatus): {
  steps: OrderStep[];
  cancelled: boolean;
} {
  const index = status === "cancelled" ? -1 : STEPS.findIndex((step) => step.id === status);

  return {
    cancelled: status === "cancelled",
    steps: STEPS.map((step, position) => ({
      ...step,
      done: index >= 0 && position <= index,
      current: position === index,
    })),
  };
}
