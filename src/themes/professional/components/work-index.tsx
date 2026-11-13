import Link from "next/link";
import type { ProjectView } from "@/lib/projects/view";
import { Cover } from "../cover";
import { professionalLandingContent, type LandingContent } from "../landing-content";
import { ArrowIcon } from "./icons";

export function WorkIndex({ projects, content = professionalLandingContent.work }: { projects: ProjectView[]; content?: LandingContent["work"] }) {
  return (
    <section id="work" className="rns-work rns-shell" aria-labelledby="rns-work-title">
      <div className="rns-section-heading">
        <h2 id="rns-work-title">{content.headline.map((line,index) => <span key={index}>{line}</span>)}</h2>
        <span className="rns-project-count">{projects.length} projects</span>
      </div>
      {projects.length ? (
        <ul className="rns-project-grid">
          {projects.map((project, index) => {
            const visual = !!project.coverImageUrl && !content.textOnlySlugs?.includes(project.slug);
            return (
              <li key={project.slug} className={`rns-project${visual ? "" : " rns-project-text"}`}>
                <Link href={`/projects/${project.slug}`} className="rns-project-link" prefetch={false}>
                  {visual && <div className="rns-project-image"><Cover project={project} ratio="16 / 9" priority={index === 0} sizes="(min-width: 1600px) 1440px, (min-width: 700px) 92vw, calc(100vw - 40px)" /></div>}
                  <div className="rns-project-copy">
                    <div className="rns-project-meta"><span>{project.year}</span><span>{project.isPaid ? "Pro project" : "Case study"}</span></div>
                    <div className="rns-project-title"><h3 id={`project-${project.slug}`}>{project.title}</h3><span className="rns-project-arrow"><ArrowIcon /></span></div>
                    <p>{project.tagline}</p>
                    <ul className="rns-project-tags" aria-label={`${project.title} technologies`}>{project.tags.slice(0, 3).map(tag => <li key={tag}>{tag}</li>)}</ul>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rns-empty-work">New case studies will appear here. In the meantime, explore my repositories on <a href="https://github.com/34rns">GitHub</a>.</p>
      )}
    </section>
  );
}
