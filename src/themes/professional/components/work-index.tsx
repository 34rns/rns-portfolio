"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useState } from "react";
import type { ProjectView } from "@/lib/projects/view";
import { Cover } from "../cover";

export function WorkIndex({ projects }: { projects: ProjectView[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 32, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 280, damping: 32, mass: 0.6 });

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const activeProject = projects.find((project) => project.slug === active) ?? null;
  const showFloating = finePointer && !reduce;

  return (
    <section id="work" className="mx-auto mt-24 max-w-[1440px] px-5 md:px-10">
      <div className="flex items-baseline justify-between border-b border-[var(--theme-line)] pb-3">
        <h2 className="text-[1.05rem]">Selected work</h2>
        <span className="mono text-[var(--theme-muted)]">
          {String(projects.length).padStart(2, "0")} projects
        </span>
      </div>

      <ul
        onMouseLeave={() => setActive(null)}
        onMouseMove={(event) => {
          if (!showFloating) return;
          x.set(event.clientX + 28);
          y.set(event.clientY - 110);
        }}
      >
        {projects.map((project, index) => (
          <li key={project.slug} className="border-b border-[var(--theme-line)]">
            <Link
              href={`/projects/${project.slug}`}
              className="group block py-6 md:py-8"
              onMouseEnter={() => setActive(project.slug)}
              onFocus={() => setActive(project.slug)}
              onBlur={() => setActive(null)}
              data-cursor="view"
            >
              <div className="grid grid-cols-12 items-baseline gap-3">
                <span className="mono col-span-2 text-[var(--theme-muted)] md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10 md:col-span-7">
                  <h3 className="display text-[clamp(1.8rem,5.2vw,4.2rem)] font-medium transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-[var(--theme-muted)] md:hidden">
                    {project.tagline}
                  </p>
                </div>
                <span className="mono col-span-10 col-start-3 mt-3 text-[var(--theme-muted)] md:col-span-2 md:col-start-9 md:mt-0">
                  {project.year}
                </span>
                <span className="mono col-span-10 col-start-3 mt-1 text-[var(--theme-muted)] md:col-span-2 md:col-start-11 md:mt-0 md:text-right">
                  {project.tags.slice(0, 2).join(" / ")}
                </span>
              </div>
              <div className="mt-4 md:hidden">
                <Cover project={project} ratio="16 / 10" sizes="100vw" />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {showFloating ? (
        <AnimatePresence>
          {activeProject ? (
            <motion.div
              key={activeProject.slug}
              className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[22rem] md:block"
              style={{ x: springX, y: springY }}
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Cover project={activeProject} ratio="4 / 3" sizes="22rem" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </section>
  );
}
