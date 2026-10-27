import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { ModelStage } from "@/components/model-stage/model-stage";
import { dbModelStore } from "@/lib/models/db-store";
import { describeUsage } from "@/lib/models/store";
import { directUploadsEnabled, storageReady } from "@/lib/uploads/storage";
import { formatBytes } from "@/lib/uploads/policy";
import { ConfirmButton } from "../../confirm-button";
import { deleteModelAction, renameModelAction } from "./actions";
import { ModelUploader } from "./model-uploader";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ notice?: string; error?: string; delete?: string }>;

function formatDate(value: Date) {
  return value.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ModelsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [models, usage] = await Promise.all([
    dbModelStore.listModels(),
    dbModelStore.listModelUsage(),
  ]);

  const pending = params.delete ? models.find((model) => model.id === params.delete) ?? null : null;
  const pendingUsage = pending ? describeUsage(usage, pending.url) : [];
  const direct = directUploadsEnabled();

  return (
    <div>
      <header>
        <h1 className="text-2xl font-medium tracking-tight">3D models</h1>
        <p className="mt-1 text-sm text-[#6B6B64]">
          One library for every project. Assign a model on the project form; deleting
          a file that a project still shows asks first.
        </p>
      </header>

      {!storageReady() ? (
        <p className="mt-5 border border-[#E9C6C2] bg-[#FBF1F0] px-4 py-3 text-sm text-[#8C1D16]">
          Storage is not configured in this environment, so uploads and deletions
          cannot run here.
        </p>
      ) : null}

      {params.notice ? (
        <p className="mt-5 border border-[#CFE3D4] bg-[#F0F7F1] px-4 py-3 text-sm">
          {params.notice}
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border border-[#E9C6C2] bg-[#FBF1F0] px-4 py-3 text-sm text-[#8C1D16]">
          {params.error}
        </p>
      ) : null}

      {pending ? (
        <section className="mt-5 border border-[#E9C6C2] bg-[#FBF1F0] p-5">
          <h2 className="text-sm font-medium">Delete “{pending.name}”?</h2>
          {pendingUsage.length > 0 ? (
            <>
              <p className="mt-2 text-sm">
                {pendingUsage.length === 1 ? "1 project uses" : `${pendingUsage.length} projects use`}{" "}
                this file. Deleting it removes the 3D model from{" "}
                {pendingUsage.length === 1 ? "that project" : "those projects"} — each one
                falls back to its cover image.
              </p>
              <ul className="mt-2 grid gap-1 text-sm">
                {pendingUsage.map((entry) => (
                  <li key={entry.projectId}>
                    <Link href={`/admin/projects/${entry.projectId}`} className="underline">
                      {entry.projectTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm">No project uses this file. Nothing else changes.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <form action={deleteModelAction}>
              <input type="hidden" name="modelId" value={pending.id} />
              {pendingUsage.length > 0 ? <input type="hidden" name="force" value="on" /> : null}
              <ConfirmButton
                message={`Delete ${pending.name}? The stored file is removed for good.`}
                className="bg-[#B3261E] px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Delete the file
              </ConfirmButton>
            </form>
            <Link href="/admin/models" className="text-sm underline">
              Keep it
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-8 border border-[#E1E1DA] bg-white p-5">
        <h2 className="text-sm font-medium">Add a model</h2>
        <p className="mt-1 text-sm text-[#6B6B64]">
          The file name becomes the model name; rename it below once it is in.
        </p>
        <div className="mt-4">
          <ModelUploader direct={direct} mode="create" />
        </div>
      </section>

      {models.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#D8D8D2] p-10 text-center">
          <p className="text-sm text-[#6B6B64]">No models yet.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5">
          {models.map((model) => {
            const used = describeUsage(usage, model.url);
            return (
              <li
                key={model.id}
                className="grid gap-5 border border-[#E1E1DA] bg-white p-5 md:grid-cols-[200px_minmax(0,1fr)]"
              >
                <div className="border border-[#E1E1DA] bg-[#0E0E12]">
                  <ModelStage
                    modelUrl={model.url}
                    lighting="studio"
                    scale={1}
                    offset={[0, 0, 0]}
                    title={model.name}
                    className="h-40 w-full"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="min-w-0">
                    <form action={renameModelAction} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="modelId" value={model.id} />
                      <label className="block text-sm">
                        <span className="mono text-[#6B6B64]">Name</span>
                        <input
                          name="name"
                          defaultValue={model.name}
                          maxLength={120}
                          className="mt-1 w-64 border border-[#D8D8D2] bg-white px-2 py-1.5"
                        />
                      </label>
                      <button type="submit" className="border border-[#D8D8D2] px-3 py-1.5 text-sm">
                        Rename
                      </button>
                    </form>

                    <p className="mono mt-2 truncate text-[#6B6B64]">
                      {model.size != null ? formatBytes(model.size) : "size unknown"} · uploaded{" "}
                      {formatDate(model.createdAt)} · {model.url}
                    </p>

                    <p className="mt-1 text-sm">
                      <span className="mono text-[#6B6B64]">Used by </span>
                      {used.length === 0 ? (
                        <span className="text-[#6B6B64]">no project</span>
                      ) : (
                        used.map((entry, index) => (
                          <span key={entry.projectId}>
                            {index > 0 ? ", " : ""}
                            <Link href={`/admin/projects/${entry.projectId}`} className="underline">
                              {entry.projectTitle}
                            </Link>
                          </span>
                        ))
                      )}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <CopyButton value={model.url} label="Copy URL" />
                      <a href={model.url} target="_blank" rel="noreferrer" className="text-xs underline">
                        Open the file
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-4 border-t border-[#E1E1DA] pt-4">
                    <ModelUploader
                      direct={direct}
                      mode="replace"
                      modelId={model.id}
                      modelName={model.name}
                    />

                    <form action={deleteModelAction}>
                      <input type="hidden" name="modelId" value={model.id} />
                      <button
                        type="submit"
                        className="border border-[#B3261E] px-3 py-1.5 text-xs text-[#B3261E] hover:bg-[#B3261E] hover:text-white"
                      >
                        Delete{used.length > 0 ? ` (${used.length} in use)` : ""}
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
