"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UPLOAD_POLICY, formatBytes } from "@/lib/uploads/policy";
import { uploadFile } from "../upload-field";

/**
 * Uploads a .glb/.gltf and records it in the library in one step.
 *
 * `replace` sends the new file to the same model row and the server rewrites
 * every project that pointed at the old URL, so replacing a file never leaves a
 * project with a dead reference.
 */
export function ModelUploader({
  direct,
  mode,
  modelId,
  modelName,
}: {
  direct: boolean;
  mode: "create" | "replace";
  modelId?: string;
  modelName?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "error" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setMessage(null);

    try {
      const { url, size } = await uploadFile({ file, direct, onProgress: setProgress });

      setStatus("saving");
      const response =
        mode === "create"
          ? await fetch("/api/admin/models", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                name: modelName?.trim() || file.name.replace(/\.[^.]+$/, ""),
                url,
                size,
              }),
            })
          : await fetch(`/api/admin/models/${modelId}`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ action: "replace", url, size }),
            });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        reassigned?: number;
      };

      if (!response.ok) throw new Error(payload.error ?? "The model could not be saved.");

      setStatus("done");
      setMessage(
        mode === "replace"
          ? `File replaced${payload.reassigned ? ` · ${payload.reassigned} project(s) updated` : ""}.`
          : "Added to the library.",
      );
      router.refresh();
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "The model could not be saved.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const policy = UPLOAD_POLICY.model;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading" || status === "saving"}
          className="border border-[#14171A] bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {status === "uploading"
            ? `Uploading ${progress}%`
            : status === "saving"
              ? "Saving…"
              : mode === "create"
                ? "Upload model"
                : "Replace file"}
        </button>
        <span className="text-xs text-[#6B6B64]">
          GLB or self-contained glTF 2.0 — up to {formatBytes(policy.maxBytes)}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={policy.accept}
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </div>

      {status === "uploading" ? (
        <div className="mt-2 h-1 w-full bg-[#E1E1DA]">
          <div className="h-1 bg-[#14171A]" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-2 text-xs ${status === "error" ? "text-[#B3261E]" : "text-[#6B6B64]"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
