import Link from "next/link";
import { SmartImage } from "@/components/smart-image";
import type { ProjectPageProps } from "../types";
import { folderdockStyles } from "./styles";

const INSTALL_URL =
  "https://github.com/34rns/FolderDock/blob/main/extension/README.md";
const RELEASE_URL =
  "https://github.com/34rns/FolderDock/releases/tag/v1.0.2";
const ISSUES_URL = "https://github.com/34rns/FolderDock/issues";

const steps = [
  {
    title: "Add a folder",
    body: "Choose a library root and keep its real folder structure. FolderDock waits for a selection before it starts scanning or watching files.",
  },
  {
    title: "Find and preview",
    body: "Search names and tags, filter file types, revisit favorites and recents, then inspect images, video or an audio waveform before acting.",
  },
  {
    title: "Place it in context",
    body: "Import or insert into the active Premiere sequence or After Effects composition, with clear manual fallbacks where CEP has limits.",
  },
];

const features = [
  {
    title: "Folders stay familiar",
    body: "Recursive browsing, filename and tag search, type filters, sorting, favorites and recent imports work on the library you already maintain.",
  },
  {
    title: "Preview before placement",
    body: "Images and videos use their source or matching preview files. Mirrored preview folders can supply thumbnails without appearing in the tree.",
  },
  {
    title: "Audio waits for you",
    body: "Browsing remains silent. Select a file to see a full-file waveform, seek through it and start playback deliberately from the preview controls.",
  },
  {
    title: "Processing stays local",
    body: "Host-specific placement uses Adobe's panel bridge. Optional FFmpeg can make additional previews and waveforms, but it is installed separately and never downloaded automatically.",
  },
];

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

function ProductWindow({
  src,
  alt,
  priority = false,
  label,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  label: string;
}) {
  return (
    <div className="fd-window">
      <div className="fd-window-bar">
        <div className="fd-window-dots" aria-hidden="true">
          <span className="fd-window-dot" />
          <span className="fd-window-dot" />
          <span className="fd-window-dot" />
        </div>
        <span>{label}</span>
        <span>FolderDock</span>
      </div>
      <div className="fd-frame">
        <SmartImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 900px) 62vw, 100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function FolderDockProjectPage({ project }: ProjectPageProps) {
  const libraryImage =
    project.coverImageUrl ?? "/projects/folderdock/library.webp";
  const audioImage =
    project.gallery.find((src) => src.includes("audio")) ??
    "/projects/folderdock/audio.webp";

  return (
    <div className="fd-page" id="top">
      <style>{folderdockStyles}</style>

      <header className="fd-shell fd-header">
        <Link href="/" className="fd-brand">
          RNS
        </Link>
        <nav className="fd-nav" aria-label="FolderDock project navigation">
          <Link href="/#work">Back to projects</Link>
          <a href="#features">Features</a>
          <a href="#install">Install</a>
          {project.repoUrl ? (
            <ExternalLink href={project.repoUrl}>GitHub</ExternalLink>
          ) : null}
        </nav>
      </header>

      <main id="main">
        <section className="fd-shell fd-hero" aria-labelledby="folderdock-title">
          <div className="fd-hero-copy">
            <p className="fd-kicker">Free release · Open source · Local-first</p>
            <h1 className="fd-title" id="folderdock-title">
              FolderDock
            </h1>
            <h2 className="fd-headline">
              Bring your asset library into your editing workspace.
            </h2>
            <p className="fd-lede">
              Browse your folders, inspect media and choose what to place while
              working in Premiere Pro or After Effects. No account, subscription,
              telemetry or cloud library.
            </p>
            <div className="fd-actions">
              {project.liveUrl ? (
                <ExternalLink
                  href={project.liveUrl}
                  className="fd-button fd-button--primary"
                >
                  Download v1.0.2 free
                </ExternalLink>
              ) : null}
              {project.repoUrl ? (
                <ExternalLink
                  href={project.repoUrl}
                  className="fd-button fd-button--secondary"
                >
                  View source
                </ExternalLink>
              ) : null}
            </div>
            <p className="fd-meta">
              Free release · Unsigned CEP panel · Runs locally
            </p>
          </div>

          <ProductWindow
            src={libraryImage}
            alt="FolderDock browsing a local image library with folder navigation, filters and a selected preview"
            priority
            label="Library / browser preview"
          />
        </section>

        <section className="fd-shell fd-section" aria-labelledby="workflow-title">
          <p className="fd-section-label">Workflow</p>
          <h2 className="fd-section-title" id="workflow-title">
            From folder to timeline without breaking concentration.
          </h2>
          <div className="fd-steps">
            {steps.map((step, index) => (
              <article className="fd-step" key={step.title}>
                <span className="fd-step-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="fd-shell fd-section"
          id="features"
          aria-labelledby="features-title"
        >
          <p className="fd-section-label">Features</p>
          <h2 className="fd-section-title" id="features-title">
            A local browser built for editors, not another asset cloud.
          </h2>
          <p className="fd-section-intro">
            FolderDock works with ordinary files and folders. It adds a focused
            browsing layer around them while leaving source media untouched.
          </p>
          <div className="fd-feature-grid">
            {features.map((feature) => (
              <article className="fd-feature" key={feature.title}>
                <span className="fd-feature-mark" aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fd-shell fd-section" aria-labelledby="showcase-title">
          <p className="fd-section-label">Inside the panel</p>
          <h2 className="fd-section-title" id="showcase-title">
            The library and the listening view.
          </h2>
          <p className="fd-section-intro">
            These images show the real browser preview with generated demo media
            and simulated Adobe imports. They are not a fresh in-app Adobe
            verification pass.
          </p>
          <div className="fd-showcase">
            <figure className="fd-shot">
              <a href={libraryImage} target="_blank" rel="noreferrer">
                <ProductWindow
                  src={libraryImage}
                  alt="FolderDock library grid with recursive folder navigation and an image preview"
                  label="Image library"
                />
              </a>
              <figcaption className="fd-caption">
                Browse nested folders, filter the grid and inspect the selected
                asset before choosing an action.
              </figcaption>
            </figure>
            <figure className="fd-shot">
              <a href={audioImage} target="_blank" rel="noreferrer">
                <ProductWindow
                  src={audioImage}
                  alt="FolderDock audio library with waveform cards and explicit playback controls"
                  label="Audio preview"
                />
              </a>
              <figcaption className="fd-caption">
                Audio stays silent while browsing; playback and seeking live in
                the selected-file preview.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="fd-shell fd-section" aria-labelledby="story-title">
          <div className="fd-story-grid">
            <div>
              <p className="fd-section-label">Project story</p>
              <h2 className="fd-section-title" id="story-title">
                Keep local assets close to the work.
              </h2>
            </div>
            <div className="fd-story">
              <h3>The problem</h3>
              <p>
                Editing often means leaving the timeline to search through
                scattered folders, opening files just to identify them and then
                returning to the right sequence or composition. The files are
                local, but the workflow is fragmented.
              </p>
              <h3>The approach</h3>
              <p>
                FolderDock treats the folder tree as the source of truth and
                puts a fast, previewable layer around it inside the editing
                workspace. Preferences, tags, favorites and generated previews
                remain local. Source assets are never rewritten.
              </p>
              <div className="fd-tech-line" aria-label="FolderDock technology">
                <span>CEP</span>
                <span>JavaScript</span>
                <span>CSS</span>
                <span>ExtendScript</span>
                <span>Optional FFmpeg</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="fd-shell fd-section"
          id="install"
          aria-labelledby="install-title"
        >
          <div className="fd-install-grid">
            <div>
              <p className="fd-section-label">Install and compatibility</p>
              <h2 className="fd-section-title" id="install-title">
                A free release with the limits stated plainly.
              </h2>
              <p className="fd-section-intro">
                FolderDock uses Adobe CEP, not UXP. The manifest declares
                Premiere Pro 14+ and After Effects 17+, but that range is not a
                tested compatibility matrix.
              </p>
            </div>
            <div className="fd-install-panel">
              <h3>Windows setup</h3>
              <ol>
                <li>Download and extract the free v1.0.2 ZIP.</li>
                <li>Close Premiere Pro and After Effects completely.</li>
                <li>Run the included PowerShell installer, reopen Adobe and select a folder.</li>
              </ol>
              <p>
                The installer preserves an existing copy and enables unsigned
                CEP panels for the current Windows user. A macOS installer is
                included, but its execution remains unverified.
              </p>
              <ExternalLink href={INSTALL_URL} className="fd-text-link">
                Read the complete installation guide
              </ExternalLink>

              <p className="fd-limit-title">Current limits</p>
              <ul className="fd-limit-list">
                <li>Adobe host compatibility varies by version; test it in your setup before production work.</li>
                <li>Some Premiere track setup and preset imports remain manual.</li>
                <li>CEP does not provide native panel-to-timeline file dragging here.</li>
                <li>Optional FFmpeg must be installed separately.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="fd-final">
          <div className="fd-shell fd-final-inner">
            <h2>Bring the folder you already trust into the panel.</h2>
            <div className="fd-actions">
              {project.liveUrl ? (
                <ExternalLink
                  href={project.liveUrl}
                  className="fd-button fd-button--primary"
                >
                  Download v1.0.2 free
                </ExternalLink>
              ) : null}
              <ExternalLink href={INSTALL_URL} className="fd-button fd-button--secondary">
                Installation guide
              </ExternalLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="fd-shell fd-footer">
        <span>
          FolderDock is an independent open-source project and is not affiliated
          with or endorsed by Adobe.
        </span>
        <nav className="fd-footer-links" aria-label="FolderDock resources">
          <ExternalLink href={RELEASE_URL}>Release notes</ExternalLink>
          <ExternalLink href={ISSUES_URL}>Issue tracker</ExternalLink>
          <Link href="/#work">Portfolio</Link>
          <a href="#top">Back to top</a>
        </nav>
      </footer>
    </div>
  );
}
