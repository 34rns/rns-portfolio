# Phase 1 handoff

## Shipped

- Next.js 16 App Router site, TypeScript, Tailwind v4.
- Landing page and project pages statically generated with 1-hour ISR plus
  on-demand revalidation on every admin save.
- Neon Postgres (Vercel Marketplace, Singapore) with Drizzle schema, migration,
  and four seeded projects from real repositories.
- Auth.js credentials admin (`/admin`), edge proxy guard, sign-in/out.
- Admin: dashboard counts, project list, create/edit/delete, publish toggle,
  featured/unlisted placement, order controls, markdown editor with preview,
  theme picker with token preview, accent override, draft preview in a new tab,
  paid-project fields (checkout intentionally hidden).
- Professional theme: editorial landing, hover project index, magnetic contact,
  case-study layout, typographic cover fallback, OG images, sitemap, robots.
- Unit tests for the auth guard, revalidation calls, slug/order logic, form
  validation, and theme registry.

## Verified

- `npm run build` clean; `npm test` 27 passing; `npm run typecheck` clean.
- Guest `/admin` → 307 to login; credentials login → 200; wrong password rejected.
- Create → publish → live landing → delete, each reflected without a redeploy.
- Unlisted project reachable by URL, absent from the sitemap.
- No horizontal overflow at 1440px or 390px; mobile covers render.
- Production serves `X-Vercel-Cache: HIT` on `/` and project pages.
- Lighthouse mobile (two runs): performance 91–92, accessibility 100,
  best practices 100, SEO 100. LCP 3.0–3.2s, CLS 0.

## Local pass (undeployed)

- Mobile header: the small wordmark is hidden below `md`, so the page opens on
the large masthead instead of printing RNS twice. Desktop keeps the small mark.
- Deploy steps are documented in the README ("Deploying later"). Nothing was
committed to the remote or deployed from this pass.

## Only you can do

- Keep the admin password from this chat (stored locally in
  `.admin-credentials.txt`, git-ignored). Rotate with
  `npm run admin:hash -- "new-password"` and update the Vercel variable.
- Deploy when you are on the Vercel account that owns the project:
  `vercel --prod` from `portfolio/`. The header fix and any later local commits
  go live then. See the README section for the variables involved.
- Add a custom domain in Vercel if you want one, then set
  `NEXT_PUBLIC_SITE_URL` so sitemap and canonical URLs use it.
- Create the Blob store before Phase 3 uploads.
- Choose the payment provider (Polar or Lemon Squeezy) before Phase 2 checkout.

## Deferred

- Payments, visitor signup, orders, webhooks (Phase 2).
- Blob uploads, 3D model fields, Anime 3D theme (Phase 3).
- Themes 2–12 (Phase 4).
- Lighthouse-driven perf pass, full a11y audit, final QA (Phase 5).
