import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { themes } from "../src/themes/registry";
import { languagePlates, themeShots, galleryShots } from "../src/themes/keycap/specimen";

loadEnvConfig(process.cwd());
const base = process.argv[2] || "http://localhost:3100";
const label = process.argv[3] || "local";
if (!/^https?:\/\//.test(base) || !/^[a-z0-9-]+$/.test(label)) {
  throw new Error("Usage: tsx scripts/audit-projects.ts <base-url> <report-label>");
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const sql = neon(process.env.DATABASE_URL);
  // Public project content only. Never dump buyer, license, or delivery data.
  const projects = await sql.query(`SELECT slug,title,tagline,status,placement,theme,
    cover_image_url,gallery,live_url,repo_url,download_url,model_url,description
    FROM projects WHERE status='published' ORDER BY sort_order,slug`);
  const urls = new Map<string, { kind: string; theme?: string }>();
  urls.set(new URL("/", base).href, { kind: "page", theme: "professional" });
  const fields: { project: string; field: string; value: string; localFile?: boolean }[] = [];
  const problems: string[] = [];
  for (const p of projects) {
    if (!(p.theme in themes)) problems.push(`${p.slug}: unregistered theme ${p.theme}`);
    urls.set(new URL(`/projects/${p.slug}`, base).href, { kind: "page", theme: p.theme });
    const values: [string, string | null][] = [
      ["cover_image_url", p.cover_image_url], ["live_url", p.live_url],
      ["repo_url", p.repo_url], ["download_url", p.download_url], ["model_url", p.model_url],
      ...p.gallery.map((value: string, i: number): [string, string] => [`gallery[${i}]`, value]),
    ];
    for (const [field, value] of values) {
      if (!value) continue;
      const localFile = value.startsWith("/") ? existsSync(resolve("public", value.slice(1))) : undefined;
      fields.push({ project: p.slug, field, value, localFile });
      if (/^(?:[a-z]:[\\/]|file:|\\\\)/i.test(value)) {
        problems.push(`${p.slug}.${field}: filesystem path`);
        continue;
      }
      if (localFile === false) problems.push(`${p.slug}.${field}: missing public file ${value}`);
      urls.set(new URL(value, base).href, { kind: /url$/.test(field) && !/image|model/.test(field) ? "link" : "asset" });
    }
  }
  const shobdo = [...new Set(["/projects/shobdo/cover.png", ...languagePlates.map(s=>s.src), ...themeShots.map(s=>s.src), ...galleryShots.map(s=>s.src)])];
  const assetHashes = shobdo.map(src => {
    const file = resolve("public", src.slice(1));
    urls.set(new URL(src, base).href, { kind: "asset" });
    if (!existsSync(file)) { problems.push(`Missing Shobdo image: ${src}`); return { src, sha256: null }; }
    return { src, sha256: createHash("sha256").update(readFileSync(file)).digest("hex") };
  });
  const requests = [...urls];
  const checks: { url: string; kind: string; status: number | string; finalUrl?: string; theme?: string | null; error?: string }[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (cursor < requests.length) {
      const [url, expected] = requests[cursor++];
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        let theme: string | null | undefined;
        if (expected.kind === "page") {
          const html = await response.text();
          theme = /data-theme="([^"]+)"/.exec(html)?.[1] ?? null;
          if (theme !== expected.theme) problems.push(`${url}: expected theme ${expected.theme}, rendered ${theme}`);
        } else await response.body?.cancel();
        checks.push({ url, kind: expected.kind, status: response.status, finalUrl: response.url, theme });
      } catch (error) {
        checks.push({ url, kind: expected.kind, status: "ERROR", error: String(error) });
      }
    }
  }));
  checks.sort((a,b)=>a.url.localeCompare(b.url));
  const directory = resolve("screenshots/repair");
  mkdirSync(directory, { recursive: true });
  const report = { checkedAt: new Date().toISOString(), base, projects, fields, assetHashes, problems, checks };
  writeFileSync(resolve(directory, `audit-${label}.json`), JSON.stringify(report, null, 2));
  writeFileSync(resolve(directory, `urls-${label}.md`), `# URLs checked: ${base}\n\n| URL | HTTP status | Kind |\n| --- | --- | --- |\n` + checks.map(c=>`| ${c.url} | ${c.status} | ${c.kind} |`).join("\n") + "\n");
  console.log(JSON.stringify({ projects: projects.length, urls: checks.length, problems, failed: checks.filter(c=>c.status!==200) }, null, 2));
  if (problems.length || checks.some(c=>c.kind!=="link" && c.status!==200)) process.exitCode=1;
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
