import { asc, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { models, projects } from "@/lib/db/schema";
import { withRetry } from "@/lib/db/queries";
import type { ModelRecord, ModelStore, ModelUsage, ProjectModelOption } from "./store";

export const dbModelStore: ModelStore = {
  async listModels() {
    return withRetry(() =>
      db.select().from(models).orderBy(desc(models.createdAt)),
    );
  },

  async listProjectModelOptions(): Promise<ProjectModelOption[]> {
    return withRetry(() =>
      db
        .select({
          id: projects.id,
          title: projects.title,
          slug: projects.slug,
          modelUrl: projects.modelUrl,
        })
        .from(projects)
        .orderBy(asc(projects.title)),
    );
  },

  async findModel(id) {
    const rows = await withRetry(() => db.select().from(models).where(eq(models.id, id)).limit(1));
    return rows[0] ?? null;
  },

  async findModelByUrl(url) {
    const rows = await withRetry(() => db.select().from(models).where(eq(models.url, url)).limit(1));
    return rows[0] ?? null;
  },

  async createModel(input) {
    const rows = await withRetry(() => db.insert(models).values(input).returning());
    if (!rows[0]) throw new Error("Could not record the model.");
    return rows[0];
  },

  async updateModel(id, patch) {
    await withRetry(() =>
      db
        .update(models)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(models.id, id)),
    );
  },

  async deleteModel(id) {
    await withRetry(() => db.delete(models).where(eq(models.id, id)));
  },

  async listModelUsage(): Promise<ModelUsage[]> {
    return withRetry(() =>
      db
        .select({
          url: sql<string>`${projects.modelUrl}`,
          projectId: projects.id,
          projectTitle: projects.title,
          projectSlug: projects.slug,
        })
        .from(projects)
        .where(isNotNull(projects.modelUrl)),
    );
  },

  async reassignModelUrl(oldUrl, newUrl) {
    const rows = await withRetry(() =>
      db
        .update(projects)
        .set({ modelUrl: newUrl, updatedAt: new Date() })
        .where(eq(projects.modelUrl, oldUrl))
        .returning({ id: projects.id }),
    );
    return rows.length;
  },

  async clearModelUrl(url) {
    const rows = await withRetry(() =>
      db
        .update(projects)
        .set({ modelUrl: null, updatedAt: new Date() })
        .where(eq(projects.modelUrl, url))
        .returning({ id: projects.id }),
    );
    return rows.length;
  },
};

export type { ModelRecord };
