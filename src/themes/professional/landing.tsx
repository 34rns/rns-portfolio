import Link from "next/link";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";
import { Hero } from "./components/hero";
import { MagneticLink } from "./components/magnetic-link";
import { WorkIndex } from "./components/work-index";

const capabilities = [
  {
    title: "Product engineering",
    body: "Next.js and TypeScript on the front, Postgres and auth behind it. Built to deploy, not to demo.",
  },
  {
    title: "Interface design",
    body: "Typography, grid, and token systems that survive contact with real content and real screens.",
  },
  {
    title: "Motion & interaction",
    body: "Scroll choreography, hover states, and transitions with a reduced-motion path for everyone else.",
  },
  {
    title: "Games & 3D",
    body: "Unity, C#, and shader work — the same craft applied to a scene instead of a page.",
  },
];

function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 pt-7 md:px-10">
      <Link href="/" className="display text-[1.35rem] font-semibold">
        RNS
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-5 text-[0.95rem]">
        <a href="#work" className="nav-link">
          Work
        </a>
        <a href="#about" className="nav-link">
          About
        </a>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="nav-link"
          data-cursor="view"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto mt-28 max-w-[1440px] px-5 md:px-10">
      <div className="grid gap-8 border-t border-[var(--theme-line)] pt-8 md:grid-cols-12 md:gap-10">
        <h2 className="text-[1.05rem] md:col-span-3">About</h2>
        <div className="space-y-6 text-[1.18rem] leading-[1.72] md:col-span-8 md:col-start-5">
          <p>
            I&apos;m RNS — a full-stack engineer who cares about how things feel,
            not just whether they work. My work sits where product engineering
            meets interface design: commerce, tools, interaction, and the
            occasional 3D detour.
          </p>
          <p>
            Most of what I build starts in the browser and ends in production.
            MoneyKick Shop runs a real storefront with Bkash payments for the
            Bangladesh market. RISE turns workouts into a rank-up loop.
            OfficeChaos is a Unity playground for shaders and character rigs.
            Different mediums, same obsession: make it fast, make it legible,
            make it feel alive.
          </p>
        </div>
      </div>

      <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-[var(--theme-line)] pt-6 sm:grid-cols-3">
        <div>
          <dt className="mono text-[var(--theme-muted)]">Focus</dt>
          <dd className="mt-1 text-[1.02rem]">Product engineering</dd>
        </div>
        <div>
          <dt className="mono text-[var(--theme-muted)]">Stack</dt>
          <dd className="mt-1 text-[1.02rem]">TypeScript, Next.js, Postgres</dd>
        </div>
        <div>
          <dt className="mono text-[var(--theme-muted)]">Also</dt>
          <dd className="mt-1 text-[1.02rem]">Unity, C#, motion design</dd>
        </div>
      </dl>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="mx-auto mt-28 max-w-[1440px] px-5 md:px-10">
      <div className="grid gap-8 border-t border-[var(--theme-line)] pt-8 md:grid-cols-12 md:gap-10">
        <h2 className="text-[1.05rem] md:col-span-3">What I do</h2>
        <ul className="md:col-span-8 md:col-start-5">
          {capabilities.map((item) => (
            <li
              key={item.title}
              className="grid gap-2 border-b border-[var(--theme-line)] py-6 first:pt-0 last:border-b-0 sm:grid-cols-[14rem_1fr] sm:gap-6"
            >
              <span className="text-[1.12rem]">{item.title}</span>
              <span className="text-[1.02rem] leading-[1.65] text-[var(--theme-muted)]">
                {item.body}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto mt-28 max-w-[1440px] px-5 md:px-10">
      <div className="border-t border-[var(--theme-line)] pt-8">
        <p className="display max-w-[22ch] text-[clamp(2.4rem,7vw,6rem)] font-medium">
          Have something worth building?
        </p>
        <p className="mt-6 max-w-[44ch] text-[1.08rem] leading-[1.7] text-[var(--theme-muted)]">
          The fastest way to reach me is on GitHub. I read everything and reply
          there.
        </p>
        <div className="mt-8">
          <MagneticLink href={site.github} external>
            @{site.handle}
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto mt-24 flex max-w-[1440px] flex-wrap items-baseline justify-between gap-4 border-t border-[var(--theme-line)] px-5 py-6 md:px-10">
      <span className="mono text-[var(--theme-muted)]">
        © {new Date().getFullYear()} RNS
      </span>
      <span className="mono text-[var(--theme-muted)]">
        Next.js, Postgres, Vercel
      </span>
      <a href="#top" className="mono nav-link text-[var(--theme-muted)]">
        Back to top
      </a>
    </footer>
  );
}

export function ProfessionalLanding({ projects }: { projects: ProjectView[] }) {
  return (
    <div id="top" className="relative overflow-x-clip">
      <SiteHeader />
      <main id="main">
        <Hero latest={projects[0]} />
        <WorkIndex projects={projects} />
        <About />
        <Capabilities />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
