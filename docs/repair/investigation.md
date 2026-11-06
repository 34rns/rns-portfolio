# Portfolio repair investigation — 6 November 2026

Scope: D:/FreeCodeChats/portfolio. Local repair only; no push, deployment, or database writes authorized until “go live”.

## Verified root causes

1. **Shobdo theme and screenshots omitted from deployment.** The last verified working deployment is dpl_GA2FVQQb6Z3QAFNHXYVJEVyyC84c, https://rns-portfolio-7tyc676y9-fakerns-projects.vercel.app (5 November, before FolderDock). It renders data-theme=keycap. The subsequent FolderDock deployment dpl_DojBBNPtjv6mKs8XgegiSMFMPQLZ and wording deployment dpl_6ZBobtGVxLtumn8UExA1bVF4xcFd were made from C:/Users/siamr/.codex/worktrees/folderdock-portfolio/portfolio at a6b427f. That checkout omitted the already-published Shobdo work because it was uncommitted in the original checkout. The previous Codex chat explicitly described it as an unrelated draft, then copied only FolderDock changes. The database still selected theme=keycap, but getTheme silently fell back to Professional when that theme was absent. The 22 static assets were not uploaded with that checkout, causing 404s. The same omission broke the Shobdo homepage cover.
2. **Wordmark removal is separate.** Commit f4d3d09 (19 October) already implemented hidden md:block on the landing header mark and ml-auto on the nav. The current original checkout has an uncommitted edit removing Link/RNS and ml-auto, and replacing justify-between with justify-end. Git cannot identify the author of uncommitted edits. The user reports removing this mark. The FolderDock deployment checkout did not carry that deletion. The landing header is private to landing.tsx, so deleting it cannot remove another theme, image, database row, or other page header.
3. **Approved FolderDock copy diverged between checkouts.** The user requested “Free release” wording in the previous chat. It was edited and deployed from the separate checkout, but the original D: checkout retained the earlier developer-preview labels. Copying only those verified wording changes back preserves the later approved work.

## Baseline and authorship

There is **no single last-good Git commit containing Shobdo**. main, origin/main, backup-before-repair, and the detached deployment checkout all point to a6b427f (27 October). There are **zero later commits**, including in the deployment checkout. Both good Shobdo and new FolderDock work lived outside commits. Do not reset or restore the entire checkout to a6b427f: that would discard the good Shobdo work.

The 23 available commits, authors, dates, and every touched file are recorded in commit-history.txt. a6b427f is a comparison base, not a complete known-good website snapshot. All commits except the initial commit are authored/committed as 34rns; the initial commit is shadowthon. Git identities alone do not prove AI authorship. FolderDock authorship is established by the earlier Codex chat, including its worktree creation at a6b427f and selective copy operations.

The original status and full tracked-file diffs are recorded in initial-status.txt and initial-changes.patch. Uncommitted changes:

| Files | Provenance / purpose |
| --- | --- |
| README.md | Existing Shobdo completion note; preserve |
| src/app/layout.tsx | Existing Tiro Bangla font for Keycap; preserve |
| docs/design/keycap.md; src/themes/keycap/{preview.tsx,project-page.tsx,specimen.ts,styles.ts,theme.tsx,tokens.ts}; tests/keycap.test.ts | Existing Shobdo theme and tests; omitted by FolderDock deployment |
| public/projects/shobdo/*.png; public/projects/shobdo/themes/*.png | All 22 existing real images; omitted by FolderDock deployment |
| src/themes/professional/landing.tsx | Separate wordmark deletion; author not stored in Git |
| scripts/add-projects.ts | Codex added --slug filtering; insertion-only, no update/delete |
| src/components/smart-image.tsx | Codex changed image priority to eager/high loading |
| src/themes/professional/components/work-index.tsx | Codex prioritized first mobile cover and supplied responsive sizes |
| src/lib/projects/links.ts | Codex added version-pinned GitHub asset recognition |
| src/lib/projects/content.ts | Existing Shobdo content plus Codex FolderDock entry and slug selection |
| src/themes/registry.ts; tests/theme-registry.test.ts; tests/content-entries.test.ts | Combined Shobdo and FolderDock registrations/content tests |
| src/themes/folderdock/{preview.tsx,project-page.tsx,styles.ts,theme.tsx,tokens.ts}; public/projects/folderdock/{library.webp,audio.webp} | Codex-added FolderDock theme and screenshots |

The project route and seed script have no changes against a6b427f. Header/landing diff against f4d3d09 confirms only the wordmark deletion. All existing theme changes are the two added theme folders and registrations.

## Database and assets

A fresh production environment comparison confirmed that .env.local DATABASE_URL and Vercel production DATABASE_URL are identical. There is no separate local database. Inspections were SELECT-only; no seed, migration, content insertion, account creation, or admin save was run.

Shobdo: slug shobdo-keyboard; status published; placement featured; theme keycap; title Shobdo Keyboard; tagline “Bangla, Banglish and English on Android — offline, private and designed key by key.” Cover /projects/shobdo/cover.png; eight gallery references; repository https://github.com/34rns/shobdo-keyboard; release https://github.com/34rns/shobdo-keyboard/releases/latest/download/Shobdo-Keyboard-v0.3.0.apk. Description is 4,811 characters and exactly matches the existing content entry. download_url and model_url are null by design. The row was created 4 November and has not been updated since.

Every Shobdo image in public/projects/shobdo is byte-for-byte identical (SHA-256) to the last working deployment. All 22 return 200 there and 404 on current production. None needs recapturing. The cover and eight gallery fields reference site-relative public assets, not Windows paths. The other 13 images are theme screenshots referenced in specimen.ts. No Shobdo field points to Vercel Blob. All 10 Blob images referenced by Loupe and QuickKit return 200. Listing the entire Blob store is unnecessary to recover these verified files; its production token is secret and is not available via environment pull.

All nine published project routes currently return HTTP 200, including broken Shobdo: status-only checks were insufficient. Shobdo reports data-theme=professional on current production. Other published themes are Professional, Anime 3D, Synthwave, Cyberpunk, and FolderDock.

## Deleted-file history and missing documentation

The full deletion log contains only src/components/reveal.tsx in 1eadf1d, explicitly removed as unused. No project assets or Shobdo files were deleted in Git. Restoring that unused component would not repair these failures. docs/deployed.md is absent in both checkout and all Git history; the available deployment notes are docs/deploy-later.md and the separate FolderDock checkpoint. No missing document was invented.

## Repair decisions

Preserve Shobdo's verified text, theme, image bytes, links and unrelated licensing/payment work. Retain FolderDock and its latest free-release wording (confirmed by the user during this repair). Save a source backup under ignored backups/repair-2026-11-06. No database repair is needed. Final user decision: retain the big RNS at all widths, remove the small landing-navbar mark, and preserve project theme designs. See checkpoint.md for the execution-review blocker affecting the final hero restoration. Verify all published pages in a production build, not just the new page.
