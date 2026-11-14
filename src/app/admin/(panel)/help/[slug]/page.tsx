import Link from "next/link";
import Markdown from "react-markdown";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/principal";
import { findHelp } from "@/lib/help/articles";
import { PageHeader } from "../../licensing-ui";
export default async function Page({params}:{params:Promise<{slug:string}>}){const principal=await requireCapability("help.read"),{slug}=await params,article=findHelp("",principal).find(a=>a.slug===slug);if(!article)notFound();return <><PageHeader eyebrow="HELP CENTER" title={article.title} description={`Updated ${article.updatedAt} · ${article.audience.join(", ")}`}><Link className="kg-link" href="/admin/help">← All guides</Link></PageHeader><article className="kg-help-copy"><Markdown>{article.body}</Markdown></article><nav className="kg-row-actions" style={{marginTop:30}} aria-label="Related actions">{article.relatedRoutes.map(route=><Link key={route} className="kg-button kg-button-subtle" href={route}>{route.startsWith("/admin/help/")?"Related guide":"Open workspace"} ↗</Link>)}</nav></>;}
