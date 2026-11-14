# License Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the native session. Steps use checkbox (`- [ ]`) syntax for tracking. This is a planning deliverable; implementation starts only when requested. Do not dispatch implementation agents by default.

**Goal:** Add the missing KeyGate capabilities to the current admin and give owners/helpers a clear, safe product onboarding and support workflow.

**Architecture:** Keep Next.js, Auth.js, Drizzle and Neon; reuse the existing licensing cryptography and legacy APIs. Add app-scoped redemption/grant services behind one permission-checked command layer used by both server actions and versioned HTTP endpoints. Upgrade the existing admin shell and ship searchable local Help plus generated app integration instructions.

**Tech Stack:** Next.js 16.4.2, React 19.3, TypeScript, Tailwind 4, installed Motion, Drizzle 0.45, Neon serverless 1.2, Auth.js 5 beta, Zod 4, Node crypto, Vitest and Playwright. Proposed production host: Netlify Free, conditional on Task 1 verification; retain Neon. Add small vetted crypto dependencies to SDKs only where platform APIs cannot safely verify Ed25519.

**Spec:** [License management and helper onboarding design](../specs/2026-11-14-license-admin-design.md). Read the whole spec before executing a task; its domain rules are shared contracts.

## Global Constraints

- Planning only: no product code, dependency installation, database mutation, push or deploy in the current planning task.
- During execution preserve legacy keys/API wire format, records, public portfolio/header, all six project themes, site customization, model library, orders/checkouts and uploads.
- Work only in `D:/CustomCodex/rns-portfolio`. Preserve the pre-existing `AGENTS.md` edit and four untracked logo PNGs.
- Additive migrations; `.env.local` currently points to production Neon. Use a separate synthetic-data test project and never seed/migrate it by accidentally loading production env files.
- No paid service or automatic paid upgrade; provider caps are hard limits, not an unlimited scale promise. No production deployment or Git push without a new explicit “go live.”
- Every new app-owned row/query includes `app_id` and `environment: sandbox | live`.
- Defaults: two devices; 72-hour offline grace; zero expiry grace; 24-hour refresh-after; one redemption/code; batch default 100, maximum 10,000 in chunks of 100; normal admin page 50 records.
- Store UTC; default displayed timezone Asia/Dhaka. Preserve installed Archivo and RNS yellow branding. Admin Light/Dark/System is separate from the public/project theme picker.
- Use current Next.js local documentation before implementation. Browser review is mandatory for completed UI changes.

## Review Focus

1. Two concurrent final redemptions or same-device requests must not create extra grants/slots; actual Postgres tests belong to Tasks 2, 5 and 6.
2. Role downgrade, unknown JWT role, forged identity or cross-app/environment requests must not retain access; Tasks 3, 4, 7 and 8.
3. Calendar boundaries, stacked feature grants, pause/undo and offline key rotation must not grant permanent/extra access; Tasks 5, 6, 7 and 16.
4. Interrupted bulk jobs, repeated webhooks, malicious CSV and upload/hosting failures must be resumable or visibly refused; Tasks 1, 10, 14 and 20.
5. Helpers starting on mobile with no data, denied actions or failed integrations must have a next step without seeing secrets; Tasks 8–13, 15 and 21.

## Delivery order

| Stage | Tasks | Working result |
| --- | --- | --- |
| Foundation | 1–4 | Safe test environment, additive schema, scoped staff and credentials. |
| Access engine | 5–7 | Atomic code redemption, license lifecycle and compatible versioned API. |
| Everyday admin | 8–12 | Simple navigation, app/code/license screens, initial Help and sandbox onboarding. |
| App connections | 13–17 | Add to app prompts, outgoing events, branded redemption/widget, web/Node/Python integration. |
| Full coverage | 18–20 | Other SDKs, campaign analytics and export/backup tooling. |
| Release and reuse | 21–22 | Verified preview/release and prepared reusable open-source package. |

Tasks are sequential at shared schema/auth/API boundaries. Task 12 depends on the final labels from 8–11; 13 depends on 7/9/12; 14 depends on 5/6/7; 15 depends on 7/9/13; 16–19 use the frozen contract from 7/13. Ship internal milestones behind capability flags; do not present unimplemented controls as working features.

## File boundaries and shared contracts

Keep legacy `src/lib/licensing/{keys,token,service,store,db-store,admin}.ts`; add focused modules rather than expanding one service file indefinitely. `src/lib/licensing/contracts.ts` owns the following shared exported types:

```ts
type Environment = "sandbox" | "live";
type AppScope = { appId: string; environment: Environment };
type StaffRole = "owner" | "admin" | "helper" | "viewer";
type Principal = { kind: "staff" | "api"; id: string; role?: StaffRole;
  appIds: string[]; environments: Environment[]; capabilities: string[] };
type Binding = { deviceId: string; trustedSubject?: string };
type GrantInput = { type: "lifetime" | "timed" | "trial" | "bundle";
  planKey: string; featureKeys: string[]; durationSeconds?: number;
  calendarMonths?: number; accessUntil?: string; stackable: boolean };
type AccessStatus = "active" | "paused" | "revoked" | "expired";
type AccessSnapshot = { licenseId: string; source: "app" | "legacy";
  appId: string; environment: Environment; status: AccessStatus;
  planKey: string; features: { key: string; expiresAt: string | null }[];
  expiresAt: string | null; revision: number; deviceId: string };
type AccessResponse = { access: AccessSnapshot; token: string | null;
  refreshAfter: string | null; offlineUntil: string | null; activationKey?: string };
type Page<T> = { items: T[]; nextCursor: string | null; total: number };
type CommandResult<T> = { ok: true; value: T } |
  { ok: false; code: string; requestId: string; retryAfterSeconds?: number };
```

`contracts.ts` also owns strict Zod request schemas, `AppInput` (all app policy/branding/origin fields from spec), `GenerateCodesInput` (grant, format, deadlines, uses, count, campaign, note), `CodeRow` (masked code + summary, never raw secret), `CodeFilter`, `LicenseFilter`, `CustomerRow`, `CampaignRow`, `AdminPreferences`, `WebhookInput`, `AuditRow`, and `IdentityProof` (`backend` scoped principal + subject, or verified session exchange). Define these before consumers, derive TypeScript from Zod, and version serialized structures. `Principal` app scope is reloaded from DB; role alone does not authorize a command.

### Task 1: Safe execution setup and free-host preflight

**Files:** Create `docs/licensing/{SPEC,DECISIONS,TASKS,PROGRESS}.md`, `scripts/licensing/check-test-env.ts`, `scripts/licensing/seed-demo.ts`, `tests/helpers/licensing-env.ts`, `docs/licensing/hosting-preflight.md`; modify `package.json` only for local test commands. Task 21 owns deployment config and production upload adapter. Do not overwrite `AGENTS.md` or copy customer records to fixtures.

**Interfaces:** `assertTestDatabase(url: string, productionHost: string): void` refuses known production host, missing test marker and unsafe seed target; `seedLicenseDemo(scope: "test" | "demo"): Promise<void>` creates deterministic synthetic apps/staff/codes. Test helpers read `LICENSE_TEST_DATABASE_URL` explicitly, not `.env.local` fallback.

- [ ] Write `tests/licensing-env.test.ts`: production host, missing marker or absent URL throws; marked isolated target passes; a seed rerun is idempotent and never deletes unknown rows.
- [ ] Run the test red, implement guards/seed and run it green. Record exact commands and sanitized test-target identity in PROGRESS.
- [ ] Record actual Vercel/Neon plan, Netlify Free terms/Next.js adapter compatibility, durable upload options and measured asset-byte estimate. Verify Netlify Blobs pricing/SDK instead of assuming free storage is unlimited. No live deployment/migration yet.
- [ ] Copy this task list to the compact TASKS ledger, decisions to DECISIONS and contracts to SPEC; make a task-scoped local commit only when the execution checks pass.

### Task 2: App, code, grant and atomic persistence foundation

**Files:** Modify `src/lib/db/schema.ts`; create `src/lib/licensing/{contracts,apps,transaction-store,app-store,app-db-store}.ts`, `tests/helpers/memory-app-store.ts`, `tests/licensing-apps.test.ts`, `tests/licensing-postgres.test.ts`, new generated migration/snapshot/journal entries from `npm run db:generate`. Preserve the next generated Drizzle filename; do not guess its sequence if another migration has appeared.

**Interfaces:** `createApp(store: AppStore, principal: Principal, input: AppInput): Promise<CommandResult<AppScope>>`; `withLicenseTransaction<T>(fn: (tx: LicenseTransaction) => Promise<T>): Promise<T>`; transaction repository methods for locked code/access lookup, unique redemption insert, grant/device mutation and audit/outbox insert. Define `LicenseTransaction` with these methods and no public arbitrary SQL endpoint.

- [ ] Write app tests: stable UUID after rename; plan/feature uniqueness; independent sandbox/live data; archive preserves records. Write Postgres tests: failure after grant insert rolls back redemption, audit and outbox; duplicate idempotency constraint holds under parallel transactions.
- [ ] Run red against isolated Postgres; implement all additive tables in the spec and the installed Neon Pool/Drizzle transaction adapter. Pin lifecycle: acquire/release connection per request, bounded pool, rollback on exception. Test on the target runtime.
- [ ] Test migrations from a synthetic legacy fixture: old keys/activations/settings/orders/purchases compare identically before/after, with new app data created separately. Project deletion must not delete new access history.
- [ ] Run app/Postgres tests green, regenerate schema snapshots, record compatibility and locally commit this deliverable.

### Task 3: Staff accounts, roles, invitations and TOTP

**Files:** Modify `src/lib/auth/{index,config,guard,require-admin}.ts`, `src/types/next-auth.d.ts`, `src/proxy.ts`, admin login form/page and panel layout; create `src/lib/auth/{staff,permissions,totp,recovery}.ts`, `scripts/licensing/bootstrap-owner.ts`, `tests/{staff-auth,staff-permissions,staff-totp}.test.ts`.

**Interfaces:** `requireCapability(capability: string, scope?: AppScope): Promise<Principal>`; `can(principal: Principal, capability: string, scope?: AppScope): boolean`; `createStaffInvite(owner: Principal, input: {email: string; role: StaffRole; appIds: string[]}): Promise<{url: string; expiresAt: string}>`; `verifySecondFactor(memberId: string, code: string, now: Date): Promise<boolean>`.

- [ ] Write tests: viewer/helper denied mutation, scoped admin denied other app, last owner cannot be removed, disabled/downgraded staff rejected with stale session, unknown role denied, customer login unchanged.
- [ ] Test one-use 24-hour invite, invitation replay/expiry, TOTP enrollment verification/replay, hashed recovery code single use and five-minute sensitive-action authentication. Bootstrap only from configured existing owner in an authenticated local CLI.
- [ ] Run red, implement staff provider and permission lookup independent of JWT, preserve visitor provider, replace implicit admin-role defaults; add owner-issued password reset and documented owner recovery. Secrets remain encrypted/hashed; log redacted events.
- [ ] Run tests green and old `auth-guard`/`signup` tests; commit. Apply individual permissions to old server actions later in Task 8—do not broadly grant helpers old admin mutation access.

### Task 4: Scoped backend keys, trusted identities and shared rate limits

**Files:** Create `src/lib/licensing/{api-keys,identity,shared-limits}.ts`; modify `src/lib/licensing/{cors,request}.ts`, `src/lib/http/ip.ts`, admin login actions; tests `licensing-{credentials,identity,shared-limits,cors}.test.ts`.

**Interfaces:** `authenticateAppKey(request: Request, requiredScope: string): Promise<CommandResult<Principal>>`; `resolveBinding(scope: AppScope, input: Binding, proof?: IdentityProof): Promise<CommandResult<Binding>>`; `checkSharedLimits(input: {scope: AppScope; ipHash: string; codeHash?: string; deviceHash?: string; action: "redeem" | "login"}, now: Date): Promise<CommandResult<null>>`.

- [ ] Tests: key issued once, stored hashed, expired/revoked/wrong-app/wrong-environment key fails; rotation overlap then expiry; arbitrary posted subject cannot bind account; provider-spoofed IP rejected; exact origin/OPTIONS accepted, mismatched origin refused.
- [ ] Add real DB concurrency tests for 60/IP/minute, 30/code/minute, 30/device/minute and ten failures → 15-minute lockout; restart process must not reset counters. Login limit is 5/IP/minute. Unavailable limiter fails closed.
- [ ] Run red, implement atomic buckets/retention, authenticated identity exchange, per-app CORS and redacted credential audit. Public code redemption remains possible without putting a backend key in clients.
- [ ] Run green with old CORS/key tests and commit. Reuse these guards in every public/admin endpoint.

### Task 5: Generate and redeem codes atomically

**Files:** Create `src/lib/licensing/{codes,redemption,batches}.ts`; reuse `keys.ts` primitives; tests `licensing-{codes,redemption,batches}.test.ts` and concurrency cases in `tests/licensing-postgres.test.ts`.

**Interfaces:** `startCodeBatch(store: AppStore, principal: Principal, scope: AppScope, input: GenerateCodesInput, idempotencyKey: string): Promise<CommandResult<{batchId: string}>>`; `processCodeBatch(store: AppStore, batchId: string, limit: 100): Promise<{created: number; complete: boolean}>`; `redeemCode(store: AppStore, scope: AppScope, input: {code: string; binding: Binding; activationKey?: string; meta?: Record<string,string>}, idempotencyKey: string, now: Date): Promise<CommandResult<{access: AccessSnapshot; activationKey?: string}>>`.

- [ ] Tests: lifetime/timed/trial/bundle; independent redeem-by/access-until deadlines; duration seconds and UTC month clamp (31 January + one month ends February's last day); snapshot plan/features; 80-bit minimum entropy even with custom prefix; duplicates retry safely.
- [ ] Concurrency tests: a one-use code with 20 simultaneous distinct bindings creates exactly one redemption/grant; a 3-use code creates exactly three; same binding/new idempotency key consumes no extra use; changed body/same key yields conflict.
- [ ] Run red, implement transactional redemption with row locking/unique constraints and audit/outbox commit. First device-mode redemption issues a 128-bit activation credential, HMAC-indexed/encrypted and app/environment scoped. Stacking into existing license requires that credential/trusted account. Build resumable 100-code batch chunks up to 10,000, cancel future chunks and preserve issued ones. Permanent/bundle feature lifetimes remain independent.
- [ ] Run green including interrupted batch restart and per-role/live quantity limits; commit.

### Task 6: Access lifecycle, devices and legacy bridge

**Files:** Create `src/lib/licensing/{access,grants,devices,legacy-bridge}.ts`; read/reuse existing `service.ts` without changing its public return format; tests `licensing-{access,devices,legacy-bridge}.test.ts` plus Postgres races.

**Interfaces:** `applyLicenseAction(store: AppStore, principal: Principal, scope: AppScope, input: {licenseId: string; action: "pause" | "resume" | "extend" | "revoke" | "restore" | "transfer" | "undo"; reason: string; seconds?: number; targetSubject?: string; redemptionId?: string}, now: Date): Promise<CommandResult<AccessSnapshot>>`; `activateExistingLicense(store: AppStore, scope: AppScope, binding: Binding, activationKey: string | IdentityProof, now: Date): Promise<CommandResult<AccessSnapshot>>`; `deactivateDevice(store: AppStore, scope: AppScope, licenseId: string, deviceId: string, now: Date): Promise<CommandResult<null>>`; `resolveLegacyAccess(store: AppStore, scope: AppScope, keyOrToken: string, binding: Binding, now: Date): Promise<CommandResult<AccessSnapshot>>`.

- [ ] Tests: paused remaining time does not shrink; stack while paused adds time; expired timed access stacks from now; lifetime never expires; timed feature on lifetime plan expires independently; undo removes only matching grant and does not restore code use; transfer invalidates old subject/devices.
- [ ] Race tests: exactly two active slots at maxDevices=2; second device uses activation credential/trusted account and adds zero redemptions; third device refused; guessed device ID/wrong-environment credential refused; repeated deactivate is a no-op; transfer/recovery rotates credential; reset/transfer/redeem interleavings cannot resurrect revoked binding. Audit/outbox follows transaction outcome.
- [ ] Implement grant reducer/revision and read-through legacy adapter: current key scope, expiry and device counts survive. Advanced actions on legacy keys show unsupported capability rather than changing timer semantics. Revalidation checks live legacy state.
- [ ] Run green with existing licensing service/key/token suites; commit. Preserve order-to-license links.

### Task 7: V1 tokens, public/admin HTTP and OpenAPI contract

**Files:** Create `src/lib/licensing/{v1-token,http,admin-commands,openapi}.ts`, `src/app/v1/[...path]/route.ts`, `src/app/api/v1/[...path]/route.ts`, `src/app/.well-known/keygate.json/route.ts`, `src/app/openapi.json/route.ts`, `src/app/docs/api/page.tsx`; tests `licensing-{v1-token,v1-http,admin-api,openapi}.test.ts`.

**Interfaces:** `signAccessToken(access: AccessSnapshot, now: Date): AccessResponse`; `verifyAccessToken(token: string, scope: AppScope, deviceId: string, now: Date): CommandResult<AccessSnapshot>`; `handleV1(request: Request, segments: string[]): Promise<Response>`. Existing `/api/license/*` routes remain compatible.

- [ ] Tests: exact spec routes/payloads, no unauthenticated device-status oracle, forged account binding rejected, correct 400/401/403/409/410/429/503 and no-store; idempotency on writes, body bounds; backend keys cannot manage owner/team settings.
- [ ] Token tests: bad signature, wrong issuer/audience/device, replay across sandbox/live, feature expiry, offline final bound, local clock rollback, rotation with retained old keys; refreshed token only after active online check. Keep legacy token serialization intact.
- [ ] Implement strict route dispatch using shared commands, including additional `/v1/activate` for second-device joining. Require explicit environment on all requests and sign/check it in token claims. Add every dashboard resource's admin API to OpenAPI; schema generation and runtime parsers share contract definitions. Interactive docs default to synthetic sandbox; no credential persistence/automatic live calls.
- [ ] Run green, validate OpenAPI 3.1 with an actual schema validator and test both route prefixes; save cross-language signed fixtures in `tests/fixtures/licensing-v1.json`; commit and freeze v1 contracts for SDK tasks.

### Task 8: Clear admin shell, roles, theme and search

**Files:** Modify `src/app/admin/admin-{shell.tsx,styles.ts}`, `(panel)/layout.tsx`, old projects/models/site/orders/checkouts/licenses actions and API admin upload/model routes; create `src/components/admin/{navigation,command-palette,breadcrumbs,theme-provider}.tsx`, `src/lib/admin/{navigation,search,preferences}.ts`, `src/app/api/admin/search/route.ts`; tests `admin-{navigation,search,permissions}.test.ts`, `e2e/admin-shell.spec.ts`.

**Interfaces:** `navigationFor(principal: Principal): NavGroup[]`; `searchAdmin(principal: Principal, query: string, scope?: AppScope): Promise<SearchResult[]>`; `NavGroup`/`SearchResult` contain labels, route and permitted summaries only; `AdminPreferences` uses the shared schema.

- [ ] Tests: spec's grouped routes, deep-link breadcrumbs, every old feature still reachable, theme independent of project/site theme, restricted app records/counts absent from search, unknown role never sees mutation controls.
- [ ] Implement URL app/environment filters and capability guards in existing actions/APIs. Site publish, payments, uploads and model edits remain owner or explicitly granted portfolio capabilities. Fix only filter/pagination URLs on Checkouts to `/admin/checkouts`; keep its explanatory Orders link.
- [ ] Browser test light/dark/system, mobile menu at 320/390px, Cmd/Ctrl+K plus Search button, Escape/focus return, reduced motion, screen loading/error/no-match states and permission errors. No keyboard shortcuts inside text inputs.
- [ ] Run tests green and browser review; commit. Reuse existing patterns/components rather than installing a large new dashboard kit.

### Task 9: Apps, plans, features and guided product setup

**Files:** Create `src/app/admin/(panel)/apps/{page.tsx,actions.ts,app-library.tsx}`, `apps/new/page.tsx`, `apps/[id]/{page.tsx,app-editor.tsx}`, `src/components/admin/app-context.tsx`; tests `admin-apps.test.ts`, `e2e/admin-apps.spec.ts`.

**Interfaces:** App forms consume `createApp`/`AppInput`; app detail tabs share `AppScope`. Integrations/branding/settings tabs call shared commands, not their own authorization logic.

- [ ] Tests: create app without a portfolio project, optional linking, immutable ID after rename, unique plans/features, policy validation, archive retains existing rights/history; per-app origin/branding defaults isolated.
- [ ] Implement spec's tabs and skippable/resumable setup: app → plan/features → lock policy → sandbox code → Add to app. Existing owner gets onboarding checklist, not a public create-owner screen.
- [ ] Add basic-first forms, field Help, unsaved-change handling, unavailable states and explicit Sandbox/Live. Backend keys are revealed only during issuance, never in saved app config HTML.
- [ ] Verify helper and owner browser flows at mobile/desktop; commit with green tests.

### Task 10: Code wizard, tables, campaigns and bulk workflows

**Files:** Create `src/app/admin/(panel)/codes/{page.tsx,actions.ts,code-table.tsx,code-generator.tsx}`, `codes/[id]/page.tsx`, `campaigns/{page.tsx,actions.ts}`, `campaigns/[id]/page.tsx`, `src/components/admin/{data-table,saved-views}.tsx`; tests `admin-codes.test.ts`, `e2e/admin-codes.spec.ts`.

**Interfaces:** Use `GenerateCodesInput`, `CodeFilter`, `CodeRow`, `CampaignRow`, `Page<T>` and batch service. Default pagination 50, max 100; URL filters allow status/app/environment/campaign/plan/date/query and validated sort keys.

- [ ] Tests: exact issuance summary, preserve form input on errors, no secrets in table/search/analytics, helper cannot issue live codes by default, saved view belongs to member, bulk action enforces every selected ID's scope.
- [ ] Implement five-step wizard, preview, presets, quantity/campaign, review and real resumable progress. Codes detail shows redemption history; Legacy keys tab links existing license view. Archived/used codes cannot be silently hard-deleted.
- [ ] Browser check mobile detail/table containment, no-match reset, Back/Skip, partial failure/retry, cancel/resume of simulated 10,000 batch. Wire CSV/export buttons only when Task 20 is available.
- [ ] Run green, preserve current key generation/order workflow, commit.

### Task 11: License/customer support and payment boundaries

**Files:** Modify `src/app/admin/(panel)/licenses/{page.tsx,actions.ts}`; create `licenses/[id]/page.tsx`, `licenses/license-detail.tsx`, `customers/{page.tsx,actions.ts}`, `customers/[id]/page.tsx`; modify order/checkouts action integration only where a new app entitlement is explicitly selected; tests `admin-license-support.test.ts`, `e2e/admin-license-support.spec.ts`.

**Interfaces:** Filtered `Page<AccessSnapshot>`/`Page<CustomerRow>`; forms call `applyLicenseAction`/`deactivateDevice` with scoped Principal and reason. Legacy record view keeps current create/revoke/extend/reset actions.

- [ ] Tests: accurate status/remaining time/devices, one-device reset, helper limitations, verified-target transfer, undo removes grant only, external app subject/customer linking does not merge unrelated accounts.
- [ ] Implement details and activity timeline, notes, reason/impact previews and granular permission labels. Clearly state “Undo access” versus payment refund; don't claim a financial refund unless provider/manual operation succeeded.
- [ ] Browser exercise device-limit support, expired/paused access and denied action Help links using synthetic buyers; retain old Orders, Checkouts and permanent/day-key workflows.
- [ ] Run green with existing manual-order/payment idempotency/entitlement tests; commit.

### Task 12: Searchable Help and helper handbook

**Files:** Create `docs/help/{start-here,new-product,codes,license-support,helper-handbook,owner-operations,troubleshooting}.md`, `src/lib/help/{registry,search}.ts`, `src/app/admin/(panel)/help/{page.tsx,[slug]/page.tsx}`, `src/components/admin/context-help.tsx`; tests `help-content.test.ts`, `e2e/admin-help.spec.ts`.

**Interfaces:** `HelpArticle = {slug: string; title: string; audience: StaffRole[]; prerequisites: string[]; updatedAt: string; relatedRoutes: string[]; body: string}`; `findHelp(query: string, principal: Principal): HelpArticle[]`; explicit article registry, no arbitrary filesystem route reads.

- [ ] Content checks: every required owner/helper topic from spec has an article; all click paths reference registered routes; private articles aren't exposed by public integration endpoints; credentials/tokens absent.
- [ ] Write real step-by-step instructions using labels finalized in Tasks 8–11, including second-device activation/recovery credentials versus redemption count. Each article includes expected result, failure remedies, permissions and related action link; searchable local index needs no SaaS or LLM.
- [ ] Browser run a new helper's sandbox exercise using only Help: new app → plan → test code → inspect access → solve device limit. Add contextual Help and consistent global Help location; ensure mobile, keyboard and zero-search guidance.
- [ ] Run content checks/browser review, capture synthetic screenshots once the relevant screen is verified, commit. Extend platform Help with Tasks 13–19.

### Task 13: Add to app prompts and public integration instructions

**Files:** Create `src/lib/licensing/integration-prompt.ts`, `src/app/admin/(panel)/apps/[id]/integrate/{page.tsx,integration-wizard.tsx,actions.ts}`, root `INTEGRATION.md`, `docs/help/{new-app-integration,existing-app-integration,backend-security}.md`, `src/app/{integration.md,llms.txt}/route.ts`; tests `integration-prompt.test.ts`, `e2e/add-to-app.spec.ts`.

**Interfaces:** `buildIntegrationPrompt(input: {appId: string; environment: Environment; apiUrl: string; publicKeyUrl: string; platform: string; existingApp: boolean; lockBehavior: string; featureKeys: string[]}): string`; `recordIntegrationCheck(principal: Principal, scope: AppScope, input: {step: string; evidence: string; passed: boolean}): Promise<void>` records real evidence.

- [ ] Tests: correct app/environment/origin/policy filled, no server key/pepper/private PEM in prompt or public docs, data strings cannot introduce template instructions, unsupported platform points to REST rather than a nonexistent SDK.
- [ ] Write normal three-call redeem/validate/deactivate protocol plus separate activate-existing-license flow, offline verification/storage/device ID rules, API errors, backend gates, retrofit checklist and platform guide links. Environment is explicit in every example/token check. Render copyable Codex prompt and code; secrets are separate environment-variable setup.
- [ ] Browser flow for owner/helper: choose New/Existing/platform/features → Copy → sandbox exercise checklist. Show “Instructions prepared” until tests have recorded passing evidence; do not equate generating code with integration being verified.
- [ ] Run green and document web-first usable milestone; commit. Platform snippets point only to SDKs completed in Tasks 16–19.

### Task 14: Signed outgoing webhooks and scheduled jobs

**Files:** Create `src/lib/licensing/{webhooks,outbox,jobs}.ts`, `src/app/api/internal/license-jobs/route.ts`, `netlify/functions/license-jobs.ts`, `src/app/admin/(panel)/apps/[id]/integrations/{page.tsx,actions.ts}`, `docs/help/webhooks.md`; tests `licensing-{webhooks,outbox,jobs}.test.ts`.

**Interfaces:** `enqueueLicenseEvent(tx: LicenseTransaction, input: {scope: AppScope; eventId: string; type: string; licenseId: string; payload: Record<string,unknown>}): Promise<void>`; `runLicenseJobs(now: Date, limit: 100): Promise<{processed: number; failed: number}>`; `verifyWebhook(body: Uint8Array, timestamp: number, signature: string, secret: string, now: Date): boolean` rejects timestamps beyond five minutes.

- [ ] Tests: rollback publishes nothing; stable event ID, duplicate/out-of-order delivery, bad/tampered/replayed signature, rotation; concurrent runners cannot double-claim; process crash/lease expiry makes job retryable.
- [ ] Tests: reject metadata/local/private targets, DNS rebinding and redirect-to-private; timeout/response bounds; indexed expiry event emitted once even if sweep repeats. Verify signatures over raw bytes.
- [ ] Implement durable outbox, immediate bounded attempt, due retries at 5m/1h/6h/24h with hourly scheduler, failed delivery history and manual retry. Jobs endpoint requires dedicated internal credential; scheduler only wakes bounded work. Help discloses hourly delivery lateness and at-least-once semantics.
- [ ] Run green, test scheduler against isolated DB/provider preview and validate compute budget; commit. Incoming payment webhook handling remains separate.

### Task 15: Branded redeem page and accessible widget

**Files:** Create `src/app/r/[appId]/{page.tsx,redeem-form.tsx}`, `src/lib/licensing/redeem-ticket.ts`, `src/app/v1/exchange/route.ts`, `src/widget/{index.ts,dialog.ts,access.ts}`, `scripts/licensing/build-widget.ts`, `src/app/widget.js/route.ts`, `docs/help/hosted-redemption.md`; tests `redeem-ticket.test.ts`, `e2e/redeem-widget.spec.ts`.

**Interfaces:** `issueReturnTicket(scope: AppScope, binding: Binding, returnOrigin: string, pkceChallenge: string): Promise<{ticket: string; expiresAt: string}>`; `exchangeReturnTicket(ticket: string, pkceVerifier: string, returnOrigin: string): Promise<CommandResult<AccessResponse>>`; widget consumes public v1 only and app branding.

- [ ] Tests: ticket one-use/five-minute expiry, origin/PKCE/device/environment mismatch rejected, no token URL/log leakage; account-bound redeem demands trusted identity; unsafe brand HTML/CSS denied.
- [ ] Implement responsive app-branded page, sandbox label and redemption errors/success. Widget script recognizes `data-app`/`data-keygate`, opens keyboard-safe dialog and fails locked after invalid/expired token.
- [ ] Browser verify hosted/widget keyboard focus, reload, offline bound, revoked token, invalid code, storage disabled and embedding on disallowed origin. Document server-side protection for valuable APIs/downloads.
- [ ] Run green and build a bounded widget bundle with no remote paid dependency; commit.

### Task 16: JavaScript/TypeScript SDK and backend middleware

**Files:** Create `sdks/javascript/{package.json,src/index.ts,src/browser.ts,src/node.ts,README.md,examples/browser/index.html,examples/node/index.ts}`, `sdks/middleware/{express.ts,hono.ts,next.ts,README.md}`, `tests/{sdk-javascript,middleware-javascript}.test.ts`, `docs/help/platform-web.md`.

**Interfaces:** JS exports `createKeyGateClient({appId, environment, apiUrl, storage, deviceId})` with `redeem(code)`, `activate(activationKey)`, `validate()`, `deactivate()`, `can(featureKey)`; `requireLicense({appId, environment, featureKey})` adapters consume the same v1 token fixtures. Backend keys only in server configuration; user activation credentials in secure SDK storage.

- [ ] Write fixtures-first tests for Node/browser token verification, unknown key cache/rotation, time rollback, capped offline grace, feature expiry, unavailable storage/network and all v1 errors; valuable API returns protected content only after valid feature entitlement.
- [ ] Implement platform-native crypto and dependency-light SDK, stable install ID, secure storage adapters and clear online/backend fallback if Ed25519 unavailable. Never silently skip verification.
- [ ] Run an actual demo locked → redeem → access → deactivate → expiry/revoke; Express/Hono/Next adapters pass identical contract tests. Add existing-app retrofit example.
- [ ] Browser-check sample client, run build/test green and update integration availability; commit.

### Task 17: Python SDK and FastAPI middleware

**Files:** Create `sdks/python/{pyproject.toml,keygate/__init__.py,keygate/client.py,keygate/token.py,keygate/fastapi.py,tests/test_contract.py,examples/app.py,README.md}`, `docs/help/platform-python.md`.

**Interfaces:** `KeyGateClient.redeem/activate/validate/deactivate/can` mirrors JS semantics; `require_license(app_id, environment, feature_key)` is the FastAPI dependency. Use vetted cryptography for Ed25519 and optional OS vault integration, with documented dependency counts.

- [ ] Run tests against shared signed fixtures, simulated clock/network/storage faults and FastAPI denied/active/revoked feature endpoints; contract expectations match Task 16.
- [ ] Implement the thin SDK/middleware, documented storage defaults, backend key setup and minimal retrofit example.
- [ ] Run `python -m pytest sdks/python/tests -q` with explicit configured Python; expected all passing. Build/import package in a clean local virtual environment.
- [ ] Record supported Python/crypto versions in DECISIONS and platform Help; commit with availability marked verified only after execution.

### Task 18: Kotlin, Swift and Dart mobile SDKs

**Files:** Create `sdks/kotlin/{build.gradle.kts,src/main/kotlin/keygate/KeyGateClient.kt,src/test/kotlin/keygate/ContractTest.kt,README.md}`, `sdks/swift/{Package.swift,Sources/KeyGate/KeyGateClient.swift,Tests/KeyGateTests/ContractTests.swift,README.md}`, `sdks/dart/{pubspec.yaml,lib/keygate.dart,test/contract_test.dart,README.md}`, `docs/help/{platform-android,platform-ios,platform-flutter}.md`, minimal examples beneath each SDK's `examples/`.

**Interfaces:** Same five SDK operations (redeem/activate/validate/deactivate/can) and shared fixtures; Kotlin Keystore-backed storage, Swift Keychain/CryptoKit, Dart vetted Ed25519 + secure-storage adapter. Freeze minimum target/runtime in each package after checking platform APIs.

- [ ] **Kotlin deliverable:** red fixture/offline/storage tests → native/vetted crypto + client/example → Gradle unit tests and Android instrumentation for reinstall/device storage → commit.
- [ ] **Swift deliverable:** red contract/Keychain tests → client/example → `swift test` plus simulator checks on macOS → commit. Windows cannot verify iOS; use a permitted CI macOS runner or label it unverified, never completed.
- [ ] **Dart deliverable:** red contract/storage/feature tests → client/example → `dart test` and Flutter integration test → commit.
- [ ] Verify each demo's build and locked/redeem/expiry/device recovery flows, update Help/platform availability separately. A missing runtime leaves its checkbox open; it does not cancel the rest of the plan.

### Task 19: C#/Unity/.NET, PHP and Go SDKs

**Files:** Create `sdks/dotnet/{KeyGate/KeyGate.csproj,KeyGate/Client.cs,KeyGate.Tests/ContractTests.cs,README.md}`, `sdks/php/{src/Client.php,tests/contract.php,README.md}`, `sdks/go/{go.mod,client.go,client_test.go,README.md}`, per-SDK `examples/`, `docs/help/{platform-dotnet,platform-php,platform-go,platform-rest}.md`.

**Interfaces:** Five SDK operations (redeem/activate/validate/deactivate/can); supported .NET target with vetted Ed25519 (e.g. NSec where required), Unity-compatible backend/crypto path explicitly tested; PHP sodium; Go standard crypto/HTTP. Plain REST/cURL is the portable fallback.

- [ ] **.NET deliverable:** shared fixture/error/offline tests → thin client/OS-vault adapter → `dotnet test` plus a Unity sample compile/play-mode check → commit. Do not claim all Unity targets support a native crypto library without testing.
- [ ] **PHP deliverable:** fixture/feature tests → sodium-based client → `php sdks/php/tests/contract.php` expected zero exit → commit; fail explicitly if sodium unavailable.
- [ ] **Go deliverable:** fixture/network tests → standard-library client → `go test ./...` in `sdks/go` → commit.
- [ ] Verify examples, platform storage advice and retrofit guides, update SDK matrix with actual tested targets and limitations; retain exact REST examples for others.

### Task 20: Analytics, activity, exports/imports and backup

**Files:** Modify admin overview; create `src/lib/licensing/{analytics,exports,imports,backup}.ts`, `src/app/admin/(panel)/activity/page.tsx`, `src/app/admin/(panel)/settings/{page.tsx,actions.ts}`, `scripts/licensing/{export,restore}.ts`, `docs/help/data-and-backups.md`; tests `licensing-{analytics,exports,imports,backup}.test.ts`.

**Interfaces:** `getLicenseMetrics(principal: Principal, scope: AppScope | null, range: {from: string; to: string}): Promise<LicenseMetrics>`; `previewCodeImport(principal: Principal, scope: AppScope, csv: string): Promise<ImportPreview>`; `exportData(principal: Principal, scope: AppScope | null, format: "csv" | "json"): AsyncIterable<Uint8Array>`; `restoreBackup(target: string, file: string, mode: "validate" | "apply"): Promise<RestoreReport>`. Define metric/preview/report schemas here and expose through admin commands.

- [ ] Tests: actual 30-day metrics from synthetic data, per-role redaction, archive/sandbox filters, deterministic UTC/timezone charts, empty/stale/unavailable states; index use and bounded query count on realistic synthetic volume.
- [ ] Tests: CSV formula escaping and multiline Unicode, supplied low-entropy code rejection, duplicates/partial failures/5 MiB/10,000 limits, streamed export scope, no raw secrets without fresh owner authentication. Print sheet is a permission-checked local view.
- [ ] Implement saved views, campaign redemption ratio, expiring soon, audit feed, timezone/date/theme/i18n scaffold and sanitized dashboard exports. Owner backup includes encrypted records and version metadata; signing/encryption keys are separate secrets needed for restore, never a public JSON download.
- [ ] Restore into isolated DB and compare licenses/devices/grants/history plus old tables, test interruption and validate-only mode; run green and commit. Never restore over production as a routine test.

### Task 21: Whole-system verification and owner-reviewed release

**Files:** Create `playwright.config.ts`, `e2e/license-admin-journey.spec.ts`, `netlify.toml`, `src/lib/uploads/netlify-storage.ts`, `docs/licensing/{release-checklist,rollback}.md`; modify storage driver/guard/routes/tests to add Netlify adapter; update PROGRESS and project checkpoint. Private backups/evidence remain ignored.

**Interfaces:** Netlify adapter implements existing `StorageAdapter`; hosting migration keeps current public URLs working. Release uses a separate environment/DB until owner authorization; no client/backend keys or private logs in screenshot artifacts.

- [ ] Run focused storage tests: durable upload/read/delete, content policy, unavailable driver, old Vercel Blob URL support and same-origin permissions. Never use ephemeral local disk in hosted functions. Preview auth/session/signing/ISR/model/image compatibility on exact installed Next.js.
- [ ] Run all unit/real-Postgres/SDK checks and browser scenarios: owner/helper/viewer, all old admin parity entries, light/dark/system, 320/390/768/1440px, keyboard/reduced-motion, loading/empty/error/denied states, complete Help-only onboarding and secure integration exercise. Confirm all advertised SDK targets have actual evidence.
- [ ] Run `npm run lint -- --ignore-pattern '.vercel/**'`, `npm run typecheck`, `npm test -- --config src/themes/professional/components/brand-logo/vitest.config.mts --maxWorkers=2`, `npm run build`, and `npx playwright test` against synthetic isolated data. Expected exit 0 for all; disclose any blocked runtime instead of claiming full completion. Inspect `git diff --check` and task-only `git diff --stat`.
- [ ] Prepare a private backup/restore rehearsal, migration diff/row comparison, asset/credit budget and callback/CORS/issuer transition manifest. Owner review is the final release gate; deploy/push only with new explicit “go live.” After release inspect actual URLs/role flows and record rollback target; do not drop tables during rollback or overwrite redemptions created after release.

### Task 22: Reusable packaging and open-source preparation

**Files:** Create module-focused `docs/licensing/{README,CONTRIBUTING,SECURITY}.md`, `examples/license-demo/`, synthetic `docs/screenshots/licensing/`, `.github/workflows/licensing-ci.yml`, `.github/ISSUE_TEMPLATE/{bug,feature}.yml`, safe `.env.example` updates and `scripts/licensing/package-module.ts`; root `INTEGRATION.md` already comes from Task 13. Use a module license file only after ownership/dependency review.

**Interfaces:** Package allowlist includes licensing module, SDKs, migrations/templates and synthetic demo only; excludes portfolio media, production backups, `.env*` secrets, credentials, customer data and unrelated private source. Public demo cannot issue live licenses or reveal owner credentials.

- [ ] Add CI lint/typecheck/unit/isolated integration/build plus platform SDK jobs; assess current private/public runner allowances before claiming no-cost macOS tests. Public CI cannot migrate the production database.
- [ ] Prepare README quick start, actual deploy option, architecture/locking explanation, limits, FAQ, screenshots and optional local GIF. Time the clean setup; use “5-minute” only if measured. Deploy button must use a verified deployable template, not an untested link.
- [ ] Test clean module/demo setup and a secret/private-file allowlist scan; review MIT applicability and third-party notices. Update requirement coverage and remaining limitations.
- [ ] Leave public repository creation, push and production publish pending explicit authorization for that release. Report admin URL/how to sign in/create code/Add to app/Help only after verified runtime deployment.

## Requirement coverage

| KeyGate/user requirement | Existing or planned owner |
| --- | --- |
| Permanent/day keys, secure RNG/HMAC/AES, Ed25519 and legacy APIs | Existing; regression 5–7. |
| Multi-app plans/features/locking/grace/CORS/branding | 2, 4, 9. |
| Minute/hour/day/month, trial, fixed expiry, stackable/bundles | 5–6. |
| Single/multi-use, prefixes, bulk 10,000, presets/campaigns | 5, 10. |
| Device/account binding, individual reset, transfer/pause/undo | 4, 6, 11. |
| Roles/helper permissions, strong auth/TOTP, scoped rotation/audit | 3–4, 8, 20. |
| Versioned redeem/validate/status/deactivate/admin API, OpenAPI | 7. |
| Easy grouped navigation, theme toggle, global search/Cmd+K, saved views | 8, 10, 20. |
| First-run setup, new product workflow, contextual Help/helper handbook | 9, 12. |
| New/existing-app guide, machine-readable docs, filled Codex prompt | 13. |
| Signed webhooks/retry/delivery logs | 14. |
| Branded hosted redeem and no-code widget | 9, 15. |
| JS/TS/browser/Node + Express/Hono/Next middleware | 16. |
| Python/FastAPI | 17. |
| Kotlin/Swift/Dart | 18. |
| C#/Unity/.NET/PHP/Go and cURL | 19. |
| Overview KPIs, campaigns, activity, expiry, timezone/i18n | 10, 20. |
| CSV/JSON/import/print/saved views/export/backup | 10, 20. |
| Old site editor/project themes/models/orders/checkouts | Preserve + guards/parity 8, 11, 21. |
| Free hosting/storage, tested release/rollback | 1, 14, 21. |
| Memory docs/CI/security/open-source/demo | 1, 21–22. |

## Self-review and handoff

- Spec coverage mapped above; every advertised feature has an owning task. SDKs/packaging are later phases, not dropped work.
- Shared types originate in contracts; old custom tokens remain distinct from new JWS. Server actions and admin endpoints use one command layer.
- Tests cover all five Review Focus items and explicitly use Postgres for concurrency, real browser for visual/usability, actual platform runtimes for SDK claims.
- Key differences from original prompt: reuse Next.js/Postgres, dependency-light crypto instead of unsafe dependency-free reimplementation, bounded free usage, hourly webhook retry runner, no implicit public repository/production authorization.
- Native sequential execution is the default to conserve context/cost. No need to choose technical implementation details before work can start.
- Planning verification is document coverage/path/whitespace review. Runtime tests and browser checks are future task gates; this plan does not claim they have run for these features.
