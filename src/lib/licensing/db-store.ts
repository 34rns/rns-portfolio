import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  licenseActivations,
  licenseEvents,
  licenses,
  orders,
  projects,
} from "@/lib/db/schema";
import { withRetry } from "@/lib/db/queries";
import type {
  ActivationRecord,
  LicenseEvent,
  LicenseEventAction,
  LicensePatch,
  LicenseProject,
  LicenseRecord,
  LicenseStatus,
  LicenseStore,
  NewLicense,
} from "./store";

/**
 * Status is derived, never stored, so it is computed in SQL for filtering and
 * in `licenseStatus` for display. Both must agree on the same three rules.
 */
function statusCondition(status: LicenseStatus): SQL {
  const expired = sql`(
    (
      ${licenses.type} = 'timelimited'
      and ${licenses.firstActivatedAt} is not null
      and ${licenses.firstActivatedAt} + (${licenses.days} * interval '1 day') <= now()
    )
    or (
      ${licenses.firstActivatedAt} is null
      and ${licenses.activateBy} is not null
      and ${licenses.activateBy} <= now()
    )
  )`;

  if (status === "revoked") return sql`${licenses.revokedAt} is not null`;
  if (status === "expired") return sql`(${licenses.revokedAt} is null and ${expired})`;
  if (status === "active") {
    return sql`(${licenses.revokedAt} is null and not ${expired} and ${licenses.activationCount} > 0)`;
  }
  return sql`(${licenses.revokedAt} is null and not ${expired} and ${licenses.activationCount} = 0)`;
}

function searchTerm(query: string) {
  const term = `%${query.trim().replace(/[%_]/g, "")}%`;
  return or(ilike(licenses.note, term), ilike(orders.email, term), ilike(orders.name, term));
}

async function findActivationFor(
  licenseId: string,
  deviceId: string,
): Promise<ActivationRecord | null> {
  const rows = await withRetry(() =>
    db
      .select()
      .from(licenseActivations)
      .where(
        and(
          eq(licenseActivations.licenseId, licenseId),
          eq(licenseActivations.deviceId, deviceId),
        ),
      )
      .limit(1),
  );
  return rows[0] ?? null;
}

export const dbLicenseStore: LicenseStore = {
  async findProjectBySlug(slug): Promise<LicenseProject | null> {
    const rows = await withRetry(() =>
      db
        .select({ slug: projects.slug, status: projects.status })
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1),
    );
    return (rows[0] as LicenseProject | undefined) ?? null;
  },

  async listProjectSlugs() {
    const rows = await withRetry(() =>
      db.select({ slug: projects.slug }).from(projects).orderBy(projects.title),
    );
    return rows.map((row) => row.slug);
  },

  async findLicenseByLookup(hash) {
    const rows = await withRetry(() =>
      db.select().from(licenses).where(eq(licenses.keyLookup, hash)).limit(1),
    );
    return rows[0] ?? null;
  },

  async findLicenseById(id) {
    const rows = await withRetry(() =>
      db.select().from(licenses).where(eq(licenses.id, id)).limit(1),
    );
    return rows[0] ?? null;
  },

  async findLicenseByOrderId(orderId) {
    const rows = await withRetry(() =>
      db.select().from(licenses).where(eq(licenses.orderId, orderId)).limit(1),
    );
    return rows[0] ?? null;
  },

  async listLicensesByOrderIds(orderIds) {
    if (orderIds.length === 0) return [];
    return withRetry(() =>
      db.select().from(licenses).where(inArray(licenses.orderId, orderIds)),
    );
  },

  async createLicense(input: NewLicense) {
    const rows = await withRetry(() => db.insert(licenses).values(input).returning());
    if (!rows[0]) throw new Error("Could not record the license.");
    return rows[0];
  },

  async updateLicense(id, patch: LicensePatch) {
    await withRetry(() =>
      db
        .update(licenses)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(licenses.id, id)),
    );
  },

  findActivation: findActivationFor,

  async createActivation({ licenseId, deviceId, deviceName }) {
    const inserted = await withRetry(() =>
      db
        .insert(licenseActivations)
        .values({ licenseId, deviceId, deviceName })
        .onConflictDoNothing()
        .returning(),
    );
    if (inserted[0]) return { activation: inserted[0], created: true };

    const existing = await findActivationFor(licenseId, deviceId);
    if (!existing) throw new Error("Could not record the activation.");
    return { activation: existing, created: false };
  },

  async touchActivation(id, deviceName) {
    await withRetry(() =>
      db
        .update(licenseActivations)
        .set({ lastSeen: new Date(), ...(deviceName ? { deviceName } : {}) })
        .where(eq(licenseActivations.id, id)),
    );
  },

  /**
   * One statement, so two concurrent activations cannot both take the last
   * slot: Postgres serialises the conditional update on the license row.
   */
  async claimDeviceSlot(licenseId, maxDevices) {
    const rows = await withRetry(() =>
      db
        .update(licenses)
        .set({ activationCount: sql`${licenses.activationCount} + 1` })
        .where(and(eq(licenses.id, licenseId), sql`${licenses.activationCount} < ${maxDevices}`))
        .returning({ id: licenses.id }),
    );
    return rows.length > 0;
  },

  async releaseDeviceSlot(licenseId) {
    await withRetry(() =>
      db
        .update(licenses)
        .set({
          activationCount: sql`greatest(${licenses.activationCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, licenseId)),
    );
  },

  async deleteActivation(licenseId, deviceId) {
    await withRetry(() =>
      db
        .delete(licenseActivations)
        .where(
          and(
            eq(licenseActivations.licenseId, licenseId),
            eq(licenseActivations.deviceId, deviceId),
          ),
        ),
    );
  },

  async listActivations(licenseId): Promise<ActivationRecord[]> {
    return withRetry(() =>
      db
        .select()
        .from(licenseActivations)
        .where(eq(licenseActivations.licenseId, licenseId))
        .orderBy(desc(licenseActivations.lastSeen)),
    );
  },

  async listActivationsForLicenses(licenseIds) {
    if (licenseIds.length === 0) return [];
    return withRetry(() =>
      db
        .select()
        .from(licenseActivations)
        .where(inArray(licenseActivations.licenseId, licenseIds))
        .orderBy(desc(licenseActivations.lastSeen)),
    );
  },

  async resetActivations(licenseId) {
    await withRetry(async () => {
      await db.delete(licenseActivations).where(eq(licenseActivations.licenseId, licenseId));
      await db
        .update(licenses)
        .set({ activationCount: 0, updatedAt: new Date() })
        .where(eq(licenses.id, licenseId));
    });
  },

  async listLicenses({ status, query, page = 0, perPage = 50 }) {
    const rows = await withRetry(() =>
      db
        .select({ license: licenses })
        .from(licenses)
        .leftJoin(orders, eq(licenses.orderId, orders.id))
        .where(
          and(
            status ? statusCondition(status) : undefined,
            query?.trim() ? searchTerm(query) : undefined,
          ),
        )
        .orderBy(desc(licenses.createdAt))
        .limit(perPage)
        .offset(Math.max(0, page) * perPage),
    );
    return rows.map((row) => row.license) satisfies LicenseRecord[];
  },

  async countLicenses({ status, query }) {
    const rows = await withRetry(() =>
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(licenses)
        .leftJoin(orders, eq(licenses.orderId, orders.id))
        .where(
          and(
            status ? statusCondition(status) : undefined,
            query?.trim() ? searchTerm(query) : undefined,
          ),
        ),
    );
    return rows[0]?.value ?? 0;
  },

  async recordEvent({ licenseId, action, actorEmail, detail }) {
    await withRetry(() =>
      db.insert(licenseEvents).values({ licenseId, action, actorEmail, detail }),
    );
  },

  async listEvents(limit = 30): Promise<LicenseEvent[]> {
    return withRetry(() =>
      db.select().from(licenseEvents).orderBy(desc(licenseEvents.createdAt)).limit(limit),
    );
  },
};

export type { LicenseEventAction };
