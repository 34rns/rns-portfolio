# JavaScript / TypeScript

Uses native Web Crypto Ed25519 and fetch; no runtime dependencies. Node 22+ and browsers with Ed25519 Web Crypto are required. Unavailable crypto/storage fails locked.

```ts
import { createBrowserClient } from "./dist/browser.js";
const access = createBrowserClient({appId:"YOUR_APP_UUID",environment:"sandbox",apiUrl:"https://YOUR_LICENSE_ORIGIN/v1"});
await access.redeem(code);
if (await access.can("export_pdf")) { /* perform the Pro operation */ }
await access.activate(activationCredential); // another installation
await access.validate();
await access.deactivate();
```

Use a secure storage adapter for Node/desktop. Browser storage is exposed to same-origin scripts, so valuable APIs/downloads require backend enforcement. Never put backend keys in browser code. Check `getAccess()` or call `validate()` at startup/periodically; a network failure retains only already-verified access until its signed offline deadline. Explicit online rejection clears access. `can()` checks cached signed feature expiry and does not call the network.

Build from the repository: `npx tsc -p sdks/javascript/tsconfig.json`. Actual Node crypto/storage/offline behavior is covered by `tests/sdk-javascript.test.ts`; browser runtime is verified separately by the synthetic integration exercise. No package has been published.
