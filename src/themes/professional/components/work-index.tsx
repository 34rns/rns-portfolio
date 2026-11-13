import Link from "next/link";
import type { ProjectView } from "@/lib/projects/view";
import { Cover } from "../cover";

export function WorkIndex({ projects }: { projects: ProjectView[] }) {
  return (
    <section id="work" className="rns-work rns-shell" aria-labelledby="rns-work-title">
      <div className="rns-section-heading" data-reveal>
        <div><h2 id="rns-work-title">Selected work</h2><p>Different problems. The same attention to detail.</p></div>
        <span className="rns-project-count">{projects.length} projects</span>
      </div>
      {projects.length ? (
        <ul className="rns-project-grid">
          {projects.map((project, index) => (
            <li key={project.slug} className={index === 0 ? "rns-project rns-project-lead" : index === projects.length - 1 && projects.length % 2 === 0 ? "rns-project rns-project-tail" : "rns-project"} data-reveal>
              <Link href={`/projects/${project.slug}`} className="rns-project-link" prefetch={false}>
                <div className="rns-project-image"><Cover project={project} ratio="16 / 10" sizes={index === 0 ? "(min-width: 900px) 760px, (min-width: 640px) 90vw, calc(100vw - 40px)" : "(min-width: 900px) 600px, (min-width: 640px) 44vw, calc(100vw - 40px)"} /></div>
                <div className="rns-project-copy" data-brand-tone={index === 0 ? "dark" : "light"}>
                  <div className="rns-project-meta"><span>{project.year}</span><span>{project.isPaid ? "Pro project" : "Case study"}</span></div>
                  <div className="rns-project-title"><h3 id={`project-${project.slug}`}>{project.title}</h3><span className="rns-project-arrow" aria-hidden="true">↗</span></div>
                  <p>{project.tagline}</p>
                  <ul className="rns-project-tags" aria-label={`${project.title} technologies`}>{project.tags.slice(0, 3).map(tag => <li key={tag}>{tag}</li>)}</ul>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rns-empty-work">New case studies will appear here. In the meantime, explore my repositories on <a href="https://github.com/34rns">GitHub</a>.</p>
      )}
    </section>
  );
}
