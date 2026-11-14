import { NextResponse } from "next/server";
import { readLocalUpload } from "@/lib/uploads/storage";
import { readR2File, uploadBucket } from "@/lib/uploads/r2-storage";

export const runtime = "nodejs";

/** Serves the gitignored local upload folder used by the development driver. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  let file;
  try { file = segments[0] === "r2" ? await readR2File(uploadBucket(), segments.slice(1)) : await readLocalUpload(segments); }
  catch { return new NextResponse("Storage unavailable", { status: 503, headers: { "cache-control": "no-store" } }); }

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "content-type": file.contentType,
      "content-length": String(file.data.byteLength),
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
