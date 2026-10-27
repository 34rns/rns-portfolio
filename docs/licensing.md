# Licensing

How a paid app (or extension) unlocks "Pro", how the API answers it, and what to
do when something goes wrong. The admin side of taking a payment is in
[manual-payments.md](./manual-payments.md).

## The shape of it

```
buyer fills Request Pro  →  Admin > Orders  →  you confirm payment
        ↓                                            ↓
  /order/<token> page  ←── send message with key ──  Generate license key
        ↓                                            ↓
  app calls /api/license/activate with the key  →  token + plan
        ↓
  app verifies the token offline for 7 days at a time with the public key
```

Three pieces:

- **A license key** — `XXXXX-XXXXX-XXXXX-XXXXX`, 20 characters from a 32-symbol
  alphabet that omits `I`, `O`, `0` and `1`. Stored as an HMAC lookup hash plus
  an AES-256-GCM ciphertext; the plain key is never stored, logged or indexed.
- **A license token** — a short-lived Ed25519 JWT-like string the app caches.
  It is what makes offline use possible.
- **The public key** — served at `/api/license/public-key`, so an app can check
  a cached token without asking us.

## API reference

All three endpoints send `cache-control: no-store`, answer JSON, and are called
with `POST` unless noted. A refusal is a `200` with `valid: false`: the HTTP
status is reserved for transport and policy problems (`400` bad body, `403`
origin not allowed, `429` rate limited, `503` secrets not configured), so an app
can tell "no" apart from "try again".

### `POST /api/license/activate`

```jsonc
// request
{ "key": "ABCDE-FGHJK-LMNPQ-RSTUV", "projectSlug": "my-app",
  "deviceId": "8f2c…", "deviceName": "Ada's MacBook" }
```

```jsonc
// 200 — accepted
{ "valid": true, "plan": "pro", "expiresAt": null,
  "token": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImtpZCI6…",
  "tokenExpiresAt": "2026-10-27T20:00:00.000Z",
  "graceUntil": "2026-11-03T20:00:00.000Z" }
```

Binds the device (up to the key's device limit), starts the expiry clock on the
first activation, and returns a freshly signed token. Calling it again on the
same `deviceId` is a no-op that refreshes `lastSeen`.

```jsonc
// 200 — refused
{ "valid": false, "plan": null, "expiresAt": null,
  "reason": "device_limit", "message": "This key has reached its device limit." }
```

`reason` is one of `invalid_key`, `invalid_token`, `token_expired`, `revoked`,
`expired`, `device_limit`, `not_activated`, `wrong_project`.

### `POST /api/license/verify`

Either a key or a cached token, plus the same `projectSlug`:

```jsonc
{ "key": "…", "projectSlug": "my-app", "deviceId": "8f2c…" }
{ "token": "eyJ…", "projectSlug": "my-app", "deviceId": "8f2c…" }
```

Returns the same shape as `activate` and **refreshes the token**, so a daily
check keeps the app online indefinitely. Verify by key requires the device to
have activated already (`not_activated` otherwise). Verify by token re-checks
revocation and expiry at request time — there is no cron and no cached status.

### `GET /api/license/public-key`

```jsonc
{ "algorithm": "Ed25519",
  "keys": [ { "kid": "K7f2c1Qa0Z", "derBase64": "MCowBQYDK2VwAyEA…",
              "pem": "-----BEGIN PUBLIC KEY-----\n…" } ],
  "tokenTtlSeconds": 43200 }
```

During a rotation both the current and the previous key are listed; pick the one
whose `kid` matches the token header. Cache it for a few minutes (`max-age=300`).

### CORS

Only origins listed in `ALLOWED_ORIGINS` (comma separated, exact match) may call
the API from a browser. A request with **no** `Origin` header — a desktop or
native app — is allowed, which is why Electron and CLI clients need no
configuration. Anchors, not patterns: `https://app.example.com` and
`chrome-extension://abcdefghijklmnop` are fine, `*` never is.

### Rate limits

| Limiter | Limit | Window |
| --- | --- | --- |
| per IP | 60 requests | 1 minute |
| per key | 30 requests | 1 minute |
| failed attempts, per IP or per key | 10 | 10 minutes → **15 minute lockout** |

Exceeding a cap answers `429` with `retry-after`. A lockout is not a cap: that
identifier is refused outright for fifteen minutes, even with a valid key.
Counters are per serverless instance, which blunts bursts and credential
stuffing rather than promising a global cap.

## Offline grace and the token clock

Three timestamps matter, and an app must respect the earliest:

| Field | Meaning |
| --- | --- |
| `tokenExpiresAt` | End of the token itself — 12 hours by default (`LICENSE_TOKEN_TTL_HOURS`). |
| `graceUntil` | `tokenExpiresAt` + `LICENSE_GRACE_DAYS` (default 7). The last moment a cached token is honoured. |
| `expiresAt` | End of the licence for a time-limited key; `null` for a permanent one. Never negotiate past this. |

So: while `now < tokenExpiresAt` the app is online-verified. Between
`tokenExpiresAt` and `graceUntil` it keeps working offline, and should retry in
the background. Past `graceUntil`, or past `expiresAt`, it must lock Pro.

## Chrome extension

```js
// lib/license.js — works in a service worker (MV3) with chrome.storage
const API = "https://your-domain.example";
const PROJECT = "my-app";

async function deviceId() {
  const { deviceId } = await chrome.storage.local.get("deviceId");
  if (deviceId) return deviceId;
  const fresh = crypto.randomUUID();
  await chrome.storage.local.set({ deviceId: fresh });
  return fresh;
}

async function call(path, body) {
  const response = await fetch(`${API}/api/license/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`license http ${response.status}`);
  return response.json();
}

/** Cached until graceUntil, refreshed once a day. */
export async function checkLicense({ force = false } = {}) {
  const { license } = await chrome.storage.local.get("license");
  const stored = license ?? {};
  const now = Date.now();

  if (!force && stored.graceUntil && now < Date.parse(stored.graceUntil)) {
    // Still inside grace: keep working, refresh in the background once a day.
    if (!stored.checkedAt || now - stored.checkedAt > 24 * 60 * 60 * 1000) {
      refresh().catch(() => {});
    }
    return { pro: true, plan: stored.plan, expiresAt: stored.expiresAt };
  }

  return refresh();
}

async function refresh() {
  const { license } = await chrome.storage.local.get("license");
  const id = await deviceId();

  const result = license?.token
    ? await call("verify", { token: license.token, projectSlug: PROJECT, deviceId: id })
    : await call("verify", { key: license?.key, projectSlug: PROJECT, deviceId: id });

  const next = { ...license, ...result, checkedAt: Date.now() };
  await chrome.storage.local.set({ license: next });
  return { pro: Boolean(result.valid), plan: result.plan, expiresAt: result.expiresAt };
}

/** Run once when the key is pasted in. */
export async function activate(key) {
  const id = await deviceId();
  const result = await call("activate", { key, projectSlug: PROJECT, deviceId: id });
  if (!result.valid) return result; // show result.message
  await chrome.storage.local.set({
    license: { key, ...result, checkedAt: Date.now() },
  });
  return result;
}
```

`chrome.storage.local` is not synced between machines, which is what you want: a
device id that travels would burn the device limit from one laptop. Call
`checkLicense()` in `onStartup` and in a daily `chrome.alarms` handler, and call
`checkLicense({ force: true })` when the user opens the Pro screen.

## Web app

```ts
const API = "https://your-domain.example";
const PROJECT = "my-app";

const deviceKey = "license.deviceId";
const tokenKey = "license.token";

function deviceId(): string {
  let id = localStorage.getItem(deviceKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(deviceKey, id);
  }
  return id;
}

export async function activate(key: string) {
  const response = await fetch(`${API}/api/license/activate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, projectSlug: PROJECT, deviceId: deviceId() }),
  });
  const result = await response.json();
  if (result.valid) {
    localStorage.setItem(tokenKey, JSON.stringify(result));
    sessionStorage.setItem("license.key", key); // do not persist the key
  }
  return result;
}

export async function entitlement(force = false) {
  const cached = JSON.parse(localStorage.getItem(tokenKey) ?? "null");
  const now = Date.now();

  if (!force && cached && now < Date.parse(cached.graceUntil ?? cached.tokenExpiresAt)) {
    return { pro: true, expiresAt: cached.expiresAt };
  }

  if (!cached) return { pro: false };

  const response = await fetch(`${API}/api/license/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: cached.token, projectSlug: PROJECT, deviceId: deviceId() }),
  });
  const result = await response.json();
  if (result.valid) localStorage.setItem(tokenKey, JSON.stringify(result));
  return { pro: Boolean(result.valid), expiresAt: result.expiresAt, reason: result.reason };
}
```

A browser app is the one place where a signed-in-free, device-local licence is
weakest — storage is easy to clear and easy to duplicate. If the Pro feature is
valuable, put it behind a server you control and check the licence there.

## Desktop / Electron

```ts
import { app } from "electron";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { hostname, platform, userInfo } from "node:os";
import path from "node:path";

const API = "https://your-domain.example";
const PROJECT = "my-app";

function stateDir() {
  return path.join(app.getPath("userData"));
}

async function readState() {
  try {
    return JSON.parse(await readFile(path.join(stateDir(), "license.json"), "utf8"));
  } catch {
    return {};
  }
}

async function writeState(state: Record<string, unknown>) {
  await mkdir(stateDir(), { recursive: true });
  await writeFile(path.join(stateDir(), "license.json"), JSON.stringify(state, null, 2));
}

/** Stable per machine, and not a plain machine id: hash it. */
function deviceId() {
  return createHash("sha256")
    .update(`${hostname()}|${platform()}|${userInfo().username}|${app.getPath("userData")}`)
    .digest("hex")
    .slice(0, 32);
}

export async function activate(key: string) {
  const response = await fetch(`${API}/api/license/activate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, projectSlug: PROJECT, deviceId: deviceId(), deviceName: hostname() }),
  });
  const result = await response.json();
  if (result.valid) {
    await writeState({ key, ...result, checkedAt: Date.now() });
  }
  return result;
}

/**
 * Online: re-verify. Offline: honour the token until graceUntil, then expire.
 * Store the key if you want a silent re-activation after grace.
 */
export async function entitlement() {
  const state = await readState();
  const now = Date.now();

  try {
    const response = await fetch(`${API}/api/license/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: state.token,
        key: state.token ? undefined : state.key,
        projectSlug: PROJECT,
        deviceId: deviceId(),
      }),
    });
    const result = await response.json();
    if (result.valid) {
      await writeState({ ...state, ...result, checkedAt: now });
      return { pro: true, expiresAt: result.expiresAt, offline: false };
    }
    return { pro: false, reason: result.reason, message: result.message, offline: false };
  } catch {
    const deadline = Date.parse(state.graceUntil ?? "0");
    if (state.token && now < deadline) {
      return { pro: true, expiresAt: state.expiresAt, offline: true };
    }
    return { pro: false, reason: "offline_expired", offline: true };
  }
}
```

Run `entitlement()` on launch and every 24 hours. Never delete the stored key on
a transient failure — only on `revoked` or `expired`.

### Messages worth showing

| `reason` | What the user should read |
| --- | --- |
| `invalid_key` | "That key doesn't look right. Check for a missing or extra character." |
| `device_limit` | "This key is already active on its maximum number of devices. Ask for a device reset." |
| `revoked` | "This key was deactivated. Contact support with your order link." |
| `expired` | "Your Pro licence ended on <date>. Renew from your order page." |
| `token_expired` | Silent. Re-verify in the background. |
| `offline_expired` | "Connect to the internet to confirm your licence — the offline window has ended." |

## Rotating the token signing key

1. `node scripts/license-keys.mjs` and keep only the `LICENSE_TOKEN_PRIVATE_KEY` line.
2. Set `LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS` to the current value and
   `LICENSE_TOKEN_PRIVATE_KEY` to the new one, in Vercel.
3. Deploy. Both keys are published, and both verify.
4. After one grace period (8+ days), clear `LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS`.

`LICENSE_SECRET` is **not** rotatable this way: order links and license keys are
encrypted with it. Back it up; do not change it.

## When something is wrong

| Symptom | Cause |
| --- | --- |
| `503 not_configured` | `LICENSE_SECRET` or `LICENSE_TOKEN_PRIVATE_KEY` is missing in that environment. |
| `403 Origin not allowed` | The caller's browser origin is not in `ALLOWED_ORIGINS`. |
| Every key reports `invalid_key` | The keys were minted under a different `LICENSE_SECRET`. |
| Admin can't show a key | Same thing — the ciphertext no longer decrypts. |
| Order link unreadable | `LICENSE_SECRET` changed after the order was placed. |
