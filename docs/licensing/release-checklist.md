# Release gate

The local implementation is reviewable; production licensing writes and public publication require a new explicit **go live** under this repository's AGENTS.md.

- Keep a private database snapshot and separately preserve existing encryption/signing keys. Test restore only into an empty isolated database. Do not regenerate keys against existing records.
- Select the confirmed free hosting plan after account/quota and actual CPU/storage checks. Keep the current host if the free candidate fails. Never weaken password hashing or token verification to fit a quota.
- Apply only additive migrations with a backup and recorded legacy row comparison. Bootstrap the existing owner before enabling `LICENSE_STAFF_ENABLED=true`. Never enable a demo account in production.
- Include migration 0010, which adds the recovery token-revision floor. Test old-token rejection after credential recovery and ticket cancellation. Browser fixtures now apply pending migrations only to the validated synthetic demo database.
- Preserve the canonical origin/issuer initially. For a host move, map Auth.js callbacks, app allowed origins, checkout/webhook URLs, public asset URLs and previous signing keys. Old tokens need their original issuer during the transition; do not silently change it.
- Configure durable storage; local disk is development/self-host only. Verify upload/read/delete and retained model references. R2 activation is a separate billing-resource decision.
- Set a dedicated 32+ character `LICENSE_JOBS_SECRET`. Enable a verified hourly runner for `/api/internal/license-jobs`; never use a staff password or API app key for this job. Verify expiry, retry and last job status. Run it manually on your own machine if no hosted schedule is provisioned.
- On Netlify, the existing `license-jobs` function declares an hourly schedule. Configure the dedicated job secret and verified site origin, inspect the deployed function schedule, and verify its database job record. It also removes expired pending uploads.
- Run `npm run lint`, `npm run typecheck`, `npm test -- --config src/themes/professional/components/brand-logo/vitest.config.mts --maxWorkers=2`, `npm run licensing:build`, and `npm run test:e2e` against synthetic isolated data.
- Run each advertised platform's contract suite; mark Android/Flutter/Unity/iOS device checks separately. Use the SDK matrix rather than claiming all targets passed.
- Browser-check owner/helper/viewer, Light/Dark/System, keyboard, reduced motion, 320/390/768/1440 widths, legacy theme/model/commerce access, Help-only onboarding and the complete redemption/device/expiry flow.
- After deployment, verify actual URLs, owner sign-in, helper denials, issuer/signature, upload storage and scheduled jobs. Update the checkpoint and rollback target. Never upload private test credentials or browser logs.
