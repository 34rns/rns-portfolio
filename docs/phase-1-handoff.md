# Handoff — Phases 1–2

Both phases are complete and verified locally. Nothing was deployed or pushed
from this pass; [deploy-later.md](./deploy-later.md) is the checklist for the
Vercel account.

## Phase 1 — platform and theme

- Next.js 16 App Router, TypeScript, Tailwind v4; landing and project pages
  prerendered with 1-hour ISR plus on-demand revalidation on every admin save.
- Neon Postgres via the Vercel Marketplace, Drizzle schema and migrations.
- Auth.js credentials admin, edge proxy guard, admin CRUD, ordering, publish and
  placement toggles, markdown editor with preview, theme picker, accent override.
- Professional theme: editorial landing, hover project index, magnetic contact,
  case-study layout, typographic cover fallback, OG images, sitemap, robots.
- Phase 1 measurements: Lighthouse mobile 91–92 performance, 100 accessibility,
  100 best practices, 100 SEO; CLS 0.

## Phase 2 — payments, accounts, paid projects

**Payments seam.** `PaymentProvider` with `createCheckout`, `verifyWebhook`,
`parseEvent` and optional `getCustomerPortal`. Three adapters selected by
`PAYMENT_PROVIDER`:

- `mock` (default): no keys; a local checkout page posts HMAC-signed success and
  failure events to the real webhook route.
- `polar`: `/v1/checkouts/` with metadata, Standard Webhooks signature
  verification (`webhook-id`, `webhook-timestamp`, `webhook-signature`, ±5 min),
  `order.paid` / `order.refunded`.
- `lemonsqueezy`: JSON:API checkout with store, variant, prefilled email and
  custom data; hex HMAC `X-Signature`; `order_created` / `order_refunded`.

**Webhook engine.** Signature first, then normalisation, then metadata
validation (422 so the provider retries), then the insert into
`processed_webhook_events` that makes replays no-ops, then the grant. Refunds
revoke access; a refunded order is never resurrected by a late `paid` event.

**Data.** `purchases` (reference, user, project, provider, provider order id,
status, amount, currency, timestamps) and `processed_webhook_events` with unique
`(provider, event_id)`, plus `projects.delivery_note`. Migration `0001` is
additive and applied to the shared database.

**Visitor accounts.** Same Auth.js instance with separate `admin` and `visitor`
providers; visitors live in `users` with scrypt hashes and `role = customer`.
The guard now requires `role === "admin"` for `/admin` and a session for
`/account`, redirecting each area to its own sign-in page. Signup and login are
zod-validated and rate-limited (10 attempts / 10 min per instance).

**Paid flow.** Project pages stay static. For paid projects the route strips
`liveUrl` before rendering, and the delivery note is never part of the view
model. A client `ProjectAccess` panel fetches `/api/entitlement`, showing the
price and a signup or buy action, then the live URL and delivery note once the
webhook has granted access. `/account/purchases` lists every attempt with
status, amount and date. Admin Overview shows real signups and revenue, grouped
by currency.

## Verified locally

- `npm run lint`, `npm run typecheck`, `npm test` (60 tests across 14 files) and
  `npm run build` all clean; project pages still build as `●` SSG.
- Mock journey in the browser: guest sees the price and "Create an account to
  buy"; signup signs the visitor in and returns to the project; buy opens the
  mock checkout; simulated failure leaves access locked; a second purchase with
  simulated success unlocks the live URL and delivery note and appears as Paid
  in `/account/purchases`.
- Guest HTML for a paid project contains neither the live URL nor the delivery
  note, before and after a purchase exists.
- Replaying a signed webhook against the real database: first delivery applied,
  second returned `duplicate: true`, purchase count unchanged.
- Redirects: guest `/admin` → `/admin/login`; guest `/account/purchases` →
  `/account/login?next=…`; signed-in customer `/admin` → `/admin/login`;
  signed-in customer `/account/purchases` → 200.
- Admin sign-in was exercised on a throwaway dev instance with a temporary
  admin env: 302 on success, session role `admin`, dashboard 200.
- Webhook signature tests cover valid, tampered, stale-timestamp and legacy
  secret forms; idempotency, refund revocation, entitlement hiding, rate-limit
  windows, signup validation, checkout refusals and the full mock checkout are
  covered by unit tests.
- Temporary demo project and test account were deleted after the run; the
  database is back to the four seeded projects and no customer accounts.

## Not verified / limits

- Polar's public docs do not pin down every webhook payload path; the adapter
  reads the documented fields defensively but has not seen a real delivery.
- No provider checkout has been run against Polar or Lemon Squeezy (no keys).
- Admin sign-in was checked with temporary credentials, not your real password.
- Rate limiting is per instance, not global.
- No email: no verification, receipts or password reset.

## Deferred

- Phase 3 — Blob uploads, 3D model fields, Anime 3D theme.
- Phase 4 — remaining themes.
- Phase 5 — performance, accessibility, SEO and QA pass.
- Transactional email and password reset.
