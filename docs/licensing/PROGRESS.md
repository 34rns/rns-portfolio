# Licensing execution — D:/CustomCodex/rns-portfolio

User authorized implementation on 14 November 2026, with the most generous suitable free hosting. Read the linked plan/design and this file before resuming.

Plan: ../superpowers/plans/2026-11-14-license-admin.md. Baseline f6de784, existing feature branch landing-redesign. Preserve unrelated AGENTS and logo edits.

## Decisions and preflight

- Ruling: execute in this existing feature checkout because the plan fixes the project path and prior edits must remain accessible; do not create/copy another admin or silently relocate work.
- Ruling: Cloudflare Workers is now the preferred free-host candidate because the user prioritizes free headroom. Keep Neon/Postgres data and existing Next.js architecture. Verify size/CPU/runtime before declaring compatibility; retain Netlify as fallback. D1's Free limit is 500 MB per database (5 GB total), so it is not an automatic storage upgrade over Neon.
- Ruling: the current OpenNext adapter requires Next >=16.4.5; update to 16.4.6 and matching ESLint config as the smallest supported security/compatibility patch.
- Ruling: use local embedded PostgreSQL for isolated testing; no production credentials/rows are copied. Use pg for local TCP and installed Neon Pool for serverless production transactions.
- Ruling: skill shell-ledger helpers are Bash scripts; preserve equivalent task/test/commit records here using native Windows tooling.
- Pre-flight: Tasks 2→5→6→7 use shared AppScope, transaction repository and AccessSnapshot; second-device activate and explicit environment are preserved.
- Pre-flight: Tasks 7→13→16–19 freeze one v1 protocol; no SDK advertises unsupported/offline-unverified targets.
- Pre-flight: Tasks 3→8–11 require live permission lookup on every command; legacy portfolio mutation routes remain owner/admin-only.
- Pre-flight: Task 1 hosting choice supersedes proposed Netlify default; no subscription, push or deployment is authorized.

## Current work

Task 1 in progress: isolated database guards, local runtime and hosting preflight. No production migrations or deployment.

14 November execution milestone:
- Foundations: test environment guard (2 tests), strict contracts (3), live permission rules (2), app persistence/rollback (2) passed. Generated migrations 0006 and 0007 apply only to isolated PostgreSQL. Task 2 database foundations are implemented; full authentication remains in progress.
- Access engine: 6 real PostgreSQL tests passed, including 20-way one-use redemption race, replay, device-slot reuse, calendar-month clamp, pause/resume, temporary bundles on lifetime and targeted undo.
- Operations: 3 real PostgreSQL tests passed for concurrent resumable batch chunks/cancel, hashed scoped API keys/revoke and shared database limits.
- Typecheck passed after these changes. Full suite/build/browser/host checks have not run for this release.
- Ruling: add license_requests as a scoped idempotency journal, because a replay with a new request key needs its own conflict record without duplicating the unique code/binding redemption. No credentials are stored in request hashes.
- Ruling: batch processing accepts the caller's live Principal and scope on each chunk rather than trusting an unscoped batch ID. This prevents revoked helper access from continuing generation.
- Next: complete account identity, auth/TOTP, API/token contract; then admin screens/Help/integration. No implementation task has been marked wholly complete without all its gates.

Second milestone:
- Staff auth/invite/last-owner/TOTP/recovery tests passed (2 real PostgreSQL tests). Staff mode preserves the old owner provider until explicitly enabled; migration/bootstrap precedes enablement.
- V1 JWS and HTTP tests passed (2), integration prompt safety passed (2), actual OpenAPI parser validation passed (1). Tokens bind issuer/app/environment/device; online proof always checks live access before refresh. Legacy serialization is unchanged.
- Admin implemented: grouped navigation, appearance/Ctrl+K, Apps/plans/features/access policy/branding, code generation/presets/campaigns/batch resume, license detail/device reset/recovery/lifecycle/support notes, Customers/Activity/Team/preferences/TOTP, searchable Help and filled Add-to-app prompts. Backend/webhook screen and hosted redemption/SDK/export remain in progress.
- Browser: 3 Playwright journeys passed against synthetic localhost: owner app+code+prompt flow; helper assigned app/Help/Sandbox-vs-Live permission flow; 320/390/768/1440 width and retained site editor navigation. Desktop/mobile overview screenshots inspected in .local/browser-review. The initial failures were overly exact accessible labels and navigation timing; corrected test selectors passed without weakening permission checks.
- Local dev command: npx tsx scripts/licensing/dev.ts. Port 3100, database licensing_demo on 55433; synthetic accounts only. Demo keys and evidence are ignored. Test databases now use isolated directories/ports and remove only their validated scratch directory after shutdown.
- Ruling: app creation is owner-only (apps.create); assigned admins edit existing apps. This avoids creating an app that the creator cannot access without silently widening assignments.
- Ruling: legacy portfolio/sales routes have independent owner guards after the panel admits staff; hidden navigation alone is insufficient.
- Ruling: use the existing database abstractions for local PostgreSQL as well as Neon. A common Drizzle HKT and PromiseLike retry overload preserve legacy query typing without touching legacy behavior.
- Work is not deployed/pushed. Whole-suite, final build, full browser parity, host budget and fresh whole-branch review are still required.

Third execution milestone (resumed handoff):
- Fresh baseline: 304 tests in 46 files passed; new reporting/restore tests 3/3, middleware 1/1, Python/FastAPI 3/3, Go shared contract and PHP shared contract passed. .NET shared contract passed on .NET 10.0.404 with library net9.0 / NSec 26.4.0.
- Widget and hosted redemption browser journeys now pass 2/2. Browser review found and fixed initial-hidden elements remaining hidden after valid redemption; separate test selector/navigation issues were corrected from trace evidence. Existing 3 admin journeys pass at 320/390/768/1440 widths.
- Added masked CSV/JSON downloads, strict atomic import preview/apply, bulk revoke/deadline operations, code detail history, scoped charts/campaign metrics/expiring access, owner-only fresh-auth backup and isolated validate/apply restore.
- Fixed expiry sweep starvation with a 101-expiry real PostgreSQL regression (100 before / 101 after); webhook suite 3/3 passes.
- Added permission-scoped workspace search and prepared platform examples. Final full lint/typecheck/suite/build/browser review still follows remaining changes.
- Cloudflare OpenNext 1.20.17 builds Next 16.4.6 successfully. Dry-run: 21,931.80 KiB raw / 5,009.03 KiB gzip, 153 static assets. This fits the current 64 MiB raw limit; old 3 MB guidance is stale. Local workerd preview /admin/login and /v1/public-key return 200. Authentication, storage, CPU and end-to-end hosted environment remain to verify. No public upload or deployment.
- Ruling: Windows OpenNext build uses a narrow preload that falls back to directory junctions only in validated generated workspace paths after EPERM; no OS settings were changed. Trace pg-cloudflare distribution files explicitly, because Next omitted runtime-only Cloudflare socket code.
- Ruling: .NET minimum is 9 because current NSec 26.4.0 no longer supports net8. Unity remains a distinct unverified target.
- Ruling: imports accept up to 5 MiB data, requiring 6 MiB raw server-action/admin-HTTP caps for multipart/JSON overhead. Restore uses typed 100-row chunks to remain within transaction limits.
- Current official quotas: Cloudflare 100,000 requests/day, 10 ms CPU/request, 64 MiB raw Worker; Neon Free 1 GB/project (20 GB account total), 100 CU-hours/project, 5 GB monthly egress. Provider-plan/account inspection is still pending release setup.
- No production database writes, secrets changes, paid service, Git push or live deploy.

Fourth milestone — recovered trace and final local verification:
- Legacy read-through bridge implemented with original key/project scope, expiry, revocation and device slots; 8-way same-device race regression passes, with Sandbox/unlinked app rejection and no copied grants.
- Final fresh review: three Important findings fixed. Recovery floor/ticket cancellation, active+paused disjoint bundles, and Go/.NET monotonic clock regressions observed RED→GREEN. Swift fix prepared but unverified. No deferred minor findings.
- Final lint/typecheck, 314 tests/51 files, production build, Cloudflare build and 8 browser journeys passed. Desktop/mobile screenshots inspected. R2 test hook initially timed out during build contention; focused and full reruns passed with existing limits.
- Python/FastAPI, PHP, Kotlin JVM and Dart VM rechecked; Go/.NET correction suites passed. Prepared platform/device gates remain as documented in sdk-matrix.md.
- Ruling: signed src distinguishes read-through legacy access without converting original records — preserves timer/revocation compatibility — legacy advanced grant actions and PKCE tickets stay unsupported.
- Ruling: recover-specific min_token_revision preserves normal online refresh after grant edits while invalidating compromised old proofs — additive migration 0010 required before release.
- Ruling: retain feature branch and ignored evidence for continuity; no merge/push/deploy is authorized — hosted/platform checks remain release gates.
- Final review set aside runtime/visual/host/migration readiness: local runtime/visual gates were executed here; hosted CPU/storage and production migration readiness remain owner-reviewed release gates.
- Current handoff and every changed-file reason: ../license-admin-checkpoint.md and change-inventory.md.
