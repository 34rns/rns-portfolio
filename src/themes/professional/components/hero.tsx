"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero({ latest }: { latest?: ProjectView }) {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto mt-8 max-w-[1440px] px-5 md:mt-14 md:px-10">
      <div className="overflow-hidden">
        <motion.h1
          className="display text-[clamp(5.4rem,21vw,20rem)] font-semibold"
          initial={reduce ? false : { y: "106%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.15, ease }}
        >
          RNS
          <span className="sr-only"> — {site.role}</span>
        </motion.h1>
      </div>

      <motion.div
        aria-hidden="true"
        className="mt-2 h-px w-full origin-left bg-[var(--theme-line)]"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.25, ease }}
      />

      <div className="mt-7 grid gap-6 md:grid-cols-12 md:gap-10">
        <motion.p
          className="text-[1.32rem] leading-[1.4] md:col-span-5 md:text-[1.55rem]"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease }}
        >
          {site.role}.
        </motion.p>
        <motion.p
          className="max-w-[52ch] text-[1.06rem] leading-[1.7] text-[var(--theme-muted)] md:col-span-6 md:col-start-7"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease }}
        >
          I design and build web products end to end — storefronts, tools, and the
          occasional game. Currently working with Next.js, TypeScript, and Postgres.
        </motion.p>
      </div>

      {latest ? (
        <motion.div
          className="mt-12 flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--theme-line)] py-4 md:mt-16"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
        >
          <span className="mono text-[var(--theme-muted)]">Latest</span>
          <Link
            href={`/projects/${latest.slug}`}
            className="nav-link text-[1rem]"
            data-cursor="view"
          >
            {latest.title}
          </Link>
          <span className="mono text-[var(--theme-muted)]">{latest.year}</span>
        </motion.div>
      ) : null}
    </section>
  );
}
