import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

/**
 * Insert the two new projects, but only where their slug does not exist yet.
 *
 * This script is deliberately one-directional: it SELECTs, then INSERTs, and
 * never UPDATEs or DELETEs. Re-running it is always safe, and it can never
 * clobber a project you have since edited in the admin.
 *
 *   npx tsx scripts/add-projects.ts                       # local, images from /projects
 *   npx tsx scripts/add-projects.ts --dry-run             # report only, write nothing
 *   npx tsx scripts/add-projects.ts --target production --images-file urls.json
 *
 * `--target production` reads PROD_DATABASE_URL instead of .env.local, so a
 * production write has to be asked for explicitly.
 */

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const target = arg("target") ?? "local";

  if (target !== "local" && target !== "production") {
    throw new Error(`Unknown --target "${target}". Use "local" or "production".`);
  }

  if (target === "production") {
    const url = process.env.PROD_DATABASE_URL;
    if (!url) {
      throw new Error(
        "PROD_DATABASE_URL is not set. Pull the production environment " +
          "(`vercel env pull <file> --environment production`), export its " +
          "DATABASE_URL as PROD_DATABASE_URL, then delete the file.",
      );
    }
    process.env.DATABASE_URL = url;
  }

  const imagesFile = arg("images-file");
  const overrides: Record<string, { cover: string; gallery: string[] }> = imagesFile
    ? (JSON.parse(await readFile(imagesFile, "utf8")) as Record<
        string,
        { cover: string; gallery: string[] }
      >)
    : {};

  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { projects } = await import("@/lib/db/schema");
  const { projectEntries, planContentInsertions } = await import(
    "@/lib/projects/content"
  );

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const db = drizzle(neon(url));

  console.log(
    `\nTarget   : ${target} (Neon host: ${new URL(url).host})${dryRun ? "  [dry run]" : ""}\n`,
  );

  const existing = await db
    .select({ id: projects.id, slug: projects.slug, title: projects.title })
    .from(projects);

  const { toInsert, skipped } = planContentInsertions(existing, projectEntries);

  for (const row of skipped) {
    console.log(`  skip      ${row.slug} — already exists (never updated)`);
  }

  for (const entry of toInsert) {
    const images = overrides[entry.slug] ?? entry.defaultImages;

    if (dryRun) {
      console.log(`  would add ${entry.slug} — "${entry.title}"`);
      console.log(`              theme=${entry.theme}  liveUrl=${entry.liveUrl}`);
      console.log(`              cover=${images.cover}`);
      continue;
    }

    await db.insert(projects).values({
      slug: entry.slug,
      title: entry.title,
      tagline: entry.tagline,
      description: entry.description,
      coverImageUrl: images.cover,
      gallery: images.gallery,
      tags: entry.tags,
      liveUrl: entry.liveUrl,
      repoUrl: entry.repoUrl,
      year: entry.year,
      status: "published",
      placement: "featured",
      sortOrder: entry.sortOrder,
      theme: entry.theme,
      themeOptions: entry.themeOptions,
      isPaid: false,
    });

    console.log(`  inserted  ${entry.slug} — "${entry.title}"`);
  }

  console.log(
    `\nDone. ${toInsert.length} ${dryRun ? "would be " : ""}added, ${skipped.length} skipped.\n`,
  );
}

function arg(name: string): string | null {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
