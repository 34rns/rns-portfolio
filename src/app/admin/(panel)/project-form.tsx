"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useActionState, useState } from "react";
import { slugify } from "@/lib/projects/slug";
import { saveProject, type FormState } from "../actions";

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
  year: number;
  status: "draft" | "published";
  placement: "featured" | "unlisted";
  theme: string;
  themeAccent: string;
  isPaid: boolean;
  price: string;
  currency: string;
  providerProductId: string;
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
  year: new Date().getFullYear(),
  status: "draft",
  placement: "featured",
  theme: "professional",
  themeAccent: "",
  isPaid: false,
  price: "",
  currency: "USD",
  providerProductId: "",
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
}: {
  project?: ProjectFormValues;
  themes: ThemeChoice[];
}) {
  const [state, action, pending] = useActionState(saveProject, {} as FormState);
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(project.slug));
  const [description, setDescription] = useState(project.description);
  const [cover, setCover] = useState(project.coverImageUrl);
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
              </div>

              <div>
                <label className="admin-label" htmlFor="coverImageUrl">
                  Cover image URL
                </label>
                <input
                  className="admin-field"
                  id="coverImageUrl"
                  name="coverImageUrl"
                  defaultValue={project.coverImageUrl}
                  onChange={(event) => setCover(event.target.value)}
                  placeholder="/seed/example.png or https://..."
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
                  defaultValue={project.gallery}
                />
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
