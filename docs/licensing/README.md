# Premium apps with RNS Control

This repository is the central license service. Reuse it for all your apps; each product has its own app ID, Free/Pro plans, feature keys and Sandbox/Live access. There is no paid licensing subscription. Payment processors are optional and may charge transaction fees.

Start the isolated local workspace with `npm ci` then `npm run licensing:demo`. Open http://localhost:3100/admin. The demo uses synthetic accounts shown by the terminal and a separate local PostgreSQL database; it never loads customer data. Development dependencies are needed for the embedded database. Do not expose this demo server publicly.

1. Open **Apps & plans → New app**, name the app and define Free/Pro features.
2. Stay in **Sandbox**, generate a timed code, and keep it securely.
3. Open the product's **Add to app** tab. Pick your platform and New/Existing app, then copy the filled Codex prompt into that app's chat.
4. Implement the access adapter at the actual premium operations and backend routes. Verify the on-screen integration checklist before enabling Live.
5. Invite helpers through **Team & permissions** with their own app assignments. **Help & onboarding** explains setup, integration and customer support.

The public contract is [INTEGRATION.md](../../INTEGRATION.md), `/integration.md`, `/openapi.json` and `/.well-known/keygate.json`. Legacy `/api/license/*`, project themes, site editor, model library, orders and checkouts remain available to owners.

See [platform evidence](sdk-matrix.md), [hosting](hosting-preflight.md), [release checklist](release-checklist.md), [rollback](rollback.md), [security](SECURITY.md) and [contribution guide](CONTRIBUTING.md). The reusable package is an **integration kit** using this central service; it does not pretend to be a separate, tested standalone backend.
