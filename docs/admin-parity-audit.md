# Admin feature parity audit — 13 November 2026

Project: D:/CustomCodex/rns-portfolio. Baseline: 2012867 (the old admin before the interactive studio rebuild).

## Finding

No old admin route, input or save handler was removed. All 26 legacy admin/API files remain present. Twenty are byte-identical to the baseline, including authentication, project save/publish/reorder/delete, upload APIs, preview routes, model management and all commerce actions/pages. The project editor retains all 25 literal named inputs plus the three dynamic model-offset inputs.

The theme picker was already in the project editor, with Professional, Anime 3D, Synthwave, Cyberpunk, Keycap and FolderDock choices. The update makes it easier to find with a Theme link in each library row and section shortcuts in the project editor. It also restores the old dashboard's update-date information and adds it to the library.

## Workflow inventory

| Old capability | Current entry point / verification |
| --- | --- |
| Sign in / sign out | Original login form and guarded logout action retained |
| Overview project/published/draft/paid counts | /admin, using the original database queries |
| Account and revenue/order counts | /admin, using the original commerce stats |
| Create / edit / cancel a project | /admin/projects/new and each project's Edit link; original form/action retained |
| Markdown case-study editor and preview | Basics section; browser toggled real markdown preview and returned to editing |
| Title, slug generation, tagline, year and tags | Original fields and handlers retained |
| Theme picker and accent override | Theme link → #project-theme; all six themes and accent edits tested in the browser without saving |
| Live/repository/free-download links | Media & links section, original fields retained |
| Cover image and gallery URL/upload/drop | Media & links section; original upload field and APIs unchanged |
| 3D upload/library/removal, lighting, scale, offsets | 3D model section and /admin/models; original fields, uploader and APIs retained |
| Draft/published state, featured/unlisted visibility, ordering | Publishing section and original library actions retained |
| Paid flag, price, currency, provider product and delivery note | Monetization section; browser verified conditional fields and restored the flag |
| Saved project preview | Original /admin/preview/[id] route and project preview link retained |
| Delete confirmation / reorder / quick publishing | Same guarded original actions and confirmation component; library bindings retained |
| Orders: search, status update, license generation | /admin/orders, page/actions byte-identical |
| Licenses: create, search/filter/page, revoke/restore, extend, reset devices, audit trail | /admin/licenses, page/actions byte-identical |
| Checkouts: filter/page, manual access grant/revoke, audit trail | /admin/checkouts, page/actions byte-identical |
| Model library: upload, rename, usage, delete/reassign/force flow | /admin/models, page/actions/uploader byte-identical |
| View public portfolio | Sidebar View portfolio link retained |
| Project updated date | Restored on dashboard and added to project library |
| New homepage customization | /admin/site; separate from per-project case-study themes |

## Verification and limits

- The source comparison and input inventory are recorded in screenshots/admin-parity-2026-11-13/source-audit.json.
- Browser opened Orders, Licenses, Checkouts and 3D models, and verified their corresponding controls. Project editing exercised all six theme choices, accent input, paid-fields disclosure and real markdown preview; original values were restored without submission.
- Final lint, typecheck, all 273 tests in 33 files and production build passed.
- Rendered desktop and 390px/320px project editor/library checks passed; section shortcuts and keyboard focus reach their destinations without obscuring the heading.
- No project themes, buyer access, orders, licenses or model records were changed. Publish/delete/payment/access/model-upload actions were not executed against the live database; their original guarded source and existing tests were retained.
- Model library and paid-project commerce data are currently empty, so data-dependent row controls were verified from source.
- The user subsequently authorized “Go live.” The update is deployed at https://rns-portfolio-teal.vercel.app/. The pending site_settings migration was applied and the live settings editor successfully saved and reloaded the unchanged initial defaults.

## Rendered evidence

The clean production server was reviewed at 1440px, 390px and 320px. The
section navigation is styled and sticky, its links are at least 44px high,
and focused section headings remain visible below it. Phone navigation
wraps into two rows; no horizontal overflow was observed in the editor or
library. The public homepage also rendered successfully with no console
errors. The local development server was restored afterward.

Evidence is in screenshots/admin-parity-2026-11-13/:
- project-library.png: desktop project library with Theme links and dates.
- project-theme-desktop.png: desktop theme editor and section shortcuts.
- project-theme-mobile.png / project-theme-320.png: phone theme controls.
- project-library-mobile.png / project-library-320.png: responsive library.
- public-home.png: unchanged public studio rendering.
- production.stdout.log / production.stderr.log: production review server.
- dev.stdout.log / dev.stderr.log / dev.pid: restored development server.

Native touch hardware, screen-reader speech and OS-level reduced-motion
settings were not exercised in this follow-up.

## Live release evidence

Clean source from dd669c8 was deployed through the existing Vercel account.
Deployment dpl_5obnAimnhNr5ruh8VwddBRZdbKfy is Ready and serves the public
portfolio domain. Browser checked the live six-theme picker, sticky editor
shortcuts, Connected database status and initial draft persistence. The
public sculpture controls, project selection and Shobdo case-study route
worked, and desktop/phone layouts showed no horizontal overflow.

All ten legacy app tables were backed up locally before migration; their
row fingerprints remained identical afterward, including after the initial
settings save. The new settings singleton is at revision 1, with matching
draft and public defaults. Live evidence and the previous deployment for
rollback are recorded in screenshots/go-live-2026-11-13/release.json and
the interactive-studio checkpoint.

## Changed files and reasons

| File | Why |
| --- | --- |
| src/app/admin/(panel)/project-form.tsx | Accessible section destinations and shortcuts; clarify project themes versus homepage appearance |
| src/app/admin/(panel)/projects/project-library.tsx | Direct theme-edit link and real update date on each project |
| src/app/admin/(panel)/projects/page.tsx | Serialize the original updatedAt value for the library |
| src/app/admin/(panel)/page.tsx | Restore project update dates from the old overview |
| src/app/admin/admin-styles.ts | Style section shortcuts, scroll offsets and target focus across widths |
| docs/admin-parity-audit.md | This complete parity inventory, validation scope and file reasons |
| docs/interactive-studio-checkpoint.md | Point continuity to the completed parity follow-up |

Task diff statistics: screenshots/admin-parity-2026-11-13/task-diff-stat.txt.
