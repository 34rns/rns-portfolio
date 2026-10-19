"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { ProjectView } from "@/lib/projects/view";
import { Cover } from "../cover";

export function ParallaxCover({ project }: { project: ProjectView }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        className="will-change-transform"
        style={reduce ? undefined : { y, scale: 1.06 }}
      >
        <Cover
          project={project}
          priority
          sizes="(min-width: 1440px) 1440px, 100vw"
        />
      </motion.div>
    </div>
  );
}
