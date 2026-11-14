# Licensing local implementation checkpoint — 14 November 2026

Project: D:/CustomCodex/rns-portfolio. Branch: landing-redesign. Baseline f6de784. Resumed from chat Portfolio -3 after trace 3aff640245ffd23b33bbe8fb55a47779.

The user authorized adding the missing KeyGate capabilities with the best suitable free source and easy admin/helper onboarding. The implementation is now locally verified. The user subsequently authorized production release and publication with “resume and go live”; that authorization remains active.

## Working local features

- Multi-app Free/Pro plans, features, Sandbox/Live isolation, code batches/campaigns, access/device support, roles/invites/TOTP, scoped API keys and permission-checked commands.
- Grouped admin navigation, appearance/search, searchable Help, New/Existing app integration prompts, reporting/import/export/backup, signed webhooks and bounded jobs.
- Versioned API/JWS/OpenAPI, branded redemption and accessible widget; JS/TS and backend middleware plus platform SDK sources.
- Linked published portfolio projects accept original legacy keys in Live/device mode, sharing original timers, revocation and slots without copying grants. Advanced actions and PKCE tickets remain new-license capabilities; use Legacy keys for old-key administration.
- Public portfolio, all six themes, site editor, models, orders/checkouts and original licensing API remain present. Unrelated AGENTS.md/alternate logo edits remain outside this task.

## Final fixes and verification

- Widget failure was an already-running synthetic database missing migration 0009. Updating it made the original journey pass. Browser fixtures now apply pending migrations only to their validated synthetic localhost database.
- Fresh read-only review found three important issues; all addressed: credential recovery now raises a token revision floor and cancels pending return tickets; disjoint feature bundles retain independent durations when running or paused; Go/.NET/Swift watermarks preserve the maximum observed clock.
- Recovery, disjoint bundles and Go/.NET stepped rollback regressions were observed RED then GREEN. Swift source/regression remains prepared and unexecuted on Windows.
- Fresh lint and typecheck passed. Full Vitest suite: 314 tests in 51 files passed with two workers. One earlier storage setup hook timed out during parallel builds; isolated 2/2 rerun and subsequent full 314/314 rerun passed without weakening its timeout.
- Production Next 16.4.6 build passed via licensing:build, which supplies synthetic database/secrets rather than loading production values for application work. OpenNext Cloudflare build also passed via licensing:cloudflare.
- All 8 Playwright journeys passed: owner/helper/viewer, legacy parity/permissions, widget redemption/deactivation and hosted invalid-code handling. 320/390/768/1440 width checks passed; fresh desktop/mobile screenshots inspected.
- Python/FastAPI 3 tests, Go signed contract, PHP sodium contract, .NET signed/rollback contract, Kotlin JVM contract and Dart VM contract passed on installed local runtimes. Python was installed into the isolated venv; PHP used its explicit extension directory; Kotlin used the Java compiler entry point to preserve the Windows classpath.
- Integration kit packaging passed and prepared 55 allowlisted files. Full-suite packaging tests verify private/media exclusions. No repository publication occurred.
- Whitespace validation passed. [Every changed file and its reason](licensing/change-inventory.md). Full task stats are retained in ignored .local/resumed-diff-stat.txt.

## Evidence and next steps

Evidence is private/ignored: .local/resumed-final-{tests,lint,types,build,browser}.log; .local/resumed-cloudflare-build.log; .local/final-review-{red,green}.log; .local/legacy-bridge-{red,green}.log; .local/go-watermark-{red,green}.log; .local/dotnet-watermark-{red,green}.log; .local/browser-review/overview-{desktop,mobile}.png.

Local demo command: npm run licensing:demo. URL: http://localhost:3100/admin. It uses only synthetic accounts and the isolated licensing_demo PostgreSQL database on port 55433. Demo access is described in ignored .local/DEMO_ACCESS.md. Check the listener before starting a second instance. Background process/log details: .local/resumed-demo.pid and .local/resumed-demo.{stdout,stderr}.log.

Unfinished release/platform gates: hosted Cloudflare Free CPU (secure scrypt benchmark exceeds 10 ms locally), account-wide free quotas and durable storage provisioning; Swift/macOS/iOS, Android Keystore/reinstall/device, Flutter storage/device and Unity compile/play checks; hosted scheduler verification. Current OpenNext/R2 configuration is a candidate, not a confirmed zero-billing hosted release. Never activate billable resources automatically. Use [hosting preflight](licensing/hosting-preflight.md), [SDK matrix](licensing/sdk-matrix.md) and [release checklist](licensing/release-checklist.md).

Production .env.local still targets the shared Neon database. Do not seed/migrate it during tests or replace existing signing/encryption keys. All new migrations through 0010 were applied only to synthetic local databases. Retain the current origin/issuer and old keys for a future release/host transition. No production data writes, Git push, paid upgrade or live deployment were made.

[Detailed decisions/progress](licensing/PROGRESS.md), [design](superpowers/specs/2026-11-14-license-admin-design.md), [implementation plan](superpowers/plans/2026-11-14-license-admin.md).

## Authorized release preparation — 14 November 2026

- Release source is committed at dc249d3 on landing-redesign; origin/main d995c9d is an ancestor. Clean committed source is extracted in ignored .local/release-20261114/source, excluding unrelated AGENTS.md changes, four untracked brand PNGs, and private evidence. No push or deployment yet.
- Consistent production read-only backup covers all 11 original tables and the six-entry migration journal. It contains 13 records: nine projects, three processed webhook events and one site-settings row; other original tables are empty. URL fingerprint is retained privately.
- Restore rehearsal into a separate localhost licensing_restore_test PostgreSQL database passed. Verified original migration hashes with LF/CRLF tolerance, restored all original records, applied pending migrations 0006–0010, and compared every original record unchanged. The retained isolated cluster is stopped.
- An AES-256-GCM encrypted backup passed a decryption/integrity round trip; its key and original snapshot remain private and ignored. Never publish these files or environment values.
- Private guarded migration tool .local/release-20261114/migrate-production.cjs passed read-only checks: target fingerprint, original migration hashes, all original records, five pending migrations and restore evidence. It requires --apply plus verified hosting-preflight.json evidence before writes. Date objects must be normalized to ISO strings when comparing Neon query results with saved JSON; the apparent timestamp mismatch was representational, not a production data change.
- Vercel CLI 65.16.0 is authenticated as 34rns. Its team is Hobby. The user confirmed paid licenses/sales and selected a suitable free commercial host. Netlify CLI 27.19.0 is authenticated; account raiyannoorsiam is Legacy Free with accumulate_overages=false, 100 GB bandwidth, 125k function invocations and 300 build minutes, and no paid add-ons enabled. This is the account's actual legacy allowance, not the current 300-credit plan.
- New Netlify site: rns-portfolio-34rns, ID 2d1e8492-998f-4522-9e94-f976eec67262; target https://rns-portfolio-34rns.netlify.app. Original Vercel project has no Git linkage. Production database export matches the private backup fingerprint.
- Vercel Secrets cannot be pulled; all old local env exports contain placeholders. Original production values were preserved through a disposable encrypted build snapshot with no domain promotion. The RSA private key stayed local. Snapshot decryption, current owner hash and original canonical live signing-key match passed. Values remain private under .local/release-20261114. Do not regenerate these secrets.
- Disposable Vercel recovery deployments dpl_8Y2kmoSVDzrWmwKtdkUoCYnVkP94 (encrypted snapshot, ready) and dpl_Bh4b32e7kmTB9pSvm8Vv3cyNGurU (blocked Git-author attribution) remain. CLI deletion requires separate human confirmation; do not bypass that guard. They did not replace canonical traffic. Request cleanup approval only after the release is complete/reviewable.
- Netlify environment is prepared with preserved original secrets, new origin/Auth URL, original KEYGATE_ISSUER https://rns-portfolio-teal.vercel.app, dedicated job secret, database settings and native Netlify storage. Eight credentials are marked Secrets with values preserved. Staff mode remains false. LICENSE_JOBS_BATCH_LIMIT=6 is configured; native scheduled function uses a 20-second request deadline plus five-second bounded pending cleanup.
- Host changes: admin origin checks use siteUrl independently of token issuer; redemption/tickets also accept current site origin. Native Netlify uploads use owner-issued signed tickets, 1 MiB edge chunks, SHA-256 binding, full server validation, atomic publication/idempotent recovery, absolute media URLs and streamed edge reads. Existing Blob references remain intact. The native license-jobs function supplies the hourly runner; the temporary GitHub workflow proposal was removed.
- Final verification passed: 333 tests in 54 files, lint, typecheck, production safe build and eight local browser journeys. Evidence: .local/release-20261114/netlify-{tests,types,lint,safe-build}-final.log and netlify-browser-local.log. Reviewed alias, cleanup recovery and rollback URL fixes are included.
- Local offline Netlify build reads preserved secrets correctly; clean dependency installation and Next production build passed. Windows Deno middleware packaging fails on drive-letter path resolution. Use Netlify's Linux build with the verified public Git source rather than publishing a modified adapter. Native hosted verification remains pending.
- Next: build the clean committed source on Netlify; apply guarded additive migrations and bootstrap preserved owner; enable staff only afterward; deploy Netlify, verify owner login, Help/apps, signing, Sandbox license flow, durable upload/read/delete including full 40 MiB and native hourly schedule. Publish source fast-forward and record rollback. No paid plan is authorized.
- No production database mutation, owner bootstrap, staff enablement, Git push or app release occurred yet. Original canonical site remains live; only the separate encrypted recovery build and new-host settings exist.

## Production transition — 14 November 2026

- Supersedes the preparation status above: source commits 6f305a9 and a50c292 were pushed to landing-redesign. Netlify is linked using a read-only GitHub deploy key; Vercel remains unlinked.
- Explicit @netlify/plugin-nextjs configuration fixes missing runtime routing on the legacy account. Linux draft 6af8265e918b2af7c49b6e61 passed homepage/sign-in/OpenAPI/widget HTTP checks, preserved canonical signing-key comparison, guest admin denial and rendered 320/390/768/1440 width checks. Screenshots were inspected. Evidence: private draft-verification.json.
- Netlify's scan found the public commit-author email in docs/repair/commit-history.txt. ADMIN_EMAIL was recreated as ordinary metadata; credentials remain Secrets. No secret scanner was disabled.
- Guarded production migrations 0006–0010 applied successfully at 09:16 UTC; migration count is 11 and all 11 original tables/13 original records compared unchanged. Existing owner bootstrap and original password-hash verification passed. No demo account was created.
- LICENSE_STAFF_ENABLED is verified true. Production rebuild is underway; hosted owner/Sandbox/upload/maintenance checks remain pending. Keep the original Vercel site and original keys for rollback. Do not restore the old database snapshot over later activity.

- Hosted owner authentication and all selected workspace routes initially passed. A Sandbox request exposed a compiled SSR timestamp issue after new activity/access existed: PostgreSQL timestamp text reached Date-based licensing code. A local production-build probe reproduced `expires_at.getTime is not a function`; direct unbundled Neon calls passed. Timestamp fields are now rehydrated using their database type metadata at the shared transaction-store boundary; text and JSON are preserved. Regression observed RED then GREEN; the same compiled production probe now renders the dashboard successfully. Full re-verification is underway.
- Exact disposable test apps/codes/access and any uploads are retained privately in hosted-test-apps.json and hosted-test-uploads.json for scoped cleanup. Do not remove any customer record or original portfolio row. Private operational request diagnostics retain only error type/location and request ID, without request payloads.
- Timestamp-fix verification passed: 334 tests in 55 files, lint/typecheck, safe production build, and the formerly failing compiled Neon dashboard probe. Evidence: release-final-{tests,types,lint,build}.log and local-prod-probe.log. Hosted re-verification and artifact cleanup are the remaining release gates.
