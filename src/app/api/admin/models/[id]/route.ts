import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbModelStore } from "@/lib/models/db-store";
import { isModelUrl } from "@/lib/models/validate";
import { revalidateProject } from "@/lib/projects/revalidate";
import { deleteStoredFile } from "@/lib/uploads/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Replaces the file behind an existing library entry.
 *
 * Order matters: the row moves to the new URL, every project that pointed at the
 * old one is rewritten, and only then is the old file deleted. A failure part way
 * through leaves the old file in place instead of a broken reference.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to manage models." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;
  const model = await dbModelStore.findModel(id);
  if (!model) {
    return NextResponse.json({ error: "That model no longer exists." }, { status: 404 });
  }

  let body: { action?: unknown; url?: unknown; size?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.action !== "replace") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || !isModelUrl(url)) {
    return NextResponse.json({ error: "That is not a .glb or .gltf upload." }, { status: 400 });
  }

  const size =
    typeof body.size === "number" && Number.isFinite(body.size)
      ? Math.max(0, Math.round(body.size))
      : model.size;

  const oldUrl = model.url;
  await dbModelStore.updateModel(model.id, { url, size });

  let reassigned = 0;
  if (oldUrl !== url) {
    reassigned = await dbModelStore.reassignModelUrl(oldUrl, url);

    const usage = await dbModelStore.listModelUsage();
    for (const slug of new Set(usage.map((entry) => entry.projectSlug))) {
      revalidateProject(slug);
    }

    try {
      await deleteStoredFile(oldUrl);
    } catch (error) {
      // The swap already succeeded; a leftover file is a cleanup problem, not a
      // broken site, so it is reported rather than rolled back.
      console.error("model file cleanup failed", error);
    }
  }

  return NextResponse.json({ ok: true, reassigned });
}
