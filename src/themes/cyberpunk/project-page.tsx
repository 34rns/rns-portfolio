import Link from "next/link";
import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelStage } from "@/components/model-stage/model-stage";
import { SmartImage } from "@/components/smart-image";
import { getLightingPreset } from "@/lib/projects/model";
import type { ProjectPageProps } from "../types";
import { CyberBoot } from "./boot";
import { CyberCursor } from "./cursor";
import { CyberScene } from "./scene";
import { cyberCss } from "./styles";
import { signalStrength } from "./trace";

function Uplink({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="cyber-uplink"
      data-cursor="view"
    >
      <span className="cyber-uplink-label">{label}</span>
      <span className="cyber-uplink-hint">{hint}</span>
      <span className="cyber-uplink-arrow" aria-hidden="true">
        &#8599;
      </span>
    </a>
  );
}

export function CyberpunkProjectPage({
  project,
  next,
  related = [],
  access,
}: ProjectPageProps) {
  const model = project.model;
  const lighting = getLightingPreset(model.lighting);
  const words = project.description.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(words / 200));
  const tags = project.tags.slice(0, 8);
  const year = new Date().getFullYear();
  const index = String(year).slice(-2);

  return (
    <div id="top" className="cyber-root">
      <style>{cyberCss}</style>
      <CyberScene />
      <CyberBoot />
      <CyberCursor />

      <div className="cyber-shell">
        <header className="cyber-topbar">
          <Link href="/" className="cyber-mark" aria-label="RNS home">
            RNS<span>{"//"}</span>
          </Link>

          <span className="cyber-topbar-unit">Field ops / Intercept</span>

          <span className="cyber-topbar-node">
            <span className="cyber-dot" aria-hidden="true" />
            NODE 09 &middot; {project.year}
          </span>

          <nav className="cyber-topbar-nav" aria-label="Page sections">
            <a href="#dossier">Dossier</a>
            {project.gallery.length > 0 ? <a href="#captures">Captures</a> : null}
            <Link href="/#work">All work</Link>
          </nav>
        </header>

        <main id="main">
          <section className="cyber-hero" aria-labelledby="cyber-title">
            <div className="cyber-hero-copy cyber-rise">
              <p className="cyber-kicker">
                <span className="cyber-dot" aria-hidden="true" />
                Case file {project.year} /{" "}
                {project.isPaid ? "Restricted" : "Open channel"}
              </p>

              <h1 id="cyber-title" className="cyber-title">
                <span className="cyber-title-text">{project.title}</span>
                <span className="cyber-title-ghost" aria-hidden="true">
                  {project.title}
                </span>
              </h1>

              <p className="cyber-tagline">{project.tagline}</p>

              {tags.length > 0 ? (
                <div className="cyber-tags">
                  <span className="cyber-tags-label">TAG</span>
                  <ul>
                    {tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <dl className="cyber-facts">
                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt>Access</dt>
                  <dd>{project.isPaid ? "Restricted" : "Public"}</dd>
                </div>
                <div>
                  <dt>Read</dt>
                  <dd>{readMinutes} min</dd>
                </div>
                <div>
                  <dt>Rig</dt>
                  <dd>{model.url ? "Custom GLB" : "Built-in"}</dd>
                </div>
              </dl>

              {project.liveUrl || project.repoUrl ? (
                <div className="cyber-uplinks">
                  {project.liveUrl ? (
                    <Uplink
                      href={project.liveUrl}
                      label="Live site"
                      hint="External uplink"
                    />
                  ) : null}
                  {project.repoUrl ? (
                    <Uplink
                      href={project.repoUrl}
                      label="Repository"
                      hint="Source archive"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              className="cyber-optic cyber-rise"
              style={{ "--stagger": "90ms" } as CSSProperties}
            >
              <div className="cyber-optic-bar">
                <span className="cyber-optic-group">
                  <span className="cyber-rec" aria-hidden="true" />
                  Optic feed / WebGL
                </span>
                <span className="cyber-optic-group">
                  {model.url ? "Custom rig" : "Cache 09"}
                </span>
              </div>

              <div className="cyber-optic-frame">
                <ModelStage
                  modelUrl={model.url}
                  lighting={model.lighting}
                  scale={model.scale}
                  offset={model.offset}
                  variant="studio"
                  title={project.title}
                  poster={project.coverImageUrl}
                  className="cyber-stage"
                />
                <span className="cyber-bracket cyber-bracket--tl" aria-hidden="true" />
                <span className="cyber-bracket cyber-bracket--tr" aria-hidden="true" />
                <span className="cyber-bracket cyber-bracket--bl" aria-hidden="true" />
                <span className="cyber-bracket cyber-bracket--br" aria-hidden="true" />
                <span className="cyber-optic-cross" aria-hidden="true" />
                <span className="cyber-optic-caption">
                  TARGET / {project.title}
                </span>
                <span className="cyber-optic-scan" aria-hidden="true" />
              </div>

              <div className="cyber-optic-foot">
                <span>Drag to orbit</span>
                <span>Scroll to tilt</span>
                <span className="cyber-optic-static">Static / opt in</span>
                <span className="cyber-optic-rig">{lighting.label}</span>
              </div>
            </div>
          </section>

          {access ? (
            <section
              className="cyber-access cyber-reveal"
              aria-labelledby="cyber-requisition"
            >
              <div className="cyber-access-rail">
                <span>Requisition</span>
                <span>{project.isPaid ? "Locked" : "Open"}</span>
              </div>
              <div className="cyber-access-body">
                <p className="cyber-eyebrow">Clearance required</p>
                <h2 id="cyber-requisition">Request the build</h2>
                <p>
                  One payment, permanent access. The delivery note is released
                  to this page once the provider confirms the order.
                </p>
              </div>
              <div className="cyber-access-panel">{access}</div>
            </section>
          ) : null}

          <section
            id="dossier"
            className="cyber-section cyber-reveal"
            aria-labelledby="cyber-dossier"
          >
            <div className="cyber-section-rail">
              <span>01 / Dossier</span>
              <span>
                {readMinutes} min / {words} words
              </span>
            </div>

            <div className="cyber-section-body">
              <div className="cyber-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {project.description}
                </ReactMarkdown>
              </div>

              <aside className="cyber-meta" aria-label="File metadata">
                <p className="cyber-eyebrow">File metadata</p>
                <dl>
                  <div>
                    <dt>Node</dt>
                    <dd>09 / field ops</dd>
                  </div>
                  <div>
                    <dt>Year</dt>
                    <dd>{project.year}</dd>
                  </div>
                  <div>
                    <dt>Access</dt>
                    <dd>{project.isPaid ? "Restricted" : "Public"}</dd>
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
                    <dt>Tags</dt>
                    <dd>{project.tags.length.toString().padStart(2, "0")}</dd>
                  </div>
                </dl>

                {project.liveUrl || project.repoUrl ? (
                  <div className="cyber-meta-links">
                    {project.liveUrl ? (
                      <Uplink
                        href={project.liveUrl}
                        label="Live site"
                        hint="Open in new tab"
                      />
                    ) : null}
                    {project.repoUrl ? (
                      <Uplink
                        href={project.repoUrl}
                        label="Repository"
                        hint="Open in new tab"
                      />
                    ) : null}
                  </div>
                ) : null}
              </aside>
            </div>
          </section>

          {project.gallery.length > 0 ? (
            <section
              id="captures"
              className="cyber-section cyber-reveal"
              aria-labelledby="cyber-captures"
            >
              <div className="cyber-section-rail">
                <span>02 / Capture slate</span>
                <span>
                  {project.gallery.length.toString().padStart(2, "0")} frames
                </span>
              </div>

              <div className="cyber-captures">
                {project.gallery.map((src, position) => {
                  const number = String(position + 1).padStart(2, "0");
                  return (
                    <figure className="cyber-shot" key={`${src}#${position}`}>
                      <div className="cyber-shot-window">
                        <SmartImage
                          src={src}
                          alt={`${project.title} — capture ${number}`}
                          fill
                          sizes="(min-width: 900px) 46vw, 100vw"
                          className="cyber-shot-img"
                        />
                        <span className="cyber-shot-no" aria-hidden="true">
                          FRM {number}
                        </span>
                        <span className="cyber-shot-scan" aria-hidden="true" />
                      </div>
                      <figcaption>
                        <span>{project.title}</span>
                        <span>
                          {number} / {project.year}
                        </span>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section
              className="cyber-section cyber-reveal"
              aria-labelledby="cyber-signals"
            >
              <div className="cyber-section-rail">
                <span>03 / Other signals</span>
                <span>Scan / 88.9</span>
              </div>

              <h2 id="cyber-signals" className="cyber-sr-only">
                Other signals
              </h2>

              <ul className="cyber-signals">
                {related.map((item, position) => (
                  <li key={item.slug}>
                    <Link
                      href={`/projects/${item.slug}`}
                      className="cyber-signal"
                      data-cursor="view"
                    >
                      <span className="cyber-signal-no">
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <span className="cyber-signal-title">{item.title}</span>
                      <span className="cyber-signal-year">{item.year}</span>
                      <span className="cyber-signal-bars" aria-hidden="true">
                        {signalStrength(item.slug).map((level, bar) => (
                          <i key={bar} style={{ height: `${level * 3 + 2}px` }} />
                        ))}
                      </span>
                      <span className="cyber-signal-arrow" aria-hidden="true">
                        &#8599;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {next ? (
            <section className="cyber-next cyber-reveal" aria-labelledby="cyber-next">
              <Link href={`/projects/${next.slug}`} data-cursor="view">
                <span className="cyber-next-label">
                  <span id="cyber-next">Next transmission</span>
                  <span className="cyber-next-year">{next.year}</span>
                </span>
                <span className="cyber-next-row">
                  <span className="cyber-next-title">{next.title}</span>
                  <span className="cyber-next-arrow" aria-hidden="true">
                    &#8594;
                  </span>
                </span>
              </Link>
            </section>
          ) : null}
        </main>

        <footer className="cyber-footer">
          <span className="cyber-footer-code">
            RNS{`//`}INTERCEPT / {year}
          </span>
          <span className="cyber-footer-mid">
            Next.js / WebGL / Night shift
          </span>
          <span className="cyber-footer-node">NODE {index} / 88.9 MHz</span>
          <Link href="#top" className="cyber-footer-link">
            Return to start &#8593;
          </Link>
        </footer>
      </div>
    </div>
  );
}
