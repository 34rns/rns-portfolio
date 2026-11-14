# Licensing local implementation checkpoint — 14 November 2026

Project: D:/CustomCodex/rns-portfolio. Branch: landing-redesign. Baseline f6de784. Resumed from chat Portfolio -3 after trace 3aff640245ffd23b33bbe8fb55a47779.

The user authorized adding the missing KeyGate capabilities with the best suitable free source and easy admin/helper onboarding. The implementation is now locally verified. Production deployment, hosting migration and public publication are pending a new explicit go live under AGENTS.md.

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
