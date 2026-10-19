# RNS — portfolio and project showcase

A statically generated portfolio where every project page renders through its
own theme. Phase 1 ships the platform, the admin panel, and the Professional
theme.

Live: https://rns-portfolio.vercel.app

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Motion (Framer Motion) for interaction; no 3D bundle yet
- Neon Postgres via the Vercel Marketplace, Drizzle ORM + `neon-http`
- Auth.js v5 credentials for the single admin account
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
src/app/api/auth          Auth.js handlers
src/lib/db                schema, client, retrying queries
src/lib/projects          slug, order, validation, revalidation
src/lib/auth              edge-safe guard config, password hashing
src/themes                registry + one folder per theme
  professional/           landing, project page, tokens, preview, motion
scripts/                  migrate, seed, password hash
tests/                    auth guard, revalidation, validation, registry
```

### Adding a theme

1. Copy `src/themes/professional` to `src/themes/<slug>`.
2. Set `tokens`, `ProjectPage`, `Preview` and `motion` in `theme.tsx`.
3. Register it in `src/themes/registry.ts`.

The admin theme picker, project renderer and preview all pick it up
automatically.

## Local development

```bash
npm install
vercel link --project rns-portfolio
vercel env pull .env.local          # DATABASE_URL + Neon vars
npm run db:migrate
npm run db:seed                     # four real projects, rerunnable
npm run dev
```

Add the auth variables to `.env.local`:

```bash
AUTH_SECRET=...                     # node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=...             # npm run admin:hash -- "your-password"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Log in at `/admin/login`. `.env.example` documents every variable.

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
- **Images:** cover and gallery accept a URL or a path inside `/public`.
  Vercel Blob uploads arrive in Phase 2/3.
- **Payments:** fields and the provider interface exist; checkout is hidden
  until Phase 2. No payment SDK is installed.

## Phases

- Phase 1 — platform, auth, admin CRUD, Professional theme, deploy. **Done.**
- Phase 2 — payments, visitor signup, paid project flow.
- Phase 3 — 3D model upload and the Anime 3D theme.
- Phase 4 — remaining themes, one brief at a time.
- Phase 5 — performance, accessibility, SEO and QA pass.
