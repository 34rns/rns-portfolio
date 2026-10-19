import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildEntitlement } from "@/lib/payments/access";
import { dbStore } from "@/lib/payments/db-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Purchase state is fetched by the client so project pages stay static. Only a
 * `paid` purchase returns the live URL or the delivery note.
 */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return NextResponse.json({ error: "Missing project." }, { status: 400 });
  }

  const project = await dbStore.getProjectBySlug(slug);
  if (!project || project.status !== "published") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const session = await auth();
  const purchase = session?.user?.id
    ? await dbStore.findEntitlement(session.user.id, project.id)
    : null;

  const entitlement = buildEntitlement({
    project,
    purchase,
    authenticated: Boolean(session?.user),
  });

  return NextResponse.json(entitlement, {
    headers: { "cache-control": "private, no-store" },
  });
}
