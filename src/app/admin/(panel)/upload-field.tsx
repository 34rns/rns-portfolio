"use client";

import { useRef, useState } from "react";
import {
  UPLOAD_POLICY,
  NETLIFY_UPLOAD_CHUNK_BYTES,
  formatBytes,
  validateUpload,
  type UploadKind,
  type ValidatedUpload,
} from "@/lib/uploads/policy";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function uploadDirect(
  file: File,
  bytes: Uint8Array,
  validated: ValidatedUpload,
  onProgress: (percent: number) => void,
): Promise<string> {
  const configResponse = await fetch("/api/admin/upload/config");
  if (!configResponse.ok) throw new Error("Upload configuration is unavailable. Sign in and try again.");
  const config = await configResponse.json();
  if (config.driver === "netlify-blobs") {
    const call = async (body: object) => {
      const response = await fetch("/api/admin/upload/netlify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      return result;
    };
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)));
    const sha256 = Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
    const issued = await call({ name: file.name, type: file.type, size: file.size, head: toBase64(bytes.slice(0, 96)), sha256 });
    for (let offset = 0; offset < file.size; offset += NETLIFY_UPLOAD_CHUNK_BYTES) await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest(); request.open("PUT", issued.uploadUrl); request.setRequestHeader("authorization", `Bearer ${issued.ticket}`);
      request.setRequestHeader("x-upload-part", String(offset / NETLIFY_UPLOAD_CHUNK_BYTES));
      request.upload.addEventListener("progress", event => { if (event.lengthComputable) onProgress(Math.round((offset + event.loaded) / file.size * 90)); });
      request.addEventListener("load", () => request.status >= 200 && request.status < 300 || request.status === 409 ? resolve() : reject(new Error("Upload failed. Try again.")));
      request.addEventListener("error", () => reject(new Error("Upload failed. Check your connection."))); request.send(file.slice(offset, offset + NETLIFY_UPLOAD_CHUNK_BYTES));
    });
    const result = await call({ ticket: issued.ticket }); onProgress(100); return result.url;
  }
  const { upload } = await import("@vercel/blob/client");
  const blob = await upload(validated.key, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload/blob",
    contentType: validated.contentType,
    clientPayload: JSON.stringify({
      name: file.name,
      type: file.type,
      size: file.size,
      head: toBase64(bytes.slice(0, 96)),
    }),
    onUploadProgress: (event) => onProgress(event.percentage),
  });
  return blob.url;
}

function uploadProxy(file: File, onProgress: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/upload");

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      let payload: { url?: string; error?: string } = {};
      try {
        payload = JSON.parse(request.responseText) as typeof payload;
      } catch {
        // Fall through to the generic error below.
      }
      if (request.status >= 200 && request.status < 300 && payload.url) {
        resolve(payload.url);
        return;
      }
      reject(new Error(payload.error ?? "Upload failed."));
    });

    request.addEventListener("error", () => {
      reject(new Error("Upload failed. Check your connection."));
    });

    const body = new FormData();
    body.append("file", file);
    request.send(body);
  });
}

/**
 * Uploads one file and reports where it landed. Shared with the model library,
 * which needs the same direct-to-Blob path for large .glb files.
 */
export async function uploadFile({
  file,
  direct,
  onProgress,
}: {
  file: File;
  direct: boolean;
  onProgress: (percent: number) => void;
}): Promise<{ url: string; size: number }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateUpload({ name: file.name, type: file.type, bytes });
  if (!validated.ok) throw new Error(validated.error);

  const url = direct
    ? await uploadDirect(file, bytes, validated.upload, onProgress)
    : await uploadProxy(file, onProgress);

  return { url, size: bytes.byteLength };
}

export function UploadField({
  kind,
  direct,
  onUploaded,
  buttonLabel,
}: {
  kind: UploadKind;
  direct: boolean;
  onUploaded: (url: string) => void;
  buttonLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const policy = UPLOAD_POLICY[kind];

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError(null);
    setProgress(0);
    setStatus("uploading");
    setFileName(file.name);

    try {
      const { url } = await uploadFile({ file, direct, onProgress: setProgress });

      setProgress(100);
      setStatus("done");
      onUploaded(url);
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const hint =
    kind === "image"
      ? `PNG, JPEG, WEBP, GIF or AVIF — up to ${formatBytes(policy.maxBytes)}`
      : `GLB or self-contained glTF 2.0 — up to ${formatBytes(policy.maxBytes)}`;

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={`flex flex-wrap items-center gap-3 border border-dashed px-3 py-2.5 text-xs ${
          dragging ? "border-[#1B3BFF] bg-[#F2F5FF]" : "border-[#D8D8D2] bg-[#FAFAF7]"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="border border-[#14171A] bg-white px-3 py-1.5 font-medium disabled:opacity-50"
        >
          {status === "uploading"
            ? `Uploading ${progress}%`
            : (buttonLabel ?? `Upload ${kind === "image" ? "image" : "model"}`)}
        </button>

        <span className="min-w-0 flex-1 text-[#6B6B64]">
          {status === "done" && fileName
            ? `${fileName} uploaded`
            : status === "uploading"
              ? "Keep this tab open."
              : "or drop a file here"}
        </span>

        <input
          ref={inputRef}
          type="file"
          accept={policy.accept}
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </div>

      <p className="mt-1.5 text-[0.68rem] leading-relaxed text-[#6B6B64]">{hint}</p>

      {status === "uploading" ? (
        <div className="mt-2 h-1 w-full bg-[#E1E1DA]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-1 bg-[#14171A] transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-[#B3261E]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function MediaField({
  label,
  fieldName,
  kind,
  value,
  onChange,
  direct,
  hint,
}: {
  label: string;
  fieldName: string;
  kind: UploadKind;
  value: string;
  onChange: (value: string) => void;
  direct: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="admin-label" htmlFor={fieldName}>
        {label}
      </label>
      <input
        className="admin-field"
        id={fieldName}
        name={fieldName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={kind === "model" ? "/uploads/model.glb or https://…" : "/uploads/image.png or https://…"}
      />
      {hint ? <p className="mt-1 text-xs text-[#6B6B64]">{hint}</p> : null}
      <div className="mt-2">
        <UploadField
          kind={kind}
          direct={direct}
          onUploaded={onChange}
          buttonLabel={kind === "model" ? "Upload .glb" : "Upload image"}
        />
      </div>
    </div>
  );
}
