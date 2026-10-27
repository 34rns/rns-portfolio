"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useActionState, useState } from "react";
import { LIGHTING_PRESETS, MODEL_LIMITS } from "@/lib/projects/model";
import { slugify } from "@/lib/projects/slug";
import { saveProject, type FormState } from "../actions";
import { MediaField, UploadField } from "./upload-field";

export type ThemeChoice = {
  slug: string;
  name: string;
  blurb: string;
  accent: string;
  background: string;
  text: string;
};

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImageUrl: string;
  gallery: string;
  tags: string;
  liveUrl: string;
  repoUrl: string;
  downloadUrl: string;
  year: number;
  status: "draft" | "published";
  placement: "featured" | "unlisted";
  theme: string;
  themeAccent: string;
  isPaid: boolean;
  price: string;
  currency: string;
  providerProductId: string;
  modelUrl: string;
  lighting: string;
  modelScale: number;
  modelOffsetX: number;
  modelOffsetY: number;
  modelOffsetZ: number;
  deliveryNote: string;
  sortOrder: number;
};

export const emptyProject: ProjectFormValues = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  coverImageUrl: "",
  gallery: "",
  tags: "",
  liveUrl: "",
  repoUrl: "",
  downloadUrl: "",
  year: new Date().getFullYear(),
  status: "draft",
  placement: "featured",
  theme: "professional",
  themeAccent: "",
  isPaid: false,
  price: "",
  currency: "USD",
  providerProductId: "",
  modelUrl: "",
  lighting: "studio",
  modelScale: 1,
  modelOffsetX: 0,
  modelOffsetY: 0,
  modelOffsetZ: 0,
  deliveryNote: "",
  sortOrder: 0,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-[#B3261E]" role="alert">
      {message}
    </p>
  );
}

export function ProjectForm({
  project = emptyProject,
  themes,
  directUploads = false,
  models = [],
}: {
  project?: ProjectFormValues;
  themes: ThemeChoice[];
  directUploads?: boolean;
  /** The 3D model library, so a project can point at an existing file. */
  models?: { name: string; url: string }[];
}) {
  const [state, action, pending] = useActionState(saveProject, {} as FormState);
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(project.slug));
  const [description, setDescription] = useState(project.description);
  const [cover, setCover] = useState(project.coverImageUrl);
  const [gallery, setGallery] = useState(project.gallery);
  const [modelUrl, setModelUrl] = useState(project.modelUrl);
  const [theme, setTheme] = useState(project.theme);
  const [accent, setAccent] = useState(project.themeAccent);
  const [isPaid, setIsPaid] = useState(project.isPaid);
  const [showPreview, setShowPreview] = useState(false);

  const errors = state?.fieldErrors ?? {};
  const selectedTheme = themes.find((item) => item.slug === theme) ?? themes[0];
  const accentValue = /^#[0-9a-fA-F]{6}$/.test(accent)
    ? accent
    : selectedTheme?.accent ?? "#1B3BFF";

  return (
    <form action={action} className="mt-6">
      {project.id ? <input type="hidden" name="id" value={project.id} /> : null}

      {state?.error ? (
        <p
          className="mb-5 border border-[#E5B4B0] bg-[#FBEDEC] px-4 py-3 text-sm text-[#8C1D18]"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="border border-[#E1E1DA] bg-white p-5">
            <h2 className="text-sm font-medium">Basics</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="admin-label" htmlFor="title">
                  Title
                </label>
                <input
                  className="admin-field"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTitle(value);
                    if (!slugTouched) setSlug(slugify(value));
                  }}
                  required
                />
                <FieldError message={errors.title} />
              </div>

              <div>
                <label className="admin-label" htmlFor="slug">
                  Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="mono text-[#6B6B64]">/projects/</span>
                  <input
                    className="admin-field"
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value);
                      setSlugTouched(true);
                    }}
                    required
                  />
                </div>
                <FieldError message={errors.slug} />
              </div>

              <div>
                <label className="admin-label" htmlFor="tagline">
                  Tagline
                </label>
                <input
                  className="admin-field"
                  id="tagline"
                  name="tagline"
                  defaultValue={project.tagline}
                  required
                />
                <FieldError message={errors.tagline} />
              </div>

              <div className="max-w-[10rem]">
                <label className="admin-label" htmlFor="year">
                  Year
                </label>
                <input
                  className="admin-field"
                  id="year"
                  name="year"
                  type="number"
                  min={2000}
                  max={2100}
                  defaultValue={project.year}
                  required
                />
                <FieldError message={errors.year} />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="admin-label" htmlFor="description">
                    Case study (markdown)
                  </label>
                  <button
                    type="button"
                    className="mb-1 text-xs underline"
                    onClick={() => setShowPreview((value) => !value)}
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                </div>

                {showPreview ? (
                  <div className="editorial min-h-[18rem] border border-[#D8D8D2] bg-[#FAFAF7] px-5 py-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description || "_Nothing written yet._"}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    className="admin-field font-mono text-[0.82rem] leading-relaxed"
                    id="description"
                    name="description"
                    rows={16}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />
                )}
                <FieldError message={errors.description} />
              </div>
            </div>
          </section>

          <section className="border border-[#E1E1DA] bg-white p-5">
            <h2 className="text-sm font-medium">Links and media</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="admin-label" htmlFor="liveUrl">
                    Live URL
                  </label>
                  <input
                    className="admin-field"
                    id="liveUrl"
                    name="liveUrl"
                    defaultValue={project.liveUrl}
                    placeholder="https://"
                  />
                  <FieldError message={errors.liveUrl} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="repoUrl">
                    Repository URL
                  </label>
                  <input
                    className="admin-field"
                    id="repoUrl"
                    name="repoUrl"
                    defaultValue={project.repoUrl}
                    placeholder="https://github.com/..."
                  />
                  <FieldError message={errors.repoUrl} />
                </div>
                <div className="sm:col-span-2">
                  <label className="admin-label" htmlFor="downloadUrl">
                    Free download URL
                  </label>
                  <input
                    className="admin-field"
                    id="downloadUrl"
                    name="downloadUrl"
                    defaultValue={project.downloadUrl}
                    placeholder="https://…/app.zip"
                  />
                  <p className="mt-1 text-xs text-[#6B6B64]">
                    Shown on the project page even when the project is paid — the
                    app is free, only Pro is sold.
                  </p>
                  <FieldError message={errors.downloadUrl} />
                </div>
              </div>

              <div>
                <MediaField
                  label="Cover image"
                  fieldName="coverImageUrl"
                  kind="image"
                  value={cover}
                  onChange={setCover}
                  direct={directUploads}
                  hint="Paste a URL, or upload straight into this project."
                />
                <FieldError message={errors.coverImageUrl} />
                {cover ? (
                  <div className="mt-3 border border-[#E1E1DA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt="Cover preview"
                      className="max-h-52 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="admin-label" htmlFor="gallery">
                  Gallery (one URL per line)
                </label>
                <textarea
                  className="admin-field font-mono text-[0.82rem]"
                  id="gallery"
                  name="gallery"
                  rows={3}
                  value={gallery}
                  onChange={(event) => setGallery(event.target.value)}
                />
                <div className="mt-2">
                  <UploadField
                    kind="image"
                    direct={directUploads}
                    buttonLabel="Upload to gallery"
                    onUploaded={(url) =>
                      setGallery((current) =>
                        current.trim() ? `${current.trimEnd()}\n${url}` : url,
                      )
                    }
                  />
                </div>
                <FieldError message={errors.gallery} />
              </div>

              <div>
                <label className="admin-label" htmlFor="tags">
                  Tags (comma separated)
                </label>
                <input
                  className="admin-field"
                  id="tags"
                  name="tags"
                  defaultValue={project.tags}
                  placeholder="Next.js, TypeScript, Postgres"
                />
                <FieldError message={errors.tags} />
              </div>
            </div>
          </section>

          <section className="border border-[#E1E1DA] bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium">3D model</h2>
              <span className="mono text-[#6B6B64]">Optional</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#6B6B64]">
              The Anime 3D theme renders this in a live stage. Without a model
              it shows a built-in scene. Other themes ignore these fields.
            </p>

            <div className="mt-4 grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {models.length > 0 ? (
                  <label className="block text-sm" htmlFor="modelLibrary">
                    <span className="admin-label">From the library</span>
                    <select
                      className="admin-field"
                      id="modelLibrary"
                      value={models.some((entry) => entry.url === modelUrl) ? modelUrl : ""}
                      onChange={(event) => setModelUrl(event.target.value)}
                    >
                      <option value="">Choose a stored model…</option>
                      {models.map((entry) => (
                        <option key={entry.url} value={entry.url}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="text-xs text-[#6B6B64]">
                    The library is empty — upload a model below or from Admin → 3D
                    models.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setModelUrl("")}
                  disabled={!modelUrl}
                  className="border border-[#B3261E] px-3 py-1.5 text-sm text-[#B3261E] disabled:opacity-40"
                >
                  Remove 3D model
                </button>
              </div>
              <p className="text-xs leading-relaxed text-[#6B6B64]">
                Removing the model turns the 3D stage off and the project falls back
                to its cover image. Scale, offset and lighting are kept for later.
              </p>

              <MediaField
                label="Main 3D model"
                fieldName="modelUrl"
                kind="model"
                value={modelUrl}
                onChange={setModelUrl}
                direct={directUploads}
                hint="GLB preferred. A .gltf is only accepted when its buffers and textures are embedded."
              />
              <FieldError message={errors.modelUrl} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="admin-label" htmlFor="lighting">
                    Lighting
                  </label>
                  <select
                    className="admin-field"
                    id="lighting"
                    name="lighting"
                    defaultValue={project.lighting}
                  >
                    {LIGHTING_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} — {preset.blurb}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.lighting} />
                </div>

                <div>
                  <label className="admin-label" htmlFor="modelScale">
                    Scale
                  </label>
                  <input
                    className="admin-field"
                    id="modelScale"
                    name="modelScale"
                    type="number"
                    step="0.05"
                    min={MODEL_LIMITS.scale.min}
                    max={MODEL_LIMITS.scale.max}
                    defaultValue={project.modelScale}
                  />
                  <FieldError message={errors.modelScale} />
                </div>
              </div>

              <fieldset>
                <legend className="admin-label">Offset</legend>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ["modelOffsetX", "X", project.modelOffsetX],
                      ["modelOffsetY", "Y", project.modelOffsetY],
                      ["modelOffsetZ", "Z", project.modelOffsetZ],
                    ] as const
                  ).map(([name, axis, value]) => (
                    <div key={name}>
                      <label className="sr-only" htmlFor={name}>
                        Offset {axis}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="mono text-[#6B6B64]">{axis}</span>
                        <input
                          className="admin-field"
                          id={name}
                          name={name}
                          type="number"
                          step="0.05"
                          min={MODEL_LIMITS.offset.min}
                          max={MODEL_LIMITS.offset.max}
                          defaultValue={value}
                        />
                      </div>
                      <FieldError message={errors[name]} />
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-[#E1E1DA] bg-white p-5">
            <h2 className="text-sm font-medium">Theme</h2>
            <div className="mt-4">
              <label className="admin-label" htmlFor="theme">
                Layout
              </label>
              <select
                className="admin-field"
                id="theme"
                name="theme"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
              >
                {themes.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.theme} />
            </div>

            {selectedTheme ? (
              <div
                className="mt-4 p-4"
                style={{ background: selectedTheme.background, color: selectedTheme.text }}
              >
                <p
                  className="display text-3xl font-medium"
                  style={{ fontVariationSettings: '"wdth" 116' }}
                >
                  Aa
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="h-3 w-10"
                    style={{ background: accentValue }}
                  />
                  <span className="text-xs opacity-70">{selectedTheme.name}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed opacity-70">
                  {selectedTheme.blurb}
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <label className="admin-label" htmlFor="themeAccent">
                Accent override
              </label>
              <input
                className="admin-field font-mono"
                id="themeAccent"
                name="themeAccent"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                placeholder="#1B3BFF"
              />
              <FieldError message={errors.themeAccent} />
            </div>
          </section>

          <section className="border border-[#E1E1DA] bg-white p-5">
            <h2 className="text-sm font-medium">Placement</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="admin-label" htmlFor="status">
                  Status
                </label>
                <select
                  className="admin-field"
                  id="status"
                  name="status"
                  defaultValue={project.status}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="admin-label" htmlFor="placement">
                  Visibility
                </label>
                <select
                  className="admin-field"
                  id="placement"
                  name="placement"
                  defaultValue={project.placement}
                >
                  <option value="featured">Show on landing page</option>
                  <option value="unlisted">Unlisted (direct link only)</option>
                </select>
              </div>

              <div>
                <label className="admin-label" htmlFor="sortOrder">
                  Order position
                </label>
                <input
                  className="admin-field"
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={9999}
                  defaultValue={project.sortOrder}
                />
                <FieldError message={errors.sortOrder} />
              </div>
            </div>
          </section>

          <section className="border border-[#E1E1DA] bg-white p-5">
            <h2 className="text-sm font-medium">Monetization</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#6B6B64]">
              Paid projects show a buy panel. Buyers unlock the live URL and the delivery note.
            </p>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isPaid"
                checked={isPaid}
                onChange={(event) => setIsPaid(event.target.checked)}
              />
              Paid project
            </label>

            {isPaid ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-[1fr_6rem] gap-3">
                  <div>
                    <label className="admin-label" htmlFor="priceCents">
                      Price
                    </label>
                    <input
                      className="admin-field"
                      id="priceCents"
                      name="priceCents"
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={project.price}
                    />
                    <FieldError message={errors.priceCents} />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="currency">
                      Currency
                    </label>
                    <input
                      className="admin-field"
                      id="currency"
                      name="currency"
                      defaultValue={project.currency}
                    />
                    <FieldError message={errors.currency} />
                  </div>
                </div>
                <div>
                  <label className="admin-label" htmlFor="providerProductId">
                    Provider product ID
                  </label>
                  <input
                    className="admin-field font-mono text-xs"
                    id="providerProductId"
                    name="providerProductId"
                    defaultValue={project.providerProductId}
                  />
                  <FieldError message={errors.providerProductId} />
                </div>
                <div>
                  <label className="admin-label" htmlFor="deliveryNote">
                    Delivery note (buyers only)
                  </label>
                  <textarea
                    className="admin-field min-h-24 font-mono text-xs"
                    id="deliveryNote"
                    name="deliveryNote"
                    defaultValue={project.deliveryNote}
                  />
                  <p className="mt-1 text-xs text-[#6B6B64]">
                    License key, setup steps or credentials. Never rendered for
                    visitors who have not bought the project.
                  </p>
                  <FieldError message={errors.deliveryNote} />
                </div>
              </div>
            ) : (
              <>
                <input type="hidden" name="priceCents" value="" />
                <input type="hidden" name="currency" value={project.currency} />
              </>
            )}
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center gap-4 border-t border-[#D8D8D2] bg-[#F4F4F0]/95 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#14171A] px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save project"}
        </button>
        <Link href="/admin/projects" className="text-sm underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
