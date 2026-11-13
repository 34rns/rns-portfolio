"use client";
import { useState } from "react";
import Link from "next/link";
import { SmartImage } from "@/components/smart-image";
import { deleteProject, moveProject, togglePublish } from "../../actions";
import { ConfirmButton } from "../../confirm-button";
type Item = { id: string; slug: string; title: string; status: string; placement: string; theme: string; isPaid: boolean; cover: string | null; updatedAt: string };
export function ProjectLibrary({ projects }: { projects: Item[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = projects.map((p, index) => ({ ...p, index })).filter(p => (filter === "all" || p.status === filter) && [p.title,p.slug,p.theme].some(text => text.toLowerCase().includes(query.toLowerCase())));
  return <div><header className="admin-page-heading"><div><span className="admin-eyebrow">CONTENT LIBRARY</span><h1>Projects</h1><p>Your work, ready for the world. Library order controls the homepage.</p></div><Link href="/admin/projects/new" className="admin-primary">+ New project</Link></header>
    <div className="admin-card"><div className="admin-library-toolbar"><input aria-label="Search projects" type="search" className="admin-field admin-search" placeholder="Search name, slug or theme…" value={query} onChange={e => setQuery(e.target.value)} /><div className="admin-filter" aria-label="Project status">{["all","published","draft"].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All projects" : f === "published" ? "Published" : "Drafts"}</button>)}</div></div>
    <div aria-live="polite" className="sr-only">{filtered.length} projects shown</div>
    {filtered.map(p => <article className="admin-library-row" key={p.id}><div className="admin-library-thumb">{p.cover ? <SmartImage src={p.cover} alt="" fill sizes="48px" /> : p.title.charAt(0)}</div><div><div className="admin-library-meta"><h2><Link href={"/admin/projects/" + p.id}>{p.title}</Link></h2><span className={"admin-badge " + p.status}>{p.status}</span>{p.placement === "unlisted" && <span className="admin-badge">Unlisted</span>}{p.isPaid && <span className="admin-badge">Paid</span>}</div><p>/{p.slug} · {p.theme} · Position {p.index + 1} · Updated {new Date(p.updatedAt).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</p></div>
    <div className="admin-library-actions"><Link href={"/admin/projects/" + p.id}>Edit</Link><Link href={"/admin/projects/" + p.id + "#project-theme"} aria-label={"Edit theme for " + p.title}>Theme</Link><Link href={"/admin/preview/" + p.id} target="_blank">Preview ↗</Link><form action={togglePublish}><input name="id" type="hidden" value={p.id} /><button type="submit">{p.status === "published" ? "Unpublish" : "Publish"}</button></form><form action={moveProject}><input name="id" type="hidden" value={p.id} /><input name="direction" type="hidden" value="up" /><button type="submit" disabled={p.index === 0} aria-label={"Move " + p.title + " up"}>↑</button></form><form action={moveProject}><input name="id" type="hidden" value={p.id} /><input name="direction" type="hidden" value="down" /><button type="submit" disabled={p.index === projects.length - 1} aria-label={"Move " + p.title + " down"}>↓</button></form><form action={deleteProject}><input name="id" type="hidden" value={p.id} /><ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`} className="text-[#B3261E]">Delete</ConfirmButton></form></div></article>)}
    {!filtered.length && <div className="admin-empty">{projects.length ? "No projects match. Try a different search or status." : "Create your first project to start your library."}</div>}</div>
  </div>;
}
