# Portfolio repair checkpoint — 6 November 2026

Project: D:/FreeCodeChats/portfolio. Do not push or deploy until the user says go live.

## Completed and verified

- Read the handoff, all theme design notes, full 23-commit history, diffs and deleted-file history. docs/deployed.md does not exist in Git; docs/deploy-later.md is available.
- Root cause: FolderDock was deployed from a6b427f plus selected uncommitted files, omitting the already-published uncommitted Keycap theme and 22 Shobdo images. The shared database retained Shobdo, so its theme fell back to Professional and images returned 404. No Shobdo content or assets were deleted from the original checkout.
- All 22 Shobdo files match the last working deployment byte for byte. Published row, title, tagline, description, cover, gallery and release/source links are intact. Local and production point at the same database; no database writes were made.
- Commit e689f31 preserves Shobdo and approved FolderDock free-release content/assets. Commit cc4c7b4 fixes the Professional skip target and wrapping of a long QuickKit inline installation path at 360px.
- Nine published projects and landing were checked at 360, 390, 768, 1024, 1440px (50 checks): all project themes correct, no broken images, runtime/console errors, clipped headings, missing anchors, or horizontal overflow after the two small fixes.
- Normal-motion checks: all ten pages, theme intro dismissal, real return-to-work navigation, and landing-to-Shobdo navigation passed; keyboard skip on QuickKit focuses main.
- Lint, typecheck, all 252 tests (30 files, --maxWorkers=2), and a real production build passed. Initial fully parallel test run had one five-second dynamic-import timeout; two-worker runs passed. The expected model-cleanup error is logged by a test that deliberately simulates a missing model file.
- Screenshots and logs are under screenshots/repair (already gitignored). index.html is a review gallery. url-statuses.md lists all 172 checks including repeated environments and restored-image byte comparisons.
- Two original external source links are still HTTP 404: github.com/34rns/moneykickshop and github.com/34rns/OfficeChaos. They may be private or renamed; no replacements were invented.

## Latest user decision and outstanding blocker

The user ultimately clarified: keep the **big RNS at every width**, remove the **small landing navbar RNS**, retain each project theme design, and tidy the landing lightly. This supersedes the intermediate desktop role-title choice and the original hidden-md wordmark prescription. FolderDock stays, using free-release wording.

The landing navbar has now been changed to navigation-only, kept right-aligned with ml-auto, with 44px link targets. Other project headers are untouched.

**The working-copy hero still contains my temporary intermediate desktop role-title substitution.** Restoring the original hero was blocked by automatic execution review. An initial combined command failed because approval review disconnected with content_filter. Subsequent single-file restore requests were rejected as repeats of that blocked operation, despite the reviewer expressly acknowledging low risk and authorization. The user then explicitly approved restoring the original hero; review still rejected it because the content-filter restriction remained. Do not bypass that execution restriction through another tool or an indirect operation.

The committed hero and the ignored original-file backup still contain the correct original large RNS. The temporary hero edit is deliberately uncommitted. The latest request cannot be declared complete while this edit remains. The existing local server and screenshots show the previously verified intermediate landing, not the final requested desktop identity.

## Resume only when the execution restriction is cleared

- Restore the original big-RNS hero while preserving the navbar-only landing change. Do not change project themes.
- Run lint, typecheck, all tests, and rebuild. Stop/restart only this task's server (PID stored in screenshots/repair/server.pid; verify its command line first).
- Run the read-only audit and browser checks; the browser script now expects one big RNS and no landing navbar mark at every width. Refresh the gallery and screenshots for the final landing.
- Commit remaining approved fixes locally, report any remaining limitations, then wait for go live. No push/deployment has occurred.

## Reusable checks

- npm exec tsx scripts/audit-projects.ts http://localhost:3100 local
- node scripts/verify-portfolio.mjs http://localhost:3100 final (requires PLAYWRIGHT_MODULE and BROWSER_EXECUTABLE pointing to installed Playwright/runtime paths on this Windows machine)
- npm run lint; npm run typecheck; npm test -- --maxWorkers=2; npm run build

Original edited files were copied to ignored backups/repair-2026-11-06/files, with .bak suffixes so source scanners do not load them. The existing backup-before-repair branch remains untouched at a6b427f.
