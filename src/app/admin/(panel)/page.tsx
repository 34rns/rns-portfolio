import Link from "next/link";
import { getAllProjects, getAdminStats } from "@/lib/db/queries";
import { dbStore } from "@/lib/payments/db-store";
import { formatPrice } from "@/lib/projects/view";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const [stats, projects, commerce] = await Promise.all([getAdminStats(), getAllProjects(), dbStore.commerceStats()]);
  return <div><header className="admin-page-heading"><div><span className="admin-eyebrow">RNS STUDIO</span><h1>Your creative workspace.</h1><p>Keep your projects current and your portfolio unmistakably yours.</p></div><Link href="/admin/projects/new" className="admin-primary">+ New project</Link></header>
    <div className="admin-stat-grid">{[{ label: "Total projects", value: stats.total, note: "In your library" }, { label: "Published", value: stats.published, note: "Publicly available" }, { label: "Drafts", value: stats.drafts, note: "Work in progress" }, { label: "Paid projects", value: stats.paid, note: "Products in your library" }].map(s => <div className="admin-card admin-stat" key={s.label}><span>{s.label}</span><strong>{s.value}</strong><small>{s.note}</small></div>)}</div>
    <div className="admin-overview-grid"><section className="admin-card"><div className="admin-card-title"><h2>Project library</h2><Link href="/admin/projects">View all ↗</Link></div>{projects.slice(0,5).map(p => <Link className="admin-project-row" key={p.id} href={`/admin/projects/${p.id}`}><div><strong>{p.title}</strong><small>/{p.slug} · {p.theme}</small><small>Updated {p.updatedAt.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</small></div><span className={"admin-badge " + p.status}>{p.status}</span></Link>)}{!projects.length && <p className="admin-empty">Your next project starts here.</p>}</section>
    <div><section className="admin-site-card"><span className="admin-eyebrow">MAKE IT YOURS</span><h2>One studio.<br />Your signature.</h2><p>Edit your words, accent, 3D identity and featured work in one place.</p><Link href="/admin/site" className="admin-primary">Customize portfolio ↗</Link></section><section className="admin-commerce"><div className="admin-card"><h2>Visitor accounts</h2><strong>{commerce.signups}</strong><p>Registered accounts</p></div><div className="admin-card"><h2>Revenue</h2><strong>{commerce.revenue.length ? commerce.revenue.map(e => formatPrice(e.cents,e.currency)).join(" + ") : formatPrice(0,"USD")}</strong><p>{commerce.paidOrders} paid orders · <Link href="/admin/orders">View orders ↗</Link></p></div></section></div></div>
  </div>;
}
