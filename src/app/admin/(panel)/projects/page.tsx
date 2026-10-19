import Link from "next/link";
import { getAllProjects } from "@/lib/db/queries";
import { deleteProject, moveProject, togglePublish } from "../../actions";
import { ConfirmButton } from "../../confirm-button";

export const dynamic = "force-dynamic";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-[#D8D8D2] px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-[#6B6B64]">
      {children}
    </span>
  );
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div>
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Order here controls the landing page index.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-[#14171A] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="mt-8 border border-dashed border-[#D8D8D2] p-10 text-center">
          <p className="text-sm text-[#6B6B64]">
            No projects yet. Create the first one to see the landing page fill in.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[#E1E1DA] border-y border-[#E1E1DA]">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {project.title}
                  </Link>
                  <Badge>{project.status}</Badge>
                  {project.placement === "unlisted" ? <Badge>unlisted</Badge> : null}
                  {project.isPaid ? <Badge>paid</Badge> : null}
                </div>
                <p className="mono mt-1 truncate text-[#6B6B64]">
                  /{project.slug} · {project.theme} · position {index + 1}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <Link
                  href={`/admin/preview/${project.id}`}
                  target="_blank"
                  className="underline"
                >
                  Preview
                </Link>

                <form action={togglePublish}>
                  <input type="hidden" name="id" value={project.id} />
                  <button type="submit" className="underline">
                    {project.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </form>

                <form action={moveProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    className="underline disabled:opacity-30"
                    disabled={index === 0}
                  >
                    Move up
                  </button>
                </form>

                <form action={moveProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    className="underline disabled:opacity-30"
                    disabled={index === projects.length - 1}
                  >
                    Move down
                  </button>
                </form>

                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <ConfirmButton
                    message={`Delete "${project.title}"? This cannot be undone.`}
                    className="text-[#B3261E] underline"
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
