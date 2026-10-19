# Deploy later

Everything here is done locally and committed; nothing has been deployed from
this pass. Work through this list when you deploy with your own Vercel account.

## 1. Account and project

1. `vercel login` with the account that owns `rns-portfolio`.
2. `cd portfolio && vercel link --project rns-portfolio` (only if `.vercel/` is missing).
3. Keep two project settings as they are: **Vercel Authentication off**
   (otherwise visitors hit a login wall) and **Git fork protection off**
   (otherwise CLI deploys from this Git identity are refused).
4. The CLI deploy also needs the local Git author email to match a Vercel seat.

## 2. Environment variables

Set these in Vercel → Settings → Environment Variables (and locally in `.env.local`).
`vercel env pull .env.local` writes the Neon-managed ones for you.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled Neon connection; the only one the app reads |
| `AUTH_SECRET` | yes | `npx auth secret` |
| `ADMIN_EMAIL` | yes | Admin sign-in address |
| `ADMIN_PASSWORD_HASH` | yes | `npm run admin:hash -- "password"` |
| `NEXT_PUBLIC_SITE_URL` | recommended | Pins canonicals, sitemap, OG and checkout redirect origins |
| `PAYMENT_PROVIDER` | yes | `mock` (default), `polar`, or `lemonsqueezy` |
| `MOCK_PAYMENT_SECRET` | mock only | Any random string; signs simulated webhooks |
| `POLAR_ACCESS_TOKEN` | polar | Polar dashboard → Settings → API |
| `POLAR_WEBHOOK_SECRET` | polar | Endpoint secret, `whsec_…` |
| `POLAR_SERVER` | polar | `sandbox` while testing, otherwise production |
| `LEMONSQUEEZY_API_KEY` | lemonsqueezy | Settings → API |
| `LEMONSQUEEZY_STORE_ID` | lemonsqueezy | Numeric store id |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | lemonsqueezy | Signing secret for the webhook |
| `BLOB_READ_WRITE_TOKEN` | for uploads | Vercel → Storage → Blob; without it uploads write to local disk, which production cannot do |

Never commit `.env.local` or `.admin-credentials.txt`.

### Blob storage

1. Create a Blob store in the Vercel project (Storage → Blob) and connect it;
   `BLOB_READ_WRITE_TOKEN` is added to the project automatically.
2. Redeploy after adding it — `getStorage()` picks the driver from the token at
   request time.
3. Admin uploads then go browser → Blob directly (the token route at
   `/api/admin/upload/blob` only signs after checking the admin session, the
   extension, the size and the first bytes). Uploaded URLs are absolute Blob
   URLs and need no rewrite.

## 3. Database

The Neon database already exists. On a new database:

```bash
vercel env pull .env.local
npm run db:migrate     # 0000 projects/users, 0001 purchases + webhook ledger, 0002 audit log, 0003 model stage
npm run db:seed        # optional demo projects
```

New tables in Phase 2: `purchases`, `processed_webhook_events`, the
`purchase_status` enum, and `projects.delivery_note` (migration `0001`).
Migration `0002` adds `purchase_audit_log` and the `purchase_audit_action` enum
for manual grants and revokes. Migration `0003` adds the 3D stage columns:
`model_url`, `lighting`, `model_scale` and the three `model_offset_*` columns,
all nullable or defaulted. Every migration is additive; nothing was dropped or
renamed, so existing production rows are untouched.

## 4. Webhook endpoints

Register these after the first deployment. Both accept POST, verify the raw
body signature, and are safe to deliver twice.

- Polar: `https://<your-domain>/api/webhooks/payments/polar`
  Events: `order.paid`, `order.refunded` (add `order.payment_failed` if you want failed attempts recorded).
- Lemon Squeezy: `https://<your-domain>/api/webhooks/payments/lemonsqueezy`
  Events: `order_created`, `order_refunded` (add `order_payment_failed` if wanted).
- Mock: `https://<your-domain>/api/webhooks/payments/mock` — local/demo only.

## 5. Provider setup

### Polar
1. Create a product per paid project; copy its product id into the project's
   **Provider product ID** field in the admin.
2. Create an access token and set `POLAR_ACCESS_TOKEN`; start with
   `POLAR_SERVER=sandbox`.
3. Create a webhook endpoint for the URL above; copy the `whsec_…` secret into
   `POLAR_WEBHOOK_SECRET`.
4. Buy one product in sandbox, then confirm the order's `metadata.reference`
   appears in the delivery. The adapter reads `data.id`, `data.total_amount`,
   `data.currency`, `data.customer.email` and `data.metadata`; Polar does not
   publish a full payload schema, so check one real delivery before trusting
   a production switch.

### Lemon Squeezy
1. Create a store and a product variant per paid project; put the **variant id**
   in **Provider product ID**.
2. Set `LEMONSQUEEZY_STORE_ID` and `LEMONSQUEEZY_API_KEY` (test-mode keys work
   end to end with test-mode webhooks).
3. Create a webhook for the URL above and set `LEMONSQUEEZY_WEBHOOK_SECRET`.
4. Complete a test-mode order with a test card.

### Switching
`PAYMENT_PROVIDER=polar` or `lemonsqueezy`, then redeploy. The mock provider
stays available for local work; existing purchases keep their own provider
column, so history stays readable after a switch.

## 6. After deploying

1. `/` and every `/projects/[slug]` return 200 and are served from cache.
2. Guest `/admin` → 307 to `/admin/login`; visitor `/account/purchases` → 307 to
   `/account/login`.
3. Sign up, buy with a test card, and confirm the delivery note and live URL
   appear only after the webhook arrives (not on the success redirect).
4. Replay the same webhook from the provider dashboard: response 200, no second
   grant, one row in `processed_webhook_events`.
5. Refund the order: the purchase flips to `refunded` and the buyer loses access.
6. View source on the paid project page while signed out: no live URL and no
   delivery note anywhere in the HTML.
7. Admin Overview shows the real signup count and revenue.
8. `/admin/orders` lists the order with buyer, project, provider, status and
   amount. Grant a second test account access, confirm it unlocks on the project
   page, then revoke it and confirm the page locks again — both actions should
   appear in the audit trail with your admin email.
9. Upload an image and a `.glb` from the admin, set the project theme to Anime
   3D, save, and open the live project: the model loads, orbit and scroll work,
   and the cover shows instead of WebGL under reduced motion. The uploaded URL
   should be a `blob.vercel-storage.com` address, and the browser network tab
   should show the upload going straight to Blob, not through a function.

## 7. Not included

- No transactional email: no verification, receipts or password reset. Accounts
  work immediately after signup.
- Local uploads are not shared between instances; production needs Blob.
- The 3D model is public like the rest of the page, including for paid projects.
- Rate limiting is in-memory per server instance, not a global limiter.
- Comped (`manual`) orders are excluded from revenue and paid-order counts by
  design; they are still listed and audited.
