# Interactive RNS studio — checkpoint

Workspace: D:/CustomCodex/rns-portfolio. Branch: landing-redesign.
License/admin continuation: [14 November planning checkpoint](license-admin-checkpoint.md) covers the proposed KeyGate feature additions, free hosting, navigation and helper documentation. No new licensing features are deployed by that plan.
This supersedes the editorial landing from commit 2012867. The user authorized a fresh interactive homepage and SaaS-style admin, and chose a surprise-me direction.

## Result and decisions

- Original RNS sculpture on a charcoal stage, stronger beveled metal edges, yellow pixel details, pointer tilt, rotate/disassemble/play/pause controls and an architectural base.
- Real six-project explorer with selection, keyboard access, large genuine images, direct case-study links and title-led fallbacks for missing, failed or undersized imagery.
- Native yellow pixel pointer plus the existing DOM View companion. Touch, reduced-motion and forced-color fallbacks are retained.
- Admin has a route-aware sidebar, mobile navigation, redesigned overview with actual counts, project search/status filters, consistent fields, loading/retry states, and studio sign-in.
- Site editor controls display name, role, both hero lines, introduction, About/contact copy and links, accent/surface/poster, original sculpture material/motion/intensity, custom model library selection, featured project, explorer layout and section visibility.
- Style preview shows current colors/poster/copy only; the protected full preview uses the saved draft and real landing. Draft and publish are distinct, with persistent revisions, pending/dirty status and honest feedback.
- Display-name edits change text and metadata. Original 3D geometry remains RNS; a user-supplied model can replace it through the existing GLB library.
- Research used primary Bruno Simon and Lusion sites for interactive discovery and visible project paths, without copying their art. Existing design skills installed in the preceding turn remain available (manifest: C:/Users/SIAM/.codex/toolkit/design-skills-2026-11-13.json). Execution used the already-read frontend-design/UI-UX Pro Max local guidance and the verification skill.
- Other themes, project case-study pages, their content, authentication actions and commerce workflows are preserved. The pre-existing AGENTS.md edit and four alternate logo PNGs are excluded from the task commit.

## Storage and deployment

Development defaults to private .local/site-settings.json, ignored by Git. Local writes use an atomic rename, a process queue and revision checks. A draft save never alters the published settings.
Production defaults to the Postgres adapter; it uses a singleton and conditional revision checks for cross-process conflicts. Missing/broken storage keeps the default public site usable and disables editor writes with an explicit error.

The generated migration drizzle/0005_sad_orphan.sql adds only site_settings. It remained unapplied during local implementation and was applied in the authorized go-live follow-up below. Production DB content was read-only during development/builds. Local draft/publish browser tests ended with both draft and published defaults restored at revision 3.
The user explicitly authorized production with “Go live.” No Git push or new runtime packages were needed; deployment used the existing Vercel account and project.

## Verification

- Final-source lint, typecheck and all 273 tests in 33 files passed.
- Production build passed with SITE_SETTINGS_DRIVER=local. Home remained statically rendered with one-hour ISR; runtime HTTP returned 200, cache HIT, prerender 1 and exactly one h1.
- Browser checks covered desktop/tablet/phone widths 320, 390, 768, 1024 and 1440. No horizontal overflow or clipped headings was observed; final 320px header links and sculpture controls meet 44px minimum targets.
- Production pause held time at 11.628 across manual rotation; rotation changed to 1.291 while time stayed fixed. Disassembly/assembly and resume worked. Offscreen/tab visibility and device/save-data/reduced-motion policies are implemented; shared power policy and both extrusion variants are covered by tests.
- Browser checked keyboard skip-to-main (focus reached MAIN#main), keyboard project selection, Shobdo navigation/back, null-cover title presentation, mobile admin menu, project status/search/no-match states and private full preview.
- Local browser save/publish exercise changed name, accent, paper surface, ceramic material, ambient motion, selected project, explorer layout and About visibility. Draft was private, publish changed the public view, and defaults were restored afterward.
- Console review found no errors; the installed Fiber/Three stack still logs the pre-existing Three.Clock deprecation warning.
- Real touch hardware, screen-reader speech, forced-colors and an OS-level reduced-motion preference were not runtime-tested. No model existed in the library, so the existing GLB viewer integration is wired but a new upload was not tested against the production database.

## Evidence

All screenshots and runtime logs are local/ignored under screenshots/interactive-studio-2026-11-13/:
- desktop-hero.png: full studio first viewport.
- sculpture-disassembled.png: separated original mark.
- project-explorer.png: selected Shobdo imagery.
- mobile-hero.png: 390px production hero.
- admin-overview.png: redesigned real-data dashboard.
- admin-site-editor.png: appearance editor and style preview.
- admin-mobile.png: mobile settings editor.
- production.stdout.log / production.stderr.log / production.pid: review server details.
- task-diff-stat.txt: task-only diff statistics against the preceding editorial commit.

The dev server is restored at http://127.0.0.1:3000/. Customization: http://127.0.0.1:3000/admin/site.
Live: https://rns-portfolio-teal.vercel.app/. Customization: https://rns-portfolio-teal.vercel.app/admin/site.
Next: user review of the live portfolio; content and appearance updates are available through the live admin.

## Follow-up — old admin feature parity

The user requested a comparison against the old admin, especially the theme
picker. All 26 old admin/API files remain present, with 20 unchanged legacy
implementations. All six project themes, uploads, model controls, publishing,
monetization and commerce workflows remain available. A Theme link and editor
section shortcuts make the controls easier to reach; project update dates
were restored. Continue from [the full parity audit](admin-parity-audit.md),
which records the inventory, verification scope and this follow-up's file reasons.
Final production review covered 1440px, 390px and 320px editor/library
layouts, theme deep links, keyboard section focus and the public homepage.
Evidence is in screenshots/admin-parity-2026-11-13/. The dev server is
restored at http://127.0.0.1:3000/ with local site settings. The go-live
follow-up below records production activation; legacy content remains intact.

## Go live — 13 November 2026

- User authorized production deployment with “Go live.” Deployed clean committed source from dd669c8, including the interactive studio and admin parity update.
- Vercel deployment dpl_5obnAimnhNr5ruh8VwddBRZdbKfy is Ready and aliased to https://rns-portfolio-teal.vercel.app/. Immutable URL: https://rns-portfolio-pwxjqjhxf-fakerns-projects.vercel.app/.
- The first attempt inherited an unauthorized Git-author identity from the parent checkout and was blocked. The successful release used a standalone Git export and the project owner's authenticated Vercel account; project security settings were not changed.
- Applied only the pending 0005_sad_orphan migration. Existing migrations matched after accounting for Windows line endings. All ten existing app tables were backed up privately to backups/release-dd669c8-20261113.json; before/after row fingerprints matched.
- Live admin displayed Connected database. Saving the unchanged initial defaults created the site_settings singleton at revision 1; reload retained it. Draft and public values match, with no project, buyer, license or model records changed.
- Production build, fresh lint/typecheck and all 273 tests in 33 files passed. Lint excluded temporary .vercel release artifacts. Browser checked desktop 1440px and phone 390px with no horizontal overflow, sculpture pause/rotate/disassemble/assemble/play, project selection and the Shobdo case-study route. All six themes and the styled editor shortcuts are present in the live admin.
- Previous Ready deployment for rollback: https://rns-portfolio-i77k14o5l-fakerns-projects.vercel.app/ (dpl_28NWbBvzMXg1XHj819Z7aMfF4VXP).
- Evidence: screenshots/go-live-2026-11-13/release.json, production-build.log, live-home-desktop.png, live-home-mobile.png and admin-site-editor.png. The temporary production environment download was removed.
- Local dev remains at http://127.0.0.1:3000/. The pre-existing AGENTS.md edit and four untracked alternate logos remain untouched.

## File-by-file reasons

| File | Why it changed |
| --- | --- |
| .gitignore | Ignore private local settings storage. |
| drizzle/0005_sad_orphan.sql | Prepared migration adds only the site_settings table; not applied. |
| drizzle/meta/0005_snapshot.json | Generated Drizzle schema snapshot for the new table. |
| drizzle/meta/_journal.json | Register the prepared migration in Drizzle's journal. |
| src/lib/db/schema.ts | Typed singleton table for draft/live settings and revision checks. |
| src/lib/site-settings/config.ts | Bounded settings schema, truthful defaults, accent contrast and readable accent text. |
| src/lib/site-settings/store.ts | Private atomic local storage, draft/publish semantics, revision checks and driver selection. |
| src/lib/site-settings/database.ts | Postgres adapter with conditional revision updates and honest unavailable-storage errors. |
| src/app/(site)/page.tsx | Read published settings for the landing and homepage metadata while retaining ISR. |
| src/themes/types.ts | Optional landing settings prop without altering project theme interfaces. |
| src/themes/professional/landing.tsx | Switch the active landing to the new interactive studio; retain legacy content typing. |
| src/themes/professional/components/interactive-studio.tsx | Settings-driven public layout, progressive sculpture, interactive real-project explorer and image fallbacks. |
| src/themes/professional/components/sculpture-scene.tsx | Local-lit Three.js sculpture with deeper bevels, rotation, disassembly, ambient motion and explicit paused redraws. |
| src/themes/professional/components/studio-styles.ts | Charcoal/yellow studio composition, responsive layouts, accessible targets, paper appearance and themed cursor. |
| src/themes/professional/components/studio-cursor.tsx | Reuse the pixel companion on the new studio; show View on project imagery and hide over the sculpture. |
| src/themes/professional/components/brand-logo/logo-geometry.ts | Optional extrusion settings for the new deeper sculpture; default geometry behavior remains unchanged. |
| src/themes/professional/components/brand-logo/logo-geometry.test.ts | Verify hole preservation and finite normals for both original and deeper extrusion. |
| src/components/smart-image.tsx | Optional load/error callbacks for failed or undersized public imagery; existing callers remain compatible. |
| src/app/admin/layout.tsx | Apply the scoped admin visual system. |
| src/app/admin/admin-styles.ts | Consistent SaaS workspace, responsive navigation, readable fields, cards, editor and loading/error presentation. |
| src/app/admin/admin-shell.tsx | Route-aware sidebar, mobile menu, workspace bar and account/logout slot. |
| src/app/admin/(panel)/layout.tsx | Keep the existing admin guard and logout action while using the new shell. |
| src/app/admin/(panel)/page.tsx | Redesigned overview using real project/account/commerce counts and a customization entry point. |
| src/app/admin/(panel)/loading.tsx | Accessible workspace loading state. |
| src/app/admin/(panel)/error.tsx | Useful connection failure state with a working retry button. |
| src/app/admin/(panel)/projects/page.tsx | Load safe project data for the new library UI. |
| src/app/admin/(panel)/projects/project-library.tsx | Search, status filters, thumbnails, empty states and existing guarded edit/publish/reorder/delete workflows. |
| src/app/admin/login/page.tsx | New studio sign-in composition around the unchanged authentication form. |
| src/app/admin/(panel)/site/page.tsx | Load draft state and published-project/model options for the protected editor. |
| src/app/admin/(panel)/site/actions.ts | Guarded schema validation, save/publish, cache revalidation and retry-safe error feedback. |
| src/app/admin/(panel)/site/site-editor.tsx | Controlled content/appearance/3D/section controls, dirty/pending feedback, draft preview and explicit publishing. |
| src/app/admin/site-preview/page.tsx | Protected full saved-draft preview rendered by the actual landing component. |
| tests/site-settings.test.ts | Validate settings safety, contrast, disk persistence, corrupt-file handling and concurrent/stale saves. |
| tests/site-settings-actions.test.ts | Verify auth redirects, invalid input, draft/public separation, publishing, conflicts and revision retention after validation errors. |
| docs/interactive-studio-checkpoint.md | Current project checkpoint, verification, limitations and this file-by-file change inventory. |
| src/themes/professional/components/brand-logo/README.md | Mark the prior editorial checkpoint as superseded and point continuity to the new checkpoint. |
