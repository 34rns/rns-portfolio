import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbModelStore } from "@/lib/models/db-store";
import { replaceModelFile } from "@/lib/models/service";
import { isModelUrl } from "@/lib/models/validate";
import { revalidateProject } from "@/lib/projects/revalidate";

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
      : null;

  const result = await replaceModelFile(dbModelStore, { id, url, size });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.reassigned > 0) {
    const usage = await dbModelStore.listModelUsage();
    for (const slug of new Set(usage.map((entry) => entry.projectSlug))) {
      revalidateProject(slug);
    }
  }

  return NextResponse.json({ ok: true, reassigned: result.reassigned });
}
