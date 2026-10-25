import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ReleaseVersion } from "@/components/release-version";
import { SmartImage } from "@/components/smart-image";
import { isReleaseDownloadLink } from "@/lib/projects/links";
import type { ProjectPageProps } from "../types";
import { ParallaxCover } from "./components/parallax-cover";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="nav-link text-[0.95rem]"
      data-cursor="view"
    >
      {children}
    </a>
  );
}

export function ProfessionalProjectPage({ project, next, access }: ProjectPageProps) {
  return (
    <div className="min-h-screen pb-20">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 pt-7 md:px-10">
        <Link href="/" className="display text-[1.35rem] font-semibold">
          RNS
        </Link>
        <Link href="/#work" className="nav-link text-[0.95rem]">
          All work
        </Link>
      </header>

      <article className="mx-auto mt-14 max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-8">
            <p className="mono text-[var(--theme-muted)]">
              {project.year} / {project.tags.join(" / ")}
            </p>
            <h1 className="display mt-4 text-[clamp(2.8rem,8vw,7.5rem)] font-medium">
              {project.title}
            </h1>
          </div>
          <p className="max-w-[38ch] text-[1.22rem] leading-[1.5] text-[var(--theme-muted)] md:col-span-4 md:self-end md:pb-3">
            {project.tagline}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-[var(--theme-line)] py-4">
          {project.liveUrl ? (
            <ExternalLink href={project.liveUrl}>
              {isReleaseDownloadLink(project.liveUrl) ? "Download" : "Live site"}
              {isReleaseDownloadLink(project.liveUrl) && project.repoUrl ? (
                <ReleaseVersion
                  repoUrl={project.repoUrl}
                  className="ml-2 text-[var(--theme-muted)]"
                />
              ) : null}
            </ExternalLink>
          ) : null}
          {project.repoUrl ? (
            <ExternalLink href={project.repoUrl}>Repository</ExternalLink>
          ) : null}
          {project.isPaid ? (
            <span className="mono text-[var(--theme-muted)]">
              Paid product
            </span>
          ) : null}
        </div>

        {access ? <div className="mt-10">{access}</div> : null}

        <div className="mt-10 md:mt-14">
          <ParallaxCover project={project} />
        </div>

        <div className="mx-auto mt-16 max-w-[720px]">
          <div className="editorial">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.description}
            </ReactMarkdown>
          </div>
        </div>

        {project.gallery.length > 0 ? (
          <div className="mx-auto mt-16 grid max-w-[1100px] gap-4 sm:grid-cols-2">
            {project.gallery.map((src, index) => (
              <div
                key={src}
                className="relative overflow-hidden bg-[var(--theme-surface)]"
                style={{ borderRadius: "var(--theme-radius)" }}
              >
                <SmartImage
                  src={src}
                  alt={`${project.title} — image ${index + 1}`}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
              </div>
            ))}
          </div>
        ) : null}
      </article>

      {next ? (
        <div className="mx-auto mt-24 max-w-[1440px] px-5 md:px-10">
          <Link
            href={`/projects/${next.slug}`}
            className="group block border-t border-[var(--theme-line)] pt-6"
            data-cursor="view"
          >
            <span className="mono text-[var(--theme-muted)]">Next project</span>
            <span className="display mt-2 block text-[clamp(2rem,6vw,5rem)] font-medium transition-colors duration-300 group-hover:text-[var(--theme-accent)]">
              {next.title}
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
