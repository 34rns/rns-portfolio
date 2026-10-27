export type OrderStatus = "requested" | "contacted" | "paid" | "cancelled";

export const ORDER_STATUSES = [
  "requested",
  "contacted",
  "paid",
  "cancelled",
] as const satisfies readonly OrderStatus[];

/** The preferred way a buyer wants to pay. Free text, offered as a picker. */
export const PAYMENT_METHODS = [
  "bKash",
  "Bank transfer",
  "PayPal",
  "Other",
] as const;

export type OrderProject = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  isPaid: boolean;
  priceCents: number | null;
  currency: string;
  /** Free public download, always visible even on a paid project. */
  downloadUrl: string | null;
};

export type OrderRecord = {
  id: string;
  projectId: string;
  name: string;
  email: string;
  message: string | null;
  method: string | null;
  status: OrderStatus;
  /** Null until an admin agrees an amount with the buyer. */
  amountCents: number | null;
  currency: string;
  notes: string | null;
  tokenHash: string;
  tokenCiphertext: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOrder = {
  projectId: string;
  name: string;
  email: string;
  message: string | null;
  method: string | null;
  amountCents: number | null;
  currency: string;
  tokenHash: string;
  tokenCiphertext: string;
};

export type OrderRow = OrderRecord & {
  projectTitle: string;
  projectSlug: string;
};

export type OrderPatch = {
  status?: OrderStatus;
  notes?: string | null;
  amountCents?: number | null;
  currency?: string;
};

/**
 * Persistence seam for manual orders, kept in the same shape as the payments
 * seam so the order rules can be tested without a database.
 */
export interface OrderStore {
  getProjectBySlug(slug: string): Promise<OrderProject | null>;
  getProjectById(id: string): Promise<OrderProject | null>;
  createOrder(input: NewOrder): Promise<OrderRecord>;
  findOrderByTokenHash(hash: string): Promise<OrderRecord | null>;
  findOrderById(id: string): Promise<OrderRecord | null>;
  updateOrder(id: string, patch: OrderPatch): Promise<void>;
  listOrders(args: {
    status?: OrderStatus;
    query?: string;
    page?: number;
    perPage?: number;
  }): Promise<OrderRow[]>;
  countOrders(args: { status?: OrderStatus; query?: string }): Promise<number>;
}
