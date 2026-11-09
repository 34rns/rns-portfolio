import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ReleaseVersion } from "@/components/release-version";
import { SmartImage } from "@/components/smart-image";
import { isLatestReleaseLink, isReleaseDownloadLink } from "@/lib/projects/links";
import type { ProjectPageProps } from "../types";
import {
  banglishRows,
  galleryShots,
  languagePlates,
  proofPoints,
  themeShots,
  tickerItems,
} from "./specimen";
import { keycapCss } from "./styles";

function Shot({
  src,
  alt,
  ratio,
  sizes,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  ratio: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`kc-frame ${className}`} style={{ aspectRatio: ratio }}>
      <SmartImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

function Title({ title }: { title: string }) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) {
    return <h1 className="kc-title">{title}</h1>;
  }

  const last = words.pop();
  return (
    <h1 className="kc-title">
      {words.join(" ")} <em>{last}</em>
    </h1>
  );
}

function Ticker() {
  return (
    <div className="kc-ticker" aria-hidden="true">
      <div className="kc-ticker-track">
        {[0, 1].map((run) => (
          <div className="kc-ticker-run" key={run}>
            {tickerItems.map((item) => (
              <span className="kc-ticker-item" key={`${run}-${item}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function captionFor(src: string) {
  return (
    galleryShots.find((shot) => shot.src === src)?.caption ??
    "Capture from the Android debug build, with the keyboard as the active input method."
  );
}

function ratioFor(src: string) {
  return galleryShots.find((shot) => shot.src === src)?.ratio ?? "1080 / 2400";
}

export function KeycapProjectPage({ project, next, related = [], access }: ProjectPageProps) {
  const words = project.description.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(words / 200));
  const tags = project.tags.slice(0, 6);
  const download = isReleaseDownloadLink(project.liveUrl);
  const latestRelease = isLatestReleaseLink(project.liveUrl);
  const cover = project.coverImageUrl ?? languagePlates[0].src;

  const gallerySources = (
    project.gallery.length > 0
      ? project.gallery.filter(
          (src) => !languagePlates.some((plate) => plate.src === src) && src !== cover,
        )
      : galleryShots.map((shot) => shot.src)
  ).slice(0, 6);

  return (
    <div id="top" className="kc-root">
      <style>{keycapCss}</style>
      <div className="kc-grain" aria-hidden="true" />

      <header className="kc-header kc-wrap">
        <Link href="/" className="kc-logo" aria-label="RNS/TYPE home">
          RNS<span>/TYPE</span>
        </Link>
        <p className="kc-header-meta">
          Specimen · Android IME · {project.year}
        </p>
        <nav className="kc-nav" aria-label="Project sections">
          <a href="#deck">The deck</a>
          <a href="#themes">Themes</a>
          <a href="#proof">Proof</a>
          <Link href="/#work">All work</Link>
        </nav>
      </header>

      <main id="main">
        <section className="kc-hero">
          <div className="kc-wrap kc-hero-grid">
            <div className="kc-hero-copy">
              <p className="kc-eyebrow">
                Case study / {project.year} / {readMinutes} min read
              </p>

              <Title title={project.title} />

              <p className="kc-tagline">{project.tagline}</p>

              {tags.length > 0 ? (
                <ul className="kc-tags" aria-label="Stack and topics">
                  {tags.map((tag) => (
                    <li className="kc-tag" key={tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="kc-actions">
                {project.liveUrl ? (
                  <a
                    className="kc-button"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {download ? "Download APK" : latestRelease ? "Latest release" : "Open project"}
                    {download || latestRelease ? (
                      <ReleaseVersion
                        repoUrl={project.repoUrl}
                        className="kc-button-version"
                      />
                    ) : null}
                  </a>
                ) : null}

                {project.repoUrl ? (
                  <a
                    className="kc-button kc-button--ghost"
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>

              <dl className="kc-facts">
                <div className="kc-fact">
                  <dt>Platform</dt>
                  <dd>Android 8.0+</dd>
                </div>
                <div className="kc-fact">
                  <dt>v0.4.0</dt>
                  <dd>3.99 MB APK</dd>
                </div>
                <div className="kc-fact">
                  <dt>Licence</dt>
                  <dd>MIT source · CC BY-SA data</dd>
                </div>
                <div className="kc-fact">
                  <dt>Built with</dt>
                  <dd>Kotlin · Compose</dd>
                </div>
              </dl>
            </div>

            <figure className="kc-deck">
              <span className="kc-stamp" aria-hidden="true">
                শব্দ
              </span>

              <div className="kc-deck-frame">
                <div className="kc-deck-bar">
                  <span className="kc-lights" aria-hidden="true">
                    <span className="kc-light" />
                    <span className="kc-light kc-light--gold" />
                    <span className="kc-light kc-light--red" />
                  </span>
                  <span>Live capture / Android 15</span>
                  <span>বাং · BL · EN</span>
                </div>

                <Shot
                  src={cover}
                  alt="Shobdo Keyboard shown in English, Bangla and Banglish on Android"
                  ratio="1900 / 1379"
                  sizes="(min-width: 1020px) 46vw, 100vw"
                  priority
                />
              </div>

              <figcaption className="kc-deck-caption">
                One keyboard, three languages, no network permission. Every
                capture on this page is the debug build with Shobdo as the active
                input method.
              </figcaption>
            </figure>
          </div>
        </section>

        <Ticker />

        <section className="kc-section" id="brief">
          <div className="kc-wrap kc-brief-grid">
            <nav className="kc-index" aria-label="Contents">
              <p className="kc-index-title">Contents</p>
              <ol>
                <li>
                  <a href="#brief">
                    <span className="kc-index-num">01</span> The brief
                  </a>
                </li>
                <li>
                  <a href="#deck">
                    <span className="kc-index-num">02</span> The deck
                  </a>
                </li>
                <li>
                  <a href="#themes">
                    <span className="kc-index-num">03</span> The themes
                  </a>
                </li>
                <li>
                  <a href="#specimen">
                    <span className="kc-index-num">04</span> Banglish
                  </a>
                </li>
                <li>
                  <a href="#proof">
                    <span className="kc-index-num">05</span> The proof
                  </a>
                </li>
              </ol>
              <p className="kc-index-note">
                Set in Archivo, Newsreader, Tiro Bangla and DM Mono. Captures
                from Android 15.
              </p>
            </nav>

            <div className="kc-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.description}
              </ReactMarkdown>
            </div>
          </div>
        </section>

        {access ? (
          <section className="kc-section kc-section--tint">
            <div className="kc-wrap">{access}</div>
          </section>
        ) : null}

        <section className="kc-section kc-section--tint" id="deck">
          <div className="kc-wrap">
            <div className="kc-section-head">
              <div>
                <p className="kc-eyebrow">01 / The languages</p>
                <h2 className="kc-section-title">Three decks, one globe key.</h2>
              </div>
              <p className="kc-section-note">
                Each language can be switched off. At least one always stays on,
                and the globe cycles only the ones you kept.
              </p>
            </div>

            <div className="kc-plates">
              {languagePlates.map((plate) => (
                <article className="kc-plate kc-reveal" key={plate.name}>
                  <div className="kc-plate-head">
                    <div>
                      <h3 className="kc-plate-name">{plate.name}</h3>
                      <p className="kc-plate-caption">{plate.caption}</p>
                    </div>
                    <span className="kc-key" aria-hidden="true">
                      {plate.key}
                    </span>
                  </div>

                  <Shot
                    src={plate.src}
                    alt={`${plate.name} keyboard in the Shobdo Android app`}
                    ratio="1080 / 2400"
                    sizes="(min-width: 860px) 31vw, 78vw"
                  />

                  <p className="kc-plate-note">{plate.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="kc-section" id="themes">
          <div className="kc-wrap">
            <div className="kc-section-head">
              <div>
                <p className="kc-eyebrow">02 / The themes</p>
                <h2 className="kc-section-title">Thirteen ways to look.</h2>
              </div>
              <p className="kc-theme-note">
                Every pair ≥ 4.5:1 on the composited key
              </p>
            </div>

            <div
              className="kc-theme-strip kc-reveal"
              role="region"
              aria-label="The thirteen built-in themes"
              tabIndex={0}
            >
              {themeShots.map((theme, index) => (
                <figure className="kc-theme-card" key={theme.name}>
                  <Shot
                    src={theme.src}
                    alt={`${theme.name} theme applied to the Shobdo keyboard`}
                    ratio="1080 / 2400"
                    sizes="196px"
                  />
                  <figcaption className="kc-theme-name">
                    <span>{theme.name}</span>
                    <span className="kc-theme-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="kc-section kc-specimen" id="specimen">
          <div className="kc-wrap">
            <div className="kc-section-head">
              <div>
                <p className="kc-eyebrow">03 / The Banglish decoder</p>
                <h2 className="kc-section-title">Type Roman. Read Bangla.</h2>
              </div>
              <p className="kc-section-note">
                AVRO-style rules with offline reverse lookup, prefix completion
                and spelling-error fallback. Add your own words in settings.
              </p>
            </div>

            <div className="kc-banglish kc-reveal">
              {banglishRows.map((row) => (
                <div className="kc-banglish-row" key={row.roman}>
                  <span className="kc-roman">{row.roman}</span>
                  <span className="kc-arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="kc-bangla" lang="bn">
                    {row.bangla}
                  </span>
                  <span className="kc-meaning">{row.meaning}</span>
                </div>
              ))}
            </div>

            <div className="kc-specimen-foot">
              <span>Press space to accept the first candidate</span>
              <span>Tap the Roman chip to keep English</span>
              <span>Hold backspace to repeat</span>
            </div>
          </div>
        </section>

        <section className="kc-section" id="captures">
          <div className="kc-wrap">
            <div className="kc-section-head">
              <div>
                <p className="kc-eyebrow">04 / The captures</p>
                <h2 className="kc-section-title">The whole desk.</h2>
              </div>
              <p className="kc-section-note">
                Onboarding, candidates, theme picker and settings, captured on an
                Android 15 emulator.
              </p>
            </div>

            <div className="kc-gallery-grid">
              {gallerySources.map((src, index) => {
                const wide = galleryShots.find((shot) => shot.src === src)?.wide;
                return (
                  <figure
                    className={`kc-shot kc-reveal ${wide ? "kc-shot--wide" : ""}`}
                    key={`${src}-${index}`}
                  >
                    <Shot
                      src={src}
                      alt={captionFor(src)}
                      ratio={ratioFor(src)}
                      sizes={wide ? "(min-width: 860px) 50vw, 100vw" : "(min-width: 860px) 33vw, 100vw"}
                    />
                    <figcaption>
                      <span className="kc-shot-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{captionFor(src)}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        <section className="kc-section kc-proof" id="proof">
          <div className="kc-wrap">
            <div className="kc-section-head">
              <div>
                <p className="kc-eyebrow">05 / The proof</p>
                <h2 className="kc-section-title">Small, tested, offline.</h2>
              </div>
              <p className="kc-section-note">
                v0.4.0 is R8-shrunk, resource-shrunk and signed. Its permissions
                cover vibration and an app-specific AndroidX receiver.
              </p>
            </div>

            <div className="kc-proof-grid">
              {proofPoints.map((point) => (
                <div className="kc-proof-cell" key={point.label}>
                  <p className="kc-proof-value">{point.value}</p>
                  <p className="kc-proof-label">{point.label}</p>
                </div>
              ))}
            </div>

            <pre className="kc-proof-code">
              <code>
                {`$ aapt dump permissions Shobdo-Keyboard-v0.4.0.apk
package: app.shobdo.keyboard
uses-permission: name='android.permission.VIBRATE'
permission: app.shobdo.keyboard.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
uses-permission: name='app.shobdo.keyboard.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
`}
                <span className="kc-ok">✓ no INTERNET permission</span>
              </code>
            </pre>

            <div className="kc-proof-foot">
              <span>v0.4.0 / 98 unit tests / 0 failures</span>
              <span>Lint: 0 errors</span>
              <span>minSdk 26 · targetSdk 35</span>
              <span>MIT © 34rns</span>
            </div>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="kc-section">
            <div className="kc-wrap">
              <div className="kc-section-head">
                <div>
                  <p className="kc-eyebrow">More from the bench</p>
                  <h2 className="kc-section-title">Other specimens.</h2>
                </div>
              </div>

              <div className="kc-related-grid">
                {related.slice(0, 3).map((item, index) => (
                  <Link
                    className="kc-related-card"
                    href={`/projects/${item.slug}`}
                    key={item.slug}
                  >
                    <span className="kc-related-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="kc-related-title">{item.title}</span>
                    <span className="kc-related-meta">
                      {item.year} / Case study
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {next ? (
          <section className="kc-section">
            <div className="kc-wrap kc-next">
              <span className="kc-next-label">Next specimen</span>
              <Link className="kc-next-link" href={`/projects/${next.slug}`}>
                <span className="kc-next-title">{next.title}</span>
                <span className="kc-next-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </section>
        ) : null}

        <footer className="kc-footer kc-wrap">
          <span>
            Shobdo Keyboard / Android IME / {project.year}
          </span>
          <span>Set in Archivo, Newsreader, Tiro Bangla &amp; DM Mono</span>
          <Link href="#top">Back to top ↑</Link>
        </footer>
      </main>
    </div>
  );
}
