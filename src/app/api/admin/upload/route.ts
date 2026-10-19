import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UPLOAD_POLICY, validateUpload } from "@/lib/uploads/policy";
import { getStorage } from "@/lib/uploads/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = UPLOAD_POLICY.model.maxBytes + 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to upload." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "That file is too large." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload could not be read." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = validateUpload({ name: file.name, type: file.type, bytes });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const stored = await getStorage().put({
      key: result.upload.key,
      data: bytes,
      contentType: result.upload.contentType,
    });

    return NextResponse.json(
      {
        url: stored.url,
        key: stored.key,
        size: stored.size,
        kind: result.upload.kind,
        contentType: stored.contentType,
        driver: stored.driver,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("upload failed", error);
    return NextResponse.json(
      { error: "The file could not be stored. Try again." },
      { status: 500 },
    );
  }
}
