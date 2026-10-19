# RNS — portfolio and project showcase

A statically generated portfolio where every project page renders through its
own theme. Phases 1–2 ship the platform, the admin panel, the Professional
theme, visitor accounts and provider-agnostic payments; Phase 3 adds uploaded
3D models and the Anime 3D theme.

Live: https://rns-portfolio-teal.vercel.app

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Motion (Framer Motion) for interaction; three.js via React Three Fiber for
  the 3D stage, loaded only when a theme renders one and the device can afford it
- Uploads through one adapter: local disk in development, Vercel Blob in production
- Neon Postgres via the Vercel Marketplace, Drizzle ORM + `neon-http`
- Auth.js v5: an admin credential and separate visitor accounts
- Payments behind one interface: mock (local), Polar, Lemon Squeezy
- Vitest for the critical-path unit tests
- Vercel for hosting, SSG/ISR for every public page

## How it stays fast

- `/` and `/projects/[slug]` are prerendered at build time and served from the
  CDN. Visitors never wake the database.
- Admin writes call `revalidatePath` through `src/lib/projects/revalidate.ts`,
  so a save is live on the next request without a redeploy.
- The database is touched at build/revalidate time and by the admin panel only.
- Neon cold starts are covered by a three-attempt retry in `src/lib/db/queries.ts`
  and the admin screens are dynamic with a fast shell.

## Architecture

```
src/app/(site)            public, statically generated pages
src/app/admin             auth-guarded editor, dashboard and draft preview
src/app/(site)/account    visitor signup, login and purchases
src/app/api               auth, checkout, entitlement, payment webhooks
src/lib/db                schema, client, retrying queries
src/lib/projects          slug, order, validation, revalidation, 3D model data
src/lib/auth              guard, rate limit, password hashing, sessions
src/lib/payments          provider adapters, webhook engine, entitlements
src/lib/uploads           upload policy + sniffing, storage adapters
src/components/model-stage lazy three.js viewer with a poster fallback
src/themes                registry + one folder per theme
  professional/           landing, project page, tokens, preview, motion
  anime/                  manga project page, cel-shaded stage, scoped CSS
scripts/                  migrate, seed, password hash
tests/                    auth guard, revalidation, validation, registry, uploads
```

### Adding a theme

1. Copy `src/themes/professional` to `src/themes/<slug>`.
2. Set `tokens`, `ProjectPage`, `Preview` and `motion` in `theme.tsx`.
3. Register it in `src/themes/registry.ts`.

The admin theme picker, project renderer and preview all pick it up
automatically.

### The 3D stage

`ProjectView.model` (`url`, `lighting`, `scale`, `offset`) is filled from the
project row, so a theme can render `<ModelStage />` without knowing anything
about storage. Every model is centered and auto-fitted to about 70% of the stage
height, whatever units its exporter used; the admin scale and offset multiply on
top of that fit. The stage loads three.js only when it nears the viewport, keeps
rendering paused off-screen, and shows the cover plus a one-click opt-in for
visitors with reduced motion or a low-power device. Projects without a model
fall back to a built-in scene, so a theme can ship before any asset exists.

Lighting presets live in `src/lib/projects/model.ts` as plain data; the admin
picker and the viewer share them.

## Local development

```bash
npm install
vercel link --project rns-portfolio
vercel env pull .env.local          # DATABASE_URL + Neon vars
npm run db:migrate
npm run db:seed                     # four real projects, rerunnable; RISE uses Anime 3D
npm run dev
```

Add the auth variables to `.env.local`:

```bash
AUTH_SECRET=...                     # node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=...             # npm run admin:hash -- "your-password"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYMENT_PROVIDER=mock               # mock | polar | lemonsqueezy
MOCK_PAYMENT_SECRET=local-mock-secret
# Optional: uploads default to ./uploads and need no configuration locally
# BLOB_READ_WRITE_TOKEN=...         # set to use Vercel Blob instead
```

Log in at `/admin/login`. `.env.example` documents every variable.

## Payments and accounts

- Providers implement `createCheckout`, `verifyWebhook`, `parseEvent` and an
  optional `getCustomerPortal`; `PAYMENT_PROVIDER` chooses the adapter.
- `mock` is the default with no keys. A paid project's Buy button opens a local
  checkout page whose buttons post HMAC-signed events to
  `/api/webhooks/payments/mock`, so the grant runs through the real handler.
- Polar and Lemon Squeezy adapters are wired; add the keys from
  `.env.example` and switch `PAYMENT_PROVIDER`.
- Visitors sign up at `/account/signup`; purchases are listed at
  `/account/purchases`. Admin sessions and visitor sessions share Auth.js but
  carry different roles, and `/admin` requires the admin role.
- Webhooks are verified against the raw body, deduplicated in
  `processed_webhook_events`, and only a `paid` purchase unlocks the live URL
  and delivery note. Project pages stay static; the panel fetches entitlement
  client-side.

## Deploying later

The project is already linked to Vercel, but the local checkout is the source of
truth: nothing here is auto-deployed while you work. When you are signed in to
the Vercel account that owns `rns-portfolio`:

```bash
vercel login                # the account that owns the project
vercel link --project rns-portfolio   # only if .vercel/ is missing
vercel --prod               # build + deploy production
```

Variables production needs (values live in Vercel → Settings → Environment
Variables, and locally in `.env.local`):

```
DATABASE_URL          # pooled Neon connection, the only one the app reads
AUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
NEXT_PUBLIC_SITE_URL  # optional: pins canonicals, sitemap and OG URLs
```

The Neon integration also provides `DATABASE_URL_UNPOOLED` (direct connection);
without `NEXT_PUBLIC_SITE_URL` the app falls back to
`VERCEL_PROJECT_PRODUCTION_URL`, so canonicals still point at the deployment.

Two project settings are already applied and should stay that way: Vercel
Authentication is off (otherwise visitors hit a login wall) and the Git fork
protection is off (otherwise pushes from this local Git identity are refused).
A CLI deploy also requires the Git author email to match a Vercel seat.

Nothing is pushed automatically. `git push` only publishes the repo; Vercel
deploys production from `vercel --prod` or from a merged pull request.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (SSG + ISR) |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a migration from the schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Upsert the seed projects |
| `npm run admin:hash` | Print a scrypt hash for the admin password |

## Operations

- **Publish a project:** admin → project → status Published. Landing updates
  immediately; unlisted projects stay reachable by direct link and are excluded
  from the sitemap.
- **Reorder:** admin → Projects → Move up/down. Order is stored in `sortOrder`.
- **Uploads:** cover, gallery and 3D model fields accept a URL, a path inside
  `/public`, or a direct upload. The browser and the server both sniff the
  bytes; images cap at 8 MB, `.glb`/`.gltf` at 40 MB, and glTF files must embed
  their buffers and textures. Without a Blob token files land in `./uploads`
  (gitignored) and are served by `/api/uploads`.
- **3D models:** open a project, choose a theme that renders the stage (Anime
  3D), then upload a `.glb`, pick a lighting preset and tune scale/offset. The
  draft preview renders the real stage before publishing.
- **Payments:** set the project's paid toggle, price, currency and provider
  product id, plus a delivery note for buyers. Checkout is live once
  `PAYMENT_PROVIDER` points at a configured provider.

## Phases

- Phase 1 — platform, auth, admin CRUD, Professional theme, deploy. **Done.**
- Local pass — mobile header de-duplicated, deploy steps documented. **Done.**
- Phase 2 — mock/Polar/Lemon Squeezy payments, visitor accounts, paid project
  flow, webhook idempotency, admin revenue. **Done locally, not deployed.**
- Phase 3 — 3D model upload, shared model stage, Anime 3D theme. **Done
  locally, not deployed.** See [phase-3-handoff.md](docs/phase-3-handoff.md).
- Phase 4 — remaining themes, one brief at a time.
- Phase 5 — performance, accessibility, SEO and QA pass.
