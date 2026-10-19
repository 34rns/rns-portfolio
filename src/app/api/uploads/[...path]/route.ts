import { NextResponse } from "next/server";
import { readLocalUpload } from "@/lib/uploads/storage";

export const runtime = "nodejs";

/** Serves the gitignored local upload folder used by the development driver. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const file = await readLocalUpload(segments);

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
