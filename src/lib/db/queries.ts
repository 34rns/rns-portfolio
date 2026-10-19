import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { projects, type ProjectRecord } from "./schema";

/**
 * Neon's free tier scales to zero. Retries keep the first admin request after
 * idle from failing on a cold start.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

export async function getFeaturedProjects(): Promise<ProjectRecord[]> {
  return withRetry(() =>
    db
      .select()
      .from(projects)
      .where(and(eq(projects.status, "published"), eq(projects.placement, "featured")))
      .orderBy(asc(projects.sortOrder), desc(projects.year)),
  );
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  return withRetry(() =>
    db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.year)),
  );
}

export async function getProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  const rows = await withRetry(() =>
    db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
      .limit(1),
  );
  return rows[0] ?? null;
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const rows = await withRetry(() =>
    db.select().from(projects).where(eq(projects.id, id)).limit(1),
  );
  return rows[0] ?? null;
}

export async function getPublishedProjectSlugs(): Promise<{ slug: string }[]> {
  return withRetry(() =>
    db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder)),
  );
}

export async function getPublishedProjectLinks() {
  return withRetry(() =>
    db
      .select({ slug: projects.slug, title: projects.title, year: projects.year })
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder), desc(projects.year)),
  );
}

export async function getAdminStats() {
  const rows = await withRetry(() =>
    db
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${projects.status} = 'published')::int`,
        drafts: sql<number>`count(*) filter (where ${projects.status} = 'draft')::int`,
        paid: sql<number>`count(*) filter (where ${projects.isPaid} = true)::int`,
      })
      .from(projects),
  );

  return rows[0] ?? { total: 0, published: 0, drafts: 0, paid: 0 };
}
