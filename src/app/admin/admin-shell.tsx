"use client";
import { useState,useEffect,useRef,useSyncExternalStore,type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationFor } from "@/lib/licensing/navigation";
import type { SearchResult } from "@/lib/licensing/search";
import type { Principal } from "@/lib/licensing/contracts";
type Theme="light"|"dark"|"system";
let memoryTheme:Theme|null=null;
const subscribeTheme=(notify:()=>void)=>{window.addEventListener("storage",notify);window.addEventListener("rns-theme",notify);return ()=>{window.removeEventListener("storage",notify);window.removeEventListener("rns-theme",notify);};};
const readTheme=(fallback:Theme):Theme=>{try{const saved=localStorage.getItem("rns-admin-theme");if(saved==="light"||saved==="dark"||saved==="system")return saved;}catch{}return memoryTheme??fallback;};
const saveTheme=(value:Theme)=>{memoryTheme=value;try{localStorage.setItem("rns-admin-theme",value);}catch{}window.dispatchEvent(new Event("rns-theme"));};
const subscribeSystem=(notify:()=>void)=>{const media=matchMedia("(prefers-color-scheme: dark)");media.addEventListener("change",notify);return ()=>media.removeEventListener("change",notify);};
function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="13" y="3" width="6" height="6" rx="1" /><rect x="3" y="13" width="6" height="6" rx="1" /><rect x="13" y="13" width="6" height="6" rx="1" /></>,
    site: <><rect x="2" y="3" width="18" height="16" rx="2" /><path d="M2 8h18M8 8v11" /></>,
    folder: <path d="M2 7V4h7l3 3h8v12H2Z" />,
    cube: <><path d="m11 2 9 5v10l-9 5-9-5V7Zm-9 5 9 5 9-5M11 12v10" /></>,
    bag: <><rect x="3" y="7" width="16" height="14" rx="2" /><path d="M7 7V5a4 4 0 0 1 8 0v2" /></>,
    key: <><circle cx="8" cy="8" r="5" /><path d="m12 12 8 8m-3-3 3-3" /></>,
    card: <><rect x="2" y="4" width="18" height="14" rx="2" /><path d="M2 9h18M5 14h4" /></>,
    person:<><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></>,
    activity:<path d="M2 12h5l3-8 4 16 3-8h5"/>,
    settings:<><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></>,
    help:<><circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v1"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
export function AdminShell({ children, email,logout,principal,initialTheme }: { children: ReactNode; email: string | null | undefined; logout: ReactNode;principal:Principal;initialTheme:"light"|"dark"|"system" }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const groups=navigationFor(principal),navigation=groups.flatMap(g=>g.items);
  const theme=useSyncExternalStore(subscribeTheme,()=>readTheme(initialTheme),()=>initialTheme),systemDark=useSyncExternalStore(subscribeSystem,()=>matchMedia("(prefers-color-scheme: dark)").matches,()=>false),[query,setQuery]=useState("");
  const dialog=useRef<HTMLDialogElement>(null),[records,setRecords]=useState<SearchResult[]>([]),[searchError,setSearchError]=useState("");
  useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>{if(query.trim().length<2){setRecords([]);setSearchError("");return;}void fetch(`/v1/admin/search?q=${encodeURIComponent(query)}`,{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error();setRecords(await response.json());setSearchError("");}).catch(()=>{if(!controller.signal.aborted){setRecords([]);setSearchError("Search unavailable. Use each page's filters or try again.");}});},200);return()=>{clearTimeout(timer);controller.abort();};},[query]);
  useEffect(()=>{const keyboard=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();dialog.current?.showModal();}};window.addEventListener("keydown",keyboard);return ()=>window.removeEventListener("keydown",keyboard);},[]);
  const current = navigation.find(n => n.href === "/admin" ? path === n.href : path.startsWith(n.href));
  return <div className="admin-shell" data-admin-theme={theme==="system"?(systemDark?"dark":"light"):theme}><aside className="admin-sidebar"><div className="admin-brand-row"><Link href="/admin" className="admin-brand"><span />RNS<small>CONTROL</small></Link><button className="admin-menu-toggle" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="admin-navigation">{open ? "Close" : "Menu"}</button></div><div id="admin-navigation" className={"admin-nav-body " + (open ? "open" : "")}><div className="kg-nav-groups">{groups.map(group=><div key={group.label}><p className="admin-nav-label">{group.label}</p><nav aria-label={group.label}>{group.items.map(n => {
    const active = n.href === "/admin" ? path === n.href : path.startsWith(n.href);
    return <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}><NavIcon name={n.icon} />{n.label}</Link>;
  })}</nav></div>)}</div><Link href="/" target="_blank" className="admin-view-site">View portfolio <span>↗</span></Link><div className="admin-profile"><span className="admin-avatar">{principal.role?.slice(0,1).toUpperCase()}</span><div><strong>{principal.role} workspace</strong><p>{email}</p></div></div><div className="admin-logout">{logout}</div></div></aside><div className="admin-workspace"><div className="admin-topbar"><span>Workspace <span>/</span> <strong>{current?.label || "Product"}</strong></span><div className="kg-top-actions"><button className="kg-search-trigger" onClick={()=>dialog.current?.showModal()}>Search <kbd>Ctrl K</kbd></button><label className="kg-theme"><span className="sr-only">Admin appearance</span><select aria-label="Admin appearance" value={theme} onChange={e=>{const value=e.target.value as typeof theme;saveTheme(value);}}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><Link href="/admin/help">Help</Link></div></div><main className="admin-main" id="main">{children}</main></div><dialog ref={dialog} className="kg-palette" aria-labelledby="palette-title"><div className="kg-palette-head"><h2 id="palette-title">Find your workspace</h2><button onClick={()=>dialog.current?.close()} aria-label="Close search">×</button></div><label><span className="sr-only">Search workspace</span><input autoFocus className="admin-field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Apps, codes, themes, help…"/></label><nav>{navigation.filter(n=>n.label.toLowerCase().includes(query.toLowerCase())).map(n=><Link key={n.href} href={n.href} onClick={()=>dialog.current?.close()}><NavIcon name={n.icon}/>{n.label}<span>↗</span></Link>)}{records.map(record=><Link key={record.href} href={record.href} onClick={()=>dialog.current?.close()}><NavIcon name={record.kind==="Product"?"cube":"key"}/>{record.label}<span>{record.kind}</span></Link>)}</nav><p role="status">{searchError||"Products, masked codes and customer access. Esc to close."}</p></dialog></div>;
}
