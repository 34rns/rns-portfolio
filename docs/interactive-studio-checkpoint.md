# Interactive RNS studio — checkpoint

Workspace: D:/CustomCodex/rns-portfolio. Branch: landing-redesign.
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

The generated migration drizzle/0005_sad_orphan.sql adds only site_settings. **It was not applied.** Production DB content was only read during development/builds; no project, model, commerce or settings rows were mutated. Local draft/publish browser tests ended with both draft and published defaults restored at revision 3.
Deployment and applying the prepared migration remain separately scoped to the user's explicit go-live request. No push, deployment, paid services or new runtime packages.

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
Next: user review of this complete local direction; production activation requires the migration and an explicit go-live instruction.

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
