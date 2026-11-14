# License management and helper onboarding design

Project: `D:/CustomCodex/rns-portfolio`
Status: proposed design; planning only, no implementation or deployment authorized by this document.
Baseline: `landing-redesign`, HEAD `f6de784`; deployed application source `dd669c8`.
References: [current checkpoint](../../interactive-studio-checkpoint.md), [admin parity audit](../../admin-parity-audit.md), [existing integration](../../licensing.md). The user's KeyGate prompt is a feature reference; it does not authorize replacing the stack or publishing this private portfolio.

## Intent and decisions

Extend the working portfolio admin into one place to manage products, redeem codes, access, customers, integrations and helpers. A helper should be able to create a product, issue a test code and follow the integration instructions without asking the owner what each field means. A buyer's access must be enforced by the integrated app or backend, not by the dashboard alone.

The user chose to add missing capabilities to this system. My proposed defaults are: reuse Next.js/Neon/Auth.js/Drizzle and the existing encryption/signing primitives; separate redemption codes from granted licenses; preserve old keys and APIs; use scoped helper accounts; provide documentation and generated prompts without paying for an AI service. Implement the useful owner/helper workflow first, then the less common platforms and open-source packaging. All requested gaps remain tracked through the final phase.

Do not duplicate the admin in a second app, replace Postgres with D1, introduce paid analytics, or rebuild the public portfolio. Keep current themes, site customization, 3D models, content, commerce and uploads available. Fix checkout filtering links that currently point to `/admin/orders` instead of `/admin/checkouts`.

## Free operation and hosting

Recommended starting candidate: **Netlify Free for the existing Next.js application + the existing Neon Free Postgres database**. Verify the actual account plans and the exact Next.js 16.4.2 adapter before a release. This is a low-traffic starting option, not an unlimited availability promise.

Checked official sources on 14 November 2026:

| Service | Verified limits or restriction | Decision |
| --- | --- | --- |
| [Netlify Free](https://www.netlify.com/pricing/) | 300 credits/month; production deploy 15 credits; bandwidth 20 credits/GB; compute 10 credits/GB-hour; requests 2 credits/10,000. Exhaustion pauses the team's projects; Free cannot incur overage charges. | Use local verification and previews; batch production releases. Keep auto recharge disabled. Helpers are application users, not paid hosting seats. |
| [Netlify commercial use](https://www.netlify.com/blog/introducing-netlify-free-plan/) | Official announcement allows commercial projects on Free. | Suitable candidate for product licensing. Use the current pricing page for quotas, not the old blog's historic quotas. |
| [Netlify Next.js support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) | App Router, server actions, route handlers, ISR and images supported through its adapter. | Verify this project's auth, proxy, cache revalidation, upload and signing behavior in a private preview. Generic framework support is not proof this release works. |
| [Neon Free](https://neon.com/pricing) | 100 CU-hours/month/project; 1 GB database storage/project; scale to zero after five idle minutes; 100 projects. | Retain the current production data. Use a separate test project with synthetic data. No constantly running database polling. |
| [Vercel Hobby terms](https://vercel.com/legal/terms) | Hobby is limited to personal or non-commercial use. | Do not assume the current account is Hobby; inspect it. Do not recommend Hobby for commercial licensing. A paid Vercel plan is outside the free default. |
| [Cloudflare Workers Free](https://developers.cloudflare.com/workers/platform/pricing/) and [OpenNext](https://opennext.js.org/cloudflare) | 100,000 dynamic requests/day; 10 ms CPU/invocation; 3 MiB compressed Worker limit. | Secondary option only after size, strong-password hashing and runtime tests. Do not weaken password hashing or promise the whole Next.js admin fits. |
| [Cloudflare D1](https://developers.cloudflare.com/d1/platform/pricing/) | 5 million rows read/day, 100,000 rows written/day, 5 GB total storage. | Useful for a new standalone service, but migrating this Postgres system adds work and compatibility risk; not the default. |

Budget example, not a traffic forecast: four production deploys (60 credits), 5 GB delivered (100), 100,000 requests (20), and 2 GB-hours compute (20) total **200 credits/month**. The 3D portfolio can consume bandwidth quickly. Measure asset bytes and actual usage; leave headroom. Do not claim precise usage from uninstrumented metrics.

Free tools: current libraries, Vitest, Playwright, PostgreSQL, Node crypto, local documentation search, and local backups. No mandatory email service: owner creates a short-lived invitation link and shares it themselves. No paid AI/chatbot: Help is searchable local content and “Copy Codex prompt” renders a template. Payment processors can charge transaction fees; manually confirmed payment remains available and no processor subscription is added.

Uploads must have a free, durable production driver before hosting moves. Add a Netlify Blobs adapter behind the existing `StorageAdapter`, verify its current terms and bandwidth accounting in the hosting preflight, and retain current Vercel Blob URLs until an owner-reviewed asset migration is verified. Local disk storage is for development or an actual persistent self-hosted server, never ephemeral functions. A local Node/Postgres deployment on owner-owned hardware is a fallback, with uptime/backups/network access responsibilities documented. A custom domain costs money unless the owner already owns one; provider subdomains work.

## Architecture and compatibility

Keep `src/lib/licensing` as the domain boundary. Reuse key HMAC lookup, encrypted code storage and Ed25519 signing; add focused modules for apps, codes, access, identity, jobs and integrations. Next route handlers and admin server actions call the same permission-checked domain commands.

Existing `licenses`, `license_activations`, `license_events`, purchase and order records remain intact. New tables are additive:

| Table | Purpose and essential constraints |
| --- | --- |
| `license_apps`, `license_plans`, `license_features`, `license_plan_features` | Immutable app UUID, unique display slug, optional linked project UUID, archive flag, per-app policies/branding/origins; unique plan and feature keys per app. Slug/project rename never changes app ID. |
| `redeem_campaigns`, `redeem_presets`, `redeem_batches`, `redeem_codes` | App-scoped templates and issuance; HMAC lookup unique, encrypted code, grant snapshot, redemption deadline, usage count/limit, campaign and batch status/cursor. |
| `access_licenses`, `access_grants`, `code_redemptions`, `access_devices` | One entitlement per app/environment/binding; immutable grants/redemption history; unique idempotency key per app/environment; active device slots; revision for token invalidation. |
| `license_identities` | App-scoped trusted external subject, optional portfolio customer UUID; a posted user_id is never proof of identity. |
| `admin_members`, `admin_invites`, `admin_recovery_codes` | Staff credentials, owner/admin/helper/viewer, app scope, status/session version, encrypted TOTP secret and hashed recovery/invitation tokens. Separate from customer accounts. |
| `app_api_keys`, `admin_audit_events`, `license_rate_buckets`, `admin_saved_views`, `admin_preferences` | Hashed scoped backend credentials, audit, shared limits, per-member filter preferences and theme/date settings. |
| `license_webhooks`, `license_outbox`, `license_deliveries`, `license_job_runs` | Encrypted webhook secrets, durable event/delivery jobs, retry history and expiring job leases. |

Every app-owned record has `app_id` and `environment = sandbox | live`. Queries and constraints include both. Every v1 request carries explicit `environment`, and every v1 token includes a signed environment claim checked by clients/middleware in addition to app audience. There is no implicit live default. App deletion becomes archive; redeemed codes cannot be hard-deleted. Existing cascade relationships must not be extended to erase access or history when a portfolio project is deleted.

Legacy keys stay available through the current endpoints and a clearly labeled Legacy keys tab. V1 can accept a legacy key only for an explicitly linked project and verified legacy scope; it delegates to the existing engine and emits a v1 compatibility result. This adapter reads fresh legacy/device state on every validation and preserves expiry, device counts and old signing keys. Multi-project/all-project keys retain their existing scope. Never convert them automatically into unlimited redemption codes. Advanced new grant actions apply to new access licenses; legacy limitations are labeled. A later conversion requires an explicit per-key mapping and its own preview/rollback, outside this design.

Use an actual PostgreSQL transaction for redeem/grant/device/audit/outbox mutations. The current Neon HTTP Drizzle store is not an interactive transaction API: add a transaction-capable adapter using the installed Neon serverless Pool and Drizzle's Neon serverless adapter, with explicit teardown/runtime validation. Keep old read paths unchanged. Concurrency tests use real isolated Postgres, not only the memory store.

## Domain rules

### Apps and grants

An app has stable ID, name, branding, plans/features, allowed origins, binding mode, max devices, expiry/offline grace and chosen lock behavior. Defaults: device binding, two devices, offline grace **72 hours**, expiry grace **0**, downgrade to a configured free plan. “Hard lock,” “Read-only,” “Downgrade,” and “Custom message” are selectable; the integration implements the behavior. Product gallery/theme is separate from app redeem-page branding and admin appearance.

App count has no arbitrary software cap; free-provider limits still apply. Plans/features use lowercase keys matching `[a-z][a-z0-9_-]{0,63}`. A code snapshots the plan/feature grant so later plan edits do not silently change sold rights. Existing-grant policy changes require a preview, reason and audited action.

### Codes versus licenses

A **code** grants access; a **license** is the resulting right for a user/device in one app. Max redemptions counts distinct successful grants, not devices. Default code is single-use. Multi-use has an explicit bounded limit. A replay of the same idempotency key/body returns the original response; a changed body yields `idempotency_conflict`. The same code/binding cannot consume another redemption, even with a new idempotency key. Stack by redeeming a different code.

In device mode, the first installation creates a license with a stable random license UUID; its initial installation is not the license's permanent identity. Redemption returns an independent 128-bit `activation_key` credential to store securely. `POST /v1/activate` uses that credential to join the same license from another installation, up to its device limit, without consuming another code use. A multi-use code alone creates a new redemption for a new initial installation; joining an existing license always uses its activation_key. Account mode joins through trusted account identity instead. Keys are HMAC-indexed/encrypted, app/environment scoped, rotated on transfer/recovery and never placed in tokens, prompts, URLs or audit output. Helpers cannot reveal them by default. Anonymous recovery needs that credential or an authenticated owner support action; knowing a device ID is insufficient. The UI explains that sharing an activation key shares the license. Stacking into an existing device-mode license requires its activation_key so knowing a second code cannot extend somebody else's grant.

Grant types: lifetime, timed, trial and feature bundle, with optional fixed **redeem-by** deadline and optional fixed **access-until** date. The UI distinguishes those dates. Durations accept minutes/hours/days and calendar months: UTC calendar-month addition clamps to the last day of the target month. First successful redemption starts a new timed grant. Trial means a trial-marked timed grant and one trial per binding/app, not a special secret format.

Stackable timed codes extend from `max(now, current entitlement expiry)`; while paused they add to remaining seconds. Lifetime remains lifetime and accepts feature additions without adding expiry. Independent feature grants have independent expiry: a temporary feature bundle cannot become permanent because its owner has a lifetime base plan. Entitlement reduction is derived from active grants, with a deterministic plan priority set by the app.

Pause preserves remaining time and blocks access; resume restarts that remaining time. Extend, revoke/restore, device deactivation, transfer and redemption undo record actor and reason. Transfer requires a verified target account, invalidates the old binding/devices by incrementing revision, and preserves history. Undo removes only that redemption's grant, recomputes access and does **not** automatically make the code reusable or move money. Refund money through the configured payment/manual workflow separately; the UI names both outcomes.

Generate up to **10,000 codes/batch**, with a default 100 and server pages of **100**. Batches are resumable; retries never duplicate output. Prefix is 2–16 uppercase letters, entropy portion uses a no-0/O/1/I alphabet with at least 80 bits randomness, format preview `MYAPP-XXXX-XXXX-XXXX-XXXX`. User formatting cannot reduce security. Reveals/exports require permission and fresh authentication; codes/secrets never appear in search results or analytics. Bulk import uses a preview, duplicate report and commit, max 10,000 rows/5 MiB, and rejects unsafe/low-entropy supplied codes. Formula-escape CSV cells beginning `=`, `+`, `-`, `@`, tab or CR; quoted cells alone are insufficient.

### Tokens and identities

V1 uses a separate documented EdDSA JWS payload; preserve the existing custom legacy token wire format. Claims: issuer, app audience, environment, key ID, license ID, device fingerprint, trusted subject if present, plan, feature grants/expiries, issued-at, refresh-after, offline-until, license expiry and revision. Token `exp` is the final offline validity bound. Default refresh-after = 24 hours; offline-until = last successful validation + 72 hours, capped by access expiry + expiry grace and any feature expiry for feature checks. Offline validation verifies signature, audience, environment, device, issue/expiry times and each feature's expiry; it never resets the offline timer locally. Cache public keys through rotations; do not extend an expired token on a network failure. Explicit online rejection immediately locks access; revocation cannot be instantly discovered by an offline device and remains bounded by its token.

Device IDs are random installation IDs persisted securely, not hardware fingerprints. Clearing browser/app data can change the ID; Help explains device-slot recovery. Account mode accepts identity only from a scoped backend API credential or a documented token exchange proving that application's user session. Widget/anonymous calls cannot choose somebody else's user_id. Status/deactivate without a token require scoped backend credentials plus trusted identity; an app_id/device_id alone is not authentication.

### Security and roles

| Role | Default capability |
| --- | --- |
| Owner | All apps, team/security/backup, publishing and billing configuration; cannot remove the last owner. |
| Admin | Assigned-app configuration, codes, access, integrations and customer support; no owner/team secrets or hosting credentials. |
| Helper | Assigned-app read, support notes, sandbox codes and integration guides; live generate/extend/reset are opt-in capabilities with limits. No transfer, secret reveal/export, refund, bulk deletion or site publish by default. |
| Viewer | Assigned-app read/help, redacted customer information; no mutations or raw codes. |

Use current strong password hashing and secure Auth.js cookies. Existing environment owner gets a safe one-time bootstrap; never let first public visitor claim ownership. Invitation links expire after 24 hours, are single-use and create a pending staff account. Password reset is owner-issued for helpers; owner recovery is a documented local CLI/recovery-code flow. Role changes/disabling members invalidate authorization via current staff status/session version, not stale JWT permissions. Fix any implicit “missing role means admin” fallback. Every server action/API permission is checked independently of hidden navigation.

TOTP enrollment verifies a code before enabling, remembers the last accepted time step to prevent replay, stores secrets encrypted and recovery codes hashed. Sensitive owner actions require fresh authentication within five minutes. Backend API keys are per app/environment, have scopes/expiry/revoke/rotate and are shown once; old/new overlap is explicit and time bounded. They are never inserted into generated prompts, public docs, widgets or client bundles.

Shared database rate limits: 60/IP/minute, 30/code-hash/minute, 30/device-hash/minute; ten failures within ten minutes lock that identifier for 15 minutes. Login is 5/IP/minute with the same failure lockout. Edge throttling can supplement, not replace, atomic shared counters. Trust only provider-authenticated source IP headers. Hash identifiers with a rotating privacy salt, bound bucket retention and refuse public redeem if limiter storage is unavailable. CORS has exact per-app origins, correct OPTIONS behavior and no wildcard credentialed responses. CORS is not authorization.

Audit all changes, raw-code reveal/export, login/security events, API key usage summaries, integration test runs and permission denials; redact tokens, codes, secrets and sensitive metadata. `admin_audit_events` is append-only through application permissions. Do not claim database-owner tamper resistance.

## Public and admin API

Canonical prefix `/v1` with optional `/api/v1` alias, same handlers. All write operations accept `Idempotency-Key`. Unknown fields fail validation; body size limit 16 KiB for normal requests, 5 MiB for guarded imports. Return `Cache-Control: no-store` for private access responses.

| Endpoint | Contract/authentication |
| --- | --- |
| `POST /v1/redeem` | `{app_id, environment, code, device_id, user_id?, activation_key?, meta?}`; code is credential, user_id requires backend proof; activation_key identifies an existing device-mode license for stacking. Returns license status, token, refresh time, grant summary and activation_key only on credential issuance/recovery. |
| `POST /v1/activate` | `{app_id, environment, activation_key, device_id}`; joins an existing device-mode license without a redemption; slot claim is atomic and respects paused/revoked/expired state. Account-mode activation requires backend-proven subject instead. |
| `POST /v1/validate` | `{environment, token}` or `{app_id, environment, device_id, user_id?}`; latter requires backend key/identity. Reads current revision/binding and issues refreshed token only if active. |
| `GET /v1/status` | Explicit environment plus token via Authorization header, or scoped backend key with trusted identity. Minimal status; never return customer details to a device-ID guesser. |
| `POST /v1/deactivate` | Explicit environment and valid token for that device or scoped backend key; frees one active slot atomically; repeat is a success no-op. |
| `/v1/admin/*` | Explicit resources: apps/plans/features, codes/batches/presets/campaigns, licenses/devices/grants, customers, webhooks/deliveries, keys, audit, team, settings, exports/imports. Same command layer and permissions as dashboard. Scoped backend keys cannot manage staff/owner security. |
| `GET /.well-known/keygate.json` | Public issuer/API version and Ed25519 verification keys; no private configuration. |
| `GET /openapi.json`, `/docs/api` | Validated OpenAPI 3.1 contract and local interactive docs; public examples use sandbox and do not save credentials to localStorage. |
| `GET /integration.md`, `/llms.txt` | Public generic protocol and integration index; private helper procedures remain behind login. |

Stable error codes: `invalid_code`, `redeem_deadline`, `code_exhausted`, `trial_used`, `device_limit`, `identity_required`, `unauthorized`, `forbidden`, `app_archived`, `paused`, `revoked`, `expired`, `invalid_token`, `idempotency_conflict`, `rate_limited`, `storage_unavailable`. Appropriate HTTP 400/401/403/404/409/410/429/503, request ID and plain recovery guidance; no code existence oracle beyond what a valid holder requires.

## Admin navigation and interaction

Keep the existing Archivo typeface, yellow RNS accent and calm workspace. Existing admin light surfaces remain the initial appearance; add Dark/Light/System tokens without affecting the public site or theme picker. Use yellow for selected navigation and primary emphasis, clear text/icon status and tabular numerals for dates/counts. No animated 3D decoration in operational screens.

Desktop sidebar groups, with the same items in a mobile menu:

```text
Overview
Portfolio      Site editor · Projects · 3D models
Products       Apps · Codes · Licenses · Customers · Campaigns
Commerce       Orders · Checkouts
Workspace      Activity · Team · Settings
Help           Help center (always reachable)
```

API keys, webhooks, plans, branding and CORS belong in an app's detail tabs, not six more global sidebar entries. App detail tabs: Overview, Plans & features, Codes, Licenses, Integrations, Branding, Settings. Global app selector persists in URL search params alongside Sandbox/Live. Global views explicitly say All permitted apps. Code generator is a primary action in Codes and app details, not another sidebar page.

Common shell: breadcrumbs, Cmd/Ctrl+K command palette, local navigation/help search and debounced permission-filtered record search, role/scope indicator, consistent Help button, mobile menu, theme toggle. A normal Search button offers equivalent touch/keyboard functionality. Escape closes dialogs; focus is trapped/restored; no shortcuts intercept typing. Do not leak inaccessible counts/titles through search.

Code generator steps: App/plan → Access duration/features → Usage/deadlines/devices → Quantity/campaign → Review. Basic defaults first; advanced fields collapsed. Include Back, Save preset and code preview. Confirm quantity, environment, audience and effect before issuance. A resumable batch progress display uses real counts and Cancel stops future chunks without deleting already issued codes.

Tables use URL-based filters, sorting, pagination and per-member saved views. Max 50 rows/page by default; details live in a linked drawer/page. Mobile cards or contained horizontal scroll preserve context. Bulk action bar appears only when selected; preview affected count and partial failures, require reasons for destructive/access changes. Preserve inputs after validation errors. Loading, empty, no-match, unavailable, stale and permission-denied states give a next action. Do not fabricate KPIs, live feeds or “integration complete.”

Dashboard: issued/redeemed codes, active/expired licenses, app/campaign ranking, expiring soon and recent real activity. UTC storage, displayed owner timezone (default Asia/Dhaka), selectable date format and an English-first i18n scaffold. Manual refresh by default; optional visible-tab-only refresh at 60 seconds. Search/dashboard metrics require indexed queries, bounded date range (default 30 days) and role filtering.

## Help center and Add to app

Searchable, version-controlled guides with audience tags Owner, Helper, Developer; title, prerequisites, exact click path, numbered actions, expected result, common errors, related page link and updated date. Show relevant “How to…” links beside app/code/license actions. Instructions use actual final UI labels and screenshots after browser verification. Keep help links in one consistent shell location; onboarding is skippable and resumable.

Required content:

1. Start here: code vs license, app vs portfolio project, sandbox vs live, which role can do what.
2. Create a new product/app: Apps → New app → name/link project → free/paid plan → choose features → choose lock policy → save.
3. Add licensing to a **new** project; add it to an **already built** project without breaking login, saved work or navigation.
4. Create one code, timed/lifetime/trial/bundle/stacking codes, bulk campaign and saved preset; difference between redeem-by and access-until.
5. Manage customers/devices: expired access, extend, pause/resume, add a second installation with activation key/trusted account, recover/rotate activation key, reset one device, transfer, revoke/restore and undo versus payment refund.
6. Configure secure backend keys, allowed origins, signed webhooks, retry failures and token-key rotation.
7. Platform guides: web/Node/Next.js, Python, Android/Kotlin, iOS/Swift, Flutter/Dart, C#/Unity/.NET, PHP, Go, cURL/REST.
8. Troubleshooting: device limit, lost token, app reinstall, wrong app/environment, CORS, clock/timezone, offline grace, rejected signature, API outage, code exhausted, role denied and webhook delay.
9. Helper handbook: permitted support actions, required notes/reasons, when to refer to owner, sanitized diagnostics and sandbox exercises.
10. Owner operations: invite/remove staff, TOTP/recovery, restore a backup, budget/usage, deployment and incident checklist.

“Add to app” is on every app. Wizard: choose platform and New/Existing → select protected features and backend/client responsibility → show ready-to-copy app ID, API URL, public-key URL, lock behavior and per-app policy → copy Codex prompt or exact code → run sandbox test checklist. No automatic upload of a private codebase. Generated prompt tells Codex to read `/integration.md`, detect platform, use matching SDK, enforce backend access where valuable, preserve existing flows and prove redeem/validate/deactivate/expiry/offline behavior. A filled prompt contains only public configuration; any server secret is referenced as an environment variable to create separately.

Connection checklist: locked before redeem, valid code unlocks intended feature, other app/environment is rejected, tampered token rejected, online revoke/expiry locks, offline token permits only its signed interval, a second device joins using credential/verified account without another redemption, device deactivation frees slot, build passes. “Integration ready” requires recorded test evidence for that app/environment; otherwise label “Instructions prepared.”

## Hosted redemption, SDKs and outgoing events

Hosted `/r/:app_id` uses the app's logo/accent/fonts/copy and secure code entry, loading/success/expired states. Sandbox banner is unmistakable. Account-bound redemption requires authenticated identity exchange; never arbitrary email/user_id. No license token in redirect query strings or logs. For apps needing cross-origin return, use a one-time five-minute exchange ticket bound to an allowlisted return origin, PKCE and the original client installation, redeemed by POST.

`/widget.js` provides a no-code themed modal and toggles `data-keygate="pro"` elements after signature/status checks. Fail locked, accessible dialog, allowlisted embedding and no eval/arbitrary HTML from branding. The help screen explicitly explains that protected downloads/APIs must be gated on the backend: a DOM widget cannot make shipped frontend code uncopyable.

SDKs in `/sdks`: JavaScript/TypeScript first; Python next; Kotlin, Swift, Dart, C#, PHP and Go in later testable tasks. Shared token fixtures and protocol/error codes. Use platform secure storage: Keychain, Android Keystore-backed encrypted storage, OS-backed desktop vault; browser installations in storage and tokens preferably same-site HttpOnly backend sessions, or memory with documented XSS limitations. Dependency-light is the goal; “dependency-free” is not honest on platforms without Ed25519: use vetted `cryptography` (Python), `cryptography` (Dart), NSec or platform-supported crypto for .NET, platform crypto/Keystore for mobile. Never implement crypto primitives to satisfy a dependency count. Unsupported runtime offline verification fails closed with a supported online/backend path.

Middleware: Express, Hono, FastAPI and Next.js, checking token signature/audience/feature/revision through online validation where immediate revocation is required. Responses distinguish license errors from transient outages and do not silently return protected data.

Outgoing signed events: redeemed, expired, revoked, extended, device-added plus pause/resume/transfer/device-removed. Durable outbox in the mutation transaction; stable event ID; HMAC-SHA256 timestamp/raw-body signature, explicit verification example and key rotation. At-least-once deliveries require receiver deduplication. Reject localhost/private/link-local/metadata targets and unsafe DNS/redirect changes; use bounded timeouts and response sizes. Immediate attempt plus due retries at 5 minutes, 1 hour, 6 hours and 24 hours; an hourly free scheduled runner can deliver later than the due time, disclosed in Help. Failed deliveries remain retryable from the admin. Expiry events are computed by indexed hourly sweeps; validation enforces exact expiry independent of the sweep. No silent lost jobs, overlapping leases or pretending a network response guarantees receiver processing.

## Completion and handoff

Success means an assigned helper can create a sandbox app, issue a code, connect a demo client via Help, inspect status/devices and solve a device-limit issue without owner credentials. Owner can manage live products, preserve existing keys/orders, export/restore data, and see actual delivery failures. Verify at 320/390/768/1440px, keyboard/reduced-motion, all states, both admin themes and old project theme picker.

Provide `docs/licensing/{SPEC,DECISIONS,TASKS,PROGRESS}.md` and root `INTEGRATION.md` at implementation; do not replace project AGENTS or unrelated checkpoints. CI lint/typecheck/test/build, synthetic demo seed, screenshots and optional GIF. Prepare MIT licensing **for the reusable licensing module/SDKs only** after checking dependencies and ownership; private portfolio assets/customer data are excluded. Public repository creation/push and any production deploy require a new explicit “go live” for that release. The final full feature set includes this packaging phase; it is not a hidden prerequisite for first internal use.

Production release gate: fresh tests and browser review, tested additive migrations against synthetic old/new records, private backup and restore rehearsal, preview against a separate DB, measured hosting/storage compatibility, owner review and explicit release authorization. Preserve current signing/encryption secrets; if moving origin, update app clients/payment callbacks/CORS and provide dual-origin transition. Preserve the old deployment for application rollback; roll back to a compatible build without dropping new tables or erasing new redemptions.
