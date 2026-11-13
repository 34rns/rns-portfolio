"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/admin", label: "Overview", icon: "grid" },
  { href: "/admin/site", label: "Site editor", icon: "site" },
  { href: "/admin/projects", label: "Projects", icon: "folder" },
  { href: "/admin/models", label: "3D models", icon: "cube" },
  { href: "/admin/orders", label: "Orders", icon: "bag" },
  { href: "/admin/licenses", label: "Licenses", icon: "key" },
  { href: "/admin/checkouts", label: "Checkouts", icon: "card" },
];
function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="13" y="3" width="6" height="6" rx="1" /><rect x="3" y="13" width="6" height="6" rx="1" /><rect x="13" y="13" width="6" height="6" rx="1" /></>,
    site: <><rect x="2" y="3" width="18" height="16" rx="2" /><path d="M2 8h18M8 8v11" /></>,
    folder: <path d="M2 7V4h7l3 3h8v12H2Z" />,
    cube: <><path d="m11 2 9 5v10l-9 5-9-5V7Zm-9 5 9 5 9-5M11 12v10" /></>,
    bag: <><rect x="3" y="7" width="16" height="14" rx="2" /><path d="M7 7V5a4 4 0 0 1 8 0v2" /></>,
    key: <><circle cx="8" cy="8" r="5" /><path d="m12 12 8 8m-3-3 3-3" /></>,
    card: <><rect x="2" y="4" width="18" height="14" rx="2" /><path d="M2 9h18M5 14h4" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
export function AdminShell({ children, email, logout }: { children: ReactNode; email: string | null | undefined; logout: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = navigation.find(n => n.href === "/admin" ? path === n.href : path.startsWith(n.href));
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand-row"><Link href="/admin" className="admin-brand"><span />RNS<small>STUDIO</small></Link><button className="admin-menu-toggle" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="admin-navigation">{open ? "Close" : "Menu"}</button></div><div id="admin-navigation" className={"admin-nav-body " + (open ? "open" : "")}><p className="admin-nav-label">WORKSPACE</p><nav aria-label="Admin">{navigation.map(n => {
    const active = n.href === "/admin" ? path === n.href : path.startsWith(n.href);
    return <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}><NavIcon name={n.icon} />{n.label}</Link>;
  })}</nav><Link href="/" target="_blank" className="admin-view-site">View portfolio <span>↗</span></Link><div className="admin-profile"><span className="admin-avatar">R</span><div><strong>Studio admin</strong><p>{email}</p></div></div><div className="admin-logout">{logout}</div></div></aside><div className="admin-workspace"><div className="admin-topbar"><span>Workspace <span>/</span> <strong>{current?.label || "Preview"}</strong></span><Link href="/admin/projects/new">+ New project</Link></div><main className="admin-main" id="main">{children}</main></div></div>;
}
