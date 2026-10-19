import Link from "next/link";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";

export function Hero({ latest }: { latest?: ProjectView }) {
  return (
    <section className="mx-auto mt-8 max-w-[1440px] px-5 md:mt-14 md:px-10">
      <div className="overflow-hidden">
        <h1 className="display hero-title text-[clamp(5.4rem,21vw,20rem)] font-semibold">
          RNS
          <span className="sr-only"> — {site.role}</span>
        </h1>
      </div>

      <div aria-hidden="true" className="hero-rule mt-2 h-px w-full bg-[var(--theme-line)]" />

      <div className="mt-7 grid gap-6 md:grid-cols-12 md:gap-10">
        <p className="hero-settle text-[1.32rem] leading-[1.4] md:col-span-5 md:text-[1.55rem]">
          {site.role}.
        </p>
        <p className="hero-settle hero-settle-late max-w-[52ch] text-[1.06rem] leading-[1.7] text-[var(--theme-muted)] md:col-span-6 md:col-start-7">
          I design and build web products end to end — storefronts, tools, and the
          occasional game. Currently working with Next.js, TypeScript, and Postgres.
        </p>
      </div>

      {latest ? (
        <div className="hero-settle hero-settle-late mt-12 flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--theme-line)] py-4 md:mt-16">
          <span className="mono text-[var(--theme-muted)]">Latest</span>
          <Link
            href={`/projects/${latest.slug}`}
            className="nav-link text-[1rem]"
            data-cursor="view"
          >
            {latest.title}
          </Link>
          <span className="mono text-[var(--theme-muted)]">{latest.year}</span>
        </div>
      ) : null}
    </section>
  );
}
