import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UPLOAD_POLICY, validateUploadToken } from "@/lib/uploads/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Token exchange for direct browser -> Blob uploads. Vercel Functions cap a
 * proxied body at 4.5 MB, so big GLBs never touch this route; it only signs an
 * upload after checking the admin session, extension, size and file signature.
 */
type ClientPayload = {
  name?: string;
  type?: string;
  size?: number;
  head?: string;
};

export async function POST(request: Request) {
  // Check the session before touching Blob so a missing token cannot turn into
  // a configuration error for signed-out callers.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to upload." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Upload could not be read." }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user) throw new Error("Sign in to upload.");
        if (session.user.role !== "admin") throw new Error("Admins only.");

        let payload: ClientPayload = {};
        try {
          payload = JSON.parse(clientPayload ?? "{}") as ClientPayload;
        } catch {
          payload = {};
        }

        const head = payload.head
          ? new Uint8Array(Buffer.from(payload.head, "base64"))
          : new Uint8Array();

        const result = validateUploadToken({
          name: payload.name ?? pathname,
          type: payload.type,
          size: payload.size ?? 0,
          head,
        });
        if (!result.ok) throw new Error(result.error);

        return {
          allowedContentTypes: [result.upload.contentType],
          maximumSizeInBytes: UPLOAD_POLICY[result.upload.kind].maxBytes,
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload was refused." },
      { status: 400 },
    );
  }
}
