import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelStage } from "@/components/model-stage/model-stage";
import { SmartImage } from "@/components/smart-image";
import { getLightingPreset } from "@/lib/projects/model";
import type { ProjectPageProps } from "../types";
import { animeCss } from "./styles";

const petals = Array.from({ length: 14 }, (_, index) => ({
  left: `${(index * 37 + 9) % 96}%`,
  delay: `${(index * 1.9) % 13}s`,
  duration: `${12 + (index % 5) * 2.4}s`,
  size: 6 + (index % 4) * 2,
}));

function Sakura() {
  return (
    <div className="anime-sakura" aria-hidden="true">
      {petals.map((petal, index) => (
        <span
          key={index}
          className="anime-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size * 1.35,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        />
      ))}
    </div>
  );
}

function SplitTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop() : words[0];

  return (
    <h1 className="anime-title">
      {words.length > 1 ? `${words.join(" ")} ` : null}
      <span className="anime-outline">{last}</span>
    </h1>
  );
}

function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="anime-linkrow"
      data-cursor="view"
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function AnimeProjectPage({ project, next, access }: ProjectPageProps) {
  const model = project.model;
  const lighting = getLightingPreset(model.lighting);
  const words = project.description.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(words / 200));
  const filtered = project.tags.slice(0, 6);

  return (
    <div id="top" className="anime-root min-h-screen">
      <style>{animeCss}</style>
      <div className="anime-speedlines" aria-hidden="true" />
      <Sakura />

      <div className="anime-frame">
        <header className="anime-header">
          <Link href="/" className="anime-logo" aria-label="RNS home">
            RNS<span>®</span>
          </Link>
          <p className="anime-header-meta">
            FILE {project.year} / {project.tags.length.toString().padStart(2, "0")} TAGS
          </p>
          <Link href="/#work" className="anime-header-link">
            All work →
          </Link>
        </header>

        <main id="main" className="anime-hero">
          <div className="anime-rise">
            <div className="anime-title-row">
              <div className="min-w-0">
                <p className="anime-kicker">
                  {project.isPaid ? "Paid chapter" : "Case file"} ·{" "}
                  {project.year}
                </p>
                <SplitTitle title={project.title} />
                <div className="anime-title-rule" aria-hidden="true" />
              </div>
              <div className="anime-stamp" aria-hidden="true">
                3D
                <br />
                CEL
              </div>
            </div>

            <p className="anime-tagline">{project.tagline}</p>

            {filtered.length > 0 ? (
              <ul className="anime-tags">
                {filtered.map((tag) => (
                  <li key={tag} className="anime-chip">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="anime-hero-grid">
            <div className="anime-rise" style={{ animationDelay: "0.06s" }}>
              <div className="anime-stage-shell">
                <div className="anime-stage-bar">
                  <span>Live render // WebGL</span>
                  <span>Toon shader</span>
                </div>
                <ModelStage
                  modelUrl={model.url}
                  lighting={model.lighting}
                  scale={model.scale}
                  offset={model.offset}
                  variant="toon"
                  title={project.title}
                  poster={project.coverImageUrl}
                  className="anime-stage"
                />
                <div className="anime-stage-foot">
                  Drag to orbit · scroll to tilt · auto-rotate
                </div>
                <div className="anime-halftone" aria-hidden="true" />
              </div>
            </div>

            <div className="anime-side">
              <section
                className="anime-panel"
                style={{ animationDelay: "0.12s" }}
                aria-labelledby="session-data"
              >
                <h2 id="session-data">Session data</h2>
                <dl className="anime-filelist">
                  <div>
                    <dt>Year</dt>
                    <dd>{project.year}</dd>
                  </div>
                  <div>
                    <dt>Access</dt>
                    <dd>{project.isPaid ? "Paid" : "Public"}</dd>
                  </div>
                  <div>
                    <dt>Model</dt>
                    <dd>{model.url ? "Uploaded GLB" : "Built-in scene"}</dd>
                  </div>
                  <div>
                    <dt>Lighting</dt>
                    <dd>{lighting.label}</dd>
                  </div>
                  <div>
                    <dt>Read</dt>
                    <dd>{readMinutes} min</dd>
                  </div>
                </dl>
              </section>

              {project.liveUrl || project.repoUrl ? (
                <div
                  className="anime-side flex flex-col gap-2"
                  style={{ animationDelay: "0.18s" }}
                >
                  {project.liveUrl ? (
                    <ArrowLink href={project.liveUrl} label="Live site" />
                  ) : null}
                  {project.repoUrl ? (
                    <ArrowLink href={project.repoUrl} label="Repository" />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {access ? (
            <section
              className="anime-unlock anime-panel anime-panel--accent anime-rise"
              style={{ animationDelay: "0.22s" }}
              aria-label="Buy this project"
            >
              <div className="anime-ticket">{access}</div>
            </section>
          ) : null}

          <section className="anime-read">
            <aside className="anime-read-meta">
              <span>Panel 01</span>
              <span>The file</span>
              <span className="opacity-60">
                {readMinutes} min read / {words} words
              </span>
            </aside>

            <div className="anime-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.description}
              </ReactMarkdown>
            </div>
          </section>

          {project.gallery.length > 0 ? (
            <section
              className="anime-gallery"
              aria-label={`${project.title} gallery`}
            >
              {project.gallery.map((src, index) => (
                <figure key={src}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={src}
                      alt={`${project.title} — panel ${index + 1}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption>
                    <span>Panel {String(index + 1).padStart(2, "0")}</span>
                    <span>{project.year}</span>
                  </figcaption>
                </figure>
              ))}
            </section>
          ) : null}

          {next ? (
            <section className="anime-next">
              <Link href={`/projects/${next.slug}`} data-cursor="view">
                <span className="anime-next-label">Next file</span>
                <span className="anime-next-title">{next.title}</span>
              </Link>
            </section>
          ) : null}
        </main>

        <p className="anime-end" aria-hidden="true">
          To be continued
        </p>

        <footer className="anime-footer">
          <span>© {new Date().getFullYear()} RNS</span>
          <span>Cell shading / WebGL / Next.js</span>
          <Link href="#top" className="anime-header-link">
            Back to top ↑
          </Link>
        </footer>
      </div>
    </div>
  );
}
