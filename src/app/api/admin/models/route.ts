import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbModelStore } from "@/lib/models/db-store";
import { cleanModelName, isModelUrl } from "@/lib/models/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Records an already-uploaded .glb/.gltf in the library. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to manage models." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let body: { name?: unknown; url?: unknown; size?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || !isModelUrl(url)) {
    return NextResponse.json(
      { error: "That is not a .glb or .gltf upload." },
      { status: 400 },
    );
  }

  const existing = await dbModelStore.findModelByUrl(url);
  if (existing) {
    return NextResponse.json({ error: "That file is already in the library." }, { status: 409 });
  }

  const size =
    typeof body.size === "number" && Number.isFinite(body.size)
      ? Math.max(0, Math.round(body.size))
      : null;

  const model = await dbModelStore.createModel({
    name: cleanModelName(body.name, "Untitled model"),
    url,
    size,
    contentType: url.toLowerCase().endsWith(".gltf") ? "model/gltf+json" : "model/gltf-binary",
  });

  return NextResponse.json({ model }, { status: 201 });
}
