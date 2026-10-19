import { SmartImage } from "@/components/smart-image";
import type { ProjectView } from "@/lib/projects/view";

export function Cover({
  project,
  ratio = "16 / 9",
  priority = false,
  sizes = "(min-width: 768px) 70vw, 100vw",
}: {
  project: ProjectView;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className="relative w-full overflow-hidden bg-[var(--theme-surface)]"
      style={{ aspectRatio: ratio, borderRadius: "var(--theme-radius)" }}
    >
      {project.coverImageUrl ? (
        <SmartImage
          src={project.coverImageUrl}
          alt={`${project.title} cover`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between p-5 md:p-7"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-surface) 0%, color-mix(in oklab, var(--theme-accent) 16%, var(--theme-surface)) 100%)",
          }}
        >
          <span className="mono text-[var(--theme-accent)]">{project.year}</span>
          <span className="display text-[clamp(1.6rem,4.4vw,3.2rem)] font-medium">
            {project.title}
          </span>
          <span className="mono text-[var(--theme-muted)]">
            {project.tags.slice(0, 3).join(" / ")}
          </span>
        </div>
      )}
    </div>
  );
}
