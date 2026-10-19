import Link from "next/link";
import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelStage } from "@/components/model-stage/model-stage";
import { getLightingPreset } from "@/lib/projects/model";
import type { ProjectPageProps } from "../types";
import { SynthBoot } from "./boot";
import { SynthCursor } from "./cursor";
import { SynthScene } from "./scene";
import { synthCss } from "./styles";
import { CartridgeCard, TapeCard } from "./tape";

export function SynthwaveProjectPage({
  project,
  next,
  related = [],
  access,
}: ProjectPageProps) {
  const model = project.model;
  const lighting = getLightingPreset(model.lighting);
  const words = project.description.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(words / 200));
  const tags = project.tags.slice(0, 6);
  const year = new Date().getFullYear();

  return (
    <div id="top" className="synth-root">
      <style>{synthCss}</style>
      <SynthScene />
      <SynthBoot />
      <SynthCursor />

      <div className="synth-page">
        <div className="synth-frame">
          <header className="synth-header">
            <Link href="/" className="synth-logo" aria-label="RNS home">
              RNS<span className="synth-logo-sub">{"//NEON"}</span>
            </Link>

            <p className="synth-header-meta">
              Case file {project.year} / {project.tags.length} tags
            </p>

            <div className="synth-header-actions">
              <Link href="/#work" className="synth-header-link">
                All work
              </Link>
              <a href="#main" className="synth-header-link">
                Jump in
              </a>
            </div>
          </header>

          <main id="main">
            <section className="synth-hero" aria-labelledby="synth-title">
              <div className="synth-hero-copy synth-rise">
                <p className="synth-kicker">
                  {project.isPaid ? "Paid transmission" : "Case file"} /{" "}
                  {project.year}
                </p>

                <h1 id="synth-title" className="synth-title">
                  {project.title}
                </h1>

                <p className="synth-tagline">{project.tagline}</p>

                {tags.length > 0 ? (
                  <ul className="synth-tags">
                    {tags.map((tag) => (
                      <li key={tag} className="synth-tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <aside
                className="synth-ledger synth-rise"
                style={{ "--d": "70ms" } as CSSProperties}
                aria-label="Case data"
              >
                <div className="synth-ledger-head">
                  <span>Case data</span>
                  <span>CH 03</span>
                </div>

                <dl>
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
              </aside>

              <div className="synth-cabinet">
                <div className="synth-cabinet-bar">
                  <span className="synth-cabinet-bar-group">
                    <span className="synth-led" aria-hidden="true" />
                    Live render // WebGL
                  </span>
                  <span className="synth-cabinet-bar-group">Orbit: auto</span>
                </div>

                <div className="synth-screen">
                  <ModelStage
                    modelUrl={model.url}
                    lighting={model.lighting}
                    scale={model.scale}
                    offset={model.offset}
                    variant="studio"
                    title={project.title}
                    poster={project.coverImageUrl}
                    className="synth-stage"
                  />
                  <div className="synth-screen-scan" aria-hidden="true" />
                  <div className="synth-screen-glare" aria-hidden="true" />
                </div>

                <div className="synth-cabinet-foot">
                  <span className="synth-cabinet-hint">Drag to orbit</span>
                  <span className="synth-cabinet-hint">Scroll to tilt</span>
                  <span className="synth-cabinet-static">
                    Static preview / opt in to orbit
                  </span>
                  <span className="synth-cabinet-tag">
                    {model.url ? "Custom GLB" : "Built-in scene"}
                  </span>
                </div>
              </div>
            </section>

            {access ? (
              <section
                className="synth-coin synth-reveal"
                aria-labelledby="synth-unlock"
              >
                <div className="synth-coin-head">
                  <p className="synth-pixel">One credit</p>
                  <h2 id="synth-unlock">Unlock the build</h2>
                  <p>
                    Permanent access. The delivery note appears here once the
                    payment provider confirms the order.
                  </p>
                </div>
                <div className="synth-coin-slot">{access}</div>
              </section>
            ) : null}

            <section
              className="synth-section synth-reveal"
              aria-labelledby="synth-log"
            >
              <div className="synth-section-head">
                <span id="synth-log">Transmission log</span>
                <span>
                  {readMinutes} min / {words} words
                </span>
              </div>

              <div className="synth-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {project.description}
                </ReactMarkdown>
              </div>
            </section>

            {project.gallery.length > 0 ? (
              <section
                className="synth-section synth-reveal"
                aria-labelledby="synth-captures"
              >
                <div className="synth-section-head">
                  <span id="synth-captures">Capture log</span>
                  <span>
                    {project.gallery.length}{" "}
                    {project.gallery.length === 1 ? "tape" : "tapes"}
                  </span>
                </div>

                <div className="synth-tape-grid">
                  {project.gallery.map((src, index) => (
                    <TapeCard
                      key={`${src}#${index}`}
                      src={src}
                      index={index}
                      title={project.title}
                      year={project.year}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {related.length > 0 ? (
              <section
                className="synth-section synth-reveal"
                aria-labelledby="synth-shelf"
              >
                <div className="synth-section-head">
                  <span id="synth-shelf">More cartridges</span>
                  <span>Select</span>
                </div>

                <div className="synth-cart-grid">
                  {related.map((item, index) => (
                    <CartridgeCard
                      key={item.slug}
                      project={item}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {next ? (
              <section
                className="synth-next synth-reveal"
                aria-labelledby="synth-next"
              >
                <Link href={`/projects/${next.slug}`} data-cursor="view">
                  <span>
                    <span id="synth-next" className="synth-next-label">
                      Next stage
                    </span>
                    <span className="synth-next-title">{next.title}</span>
                  </span>
                  <span className="synth-next-arrow" aria-hidden="true">
                    &#9654;
                  </span>
                </Link>
              </section>
            ) : null}
          </main>

          <footer className="synth-footer">
            <span>
              <span className="synth-footer-dots" aria-hidden="true">
                <span className="synth-footer-dot" />
                <span className="synth-footer-dot" />
                <span className="synth-footer-dot" />
              </span>
              End of file / RNS {year}
            </span>
            <span>Next.js / WebGL / Neon</span>
            <Link href="#top" className="synth-footer-link">
              Back to top
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
