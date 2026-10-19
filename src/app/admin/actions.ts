"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";
import { getAllProjects, getProjectById } from "@/lib/db/queries";
import { signIn, signOut } from "@/lib/auth";
import { authRateLimit } from "@/lib/auth/rate-limit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { computeReorder } from "@/lib/projects/order";
import { revalidateProject } from "@/lib/projects/revalidate";
import { slugify } from "@/lib/projects/slug";
import { parseProjectForm } from "@/lib/projects/validation";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = authRateLimit.check(`admin-login:${ip}`);
  if (!limit.allowed) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  try {
    await signIn("admin", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Wrong email or password." };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

export async function saveProject(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = parseProjectForm(formData);

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: parsed.errors };
  }

  const data = parsed.data;
  const slug = slugify(data.slug) || slugify(data.title);
  if (!slug) {
    return { error: "Add a slug.", fieldErrors: { slug: "Add a slug" } };
  }

  const existing = id ? await getProjectById(id) : null;
  if (id && !existing) {
    return { error: "That project no longer exists." };
  }

  const clash = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (clash[0] && clash[0].id !== id) {
    return { error: "That slug is already used.", fieldErrors: { slug: "Already in use" } };
  }

  const publishedAt =
    data.status === "published" ? (existing?.publishedAt ?? new Date()) : null;

  const values = {
    slug,
    title: data.title,
    tagline: data.tagline,
    description: data.description,
    coverImageUrl: data.coverImageUrl || null,
    gallery: data.gallery,
    tags: data.tags,
    liveUrl: data.liveUrl || null,
    repoUrl: data.repoUrl || null,
    year: data.year,
    status: data.status,
    placement: data.placement,
    sortOrder: data.sortOrder,
    theme: data.theme,
    themeOptions: data.themeAccent ? { accent: data.themeAccent } : {},
    isPaid: data.isPaid,
    priceCents: data.isPaid ? data.priceCents : null,
    currency: data.currency,
    providerProductId: data.providerProductId || null,
    deliveryNote: data.isPaid ? data.deliveryNote || null : null,
    updatedAt: new Date(),
    publishedAt,
  };

  if (existing) {
    await db.update(projects).set(values).where(eq(projects.id, existing.id));
    revalidateProject(slug, existing.slug);
  } else {
    await db.insert(projects).values(values);
    revalidateProject(slug);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function togglePublish(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const project = await getProjectById(id);
  if (!project) return;

  const status = project.status === "published" ? "draft" : "published";

  await db
    .update(projects)
    .set({
      status,
      publishedAt: status === "published" ? (project.publishedAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id));

  revalidateProject(project.slug);
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const project = await getProjectById(id);
  if (!project) return;

  await db.delete(projects).where(eq(projects.id, project.id));

  revalidateProject(project.slug);
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
}

export async function moveProject(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "down" ? "down" : "up";
  const all = await getAllProjects();
  const order = computeReorder(
    all.map((project) => project.id),
    id,
    direction,
  );

  await Promise.all(
    order.map((projectId, index) =>
      db
        .update(projects)
        .set({ sortOrder: index })
        .where(eq(projects.id, projectId)),
    ),
  );

  revalidatePath("/");
  revalidatePath("/admin/projects");

  for (const project of all) {
    revalidatePath(`/projects/${project.slug}`);
  }
}
