export const integrationDoc=`# KeyGate integration contract

KeyGate adds license and feature access to premium apps or the Pro side of existing apps. Each app has an explicit app ID and sandbox/live environment. Use the same origin as this document for API calls. Public paths: /v1 and /api/v1.

## Client protocol

All requests use POST JSON and include app_id (UUID), environment (sandbox or live), device_id (random stable installation ID, 8–256 characters).

1. /v1/redeem: add code, an Idempotency-Key header and optionally activation_key to stack on an existing device license. user_id requires a trusted backend with an identity.write API key. Never accept arbitrary browser account IDs.
2. /v1/activate: add activation_key to join an existing license from another installation. This consumes a device slot, not another redemption. Account mode additionally requires trusted backend identity.
3. /v1/validate or /v1/status: add token. Signature is authenticated, then live grants/device state are checked. An online check may accept an older signed token as identity proof, but must check current database access before issuing a fresh token. An expired token never grants offline access.
4. /v1/deactivate: add token. Frees this device slot. Protected online operations reject that installation until it is activated again.

Successful redeem/activate/validate responses contain access, token, refreshAfter and offlineUntil. Device-mode issuance also returns activationKey. Tokens never contain the activation credential. On any explicit online rejection, clear cached access and lock premium operations.

## JWS verification

GET /v1/public-key returns Ed25519 JWKS. Discovery: /.well-known/keygate.json. Cache public keys by kid; unknown kid triggers a bounded refresh. Verify EdDSA signature, alg/typ/kid, v=keygate.v1, iss, aud=app_id, env, dev, iat, exp, offline_until and feature expiries. dev is the first 22 base64url characters of SHA-256(device_id UTF-8). Never skip verification when crypto is unavailable. Reject local time rollback and future issued tokens. Offline valid until exp = offline_until. Check each feature's exact expiresAt separately, even on a lifetime base. A network failure never updates signed deadlines. Offline revocation is bounded by the token's deadline; valuable backend routes should validate online.

## Storage and feature gates

Use platform secure storage for activation credentials and tokens. Browser same-origin storage is readable by scripts: prevent XSS and protect valuable API/download operations on the server. Store a stable random installation ID; avoid hardware fingerprinting. Account identity is proven only by the app's trusted backend. Server API keys must stay in environment configuration, never client code, URLs, logs or prompts.

The app enforces its chosen lock policy: downgrade to Free, hard lock, read only or custom message. Preserve user data. For an existing app, add one access adapter around premium operations, keep existing Free behavior and remove scattered client-only premium booleans. Feature bundles have independent expiry. Check can(feature_key) at the actual operation and backend boundary.

## Required verification

Run locked → sandbox redeem → Pro → second device → third device denied → deactivate → expiry/revoke → locked. Test wrong app/environment, forged user_id, tampered signature, offline deadline, feature expiry, clock rollback, network failure and unavailable storage. Record actual results. Generated instructions are not verified integration.

## Failure handling

400 invalid_body/idempotency_required; 401 invalid_code/identity_required/invalid_token/unauthorized; 403 forbidden/paused/revoked/expired/origin_denied; 409 code_exhausted/device_limit/idempotency_conflict; 410 redeem_deadline/app_archived; 429 rate_limited (respect Retry-After); 503 storage_unavailable. Responses are no-store and include requestId. Keep request IDs; redact all credentials.

See /openapi.json for exact request schemas. Native/desktop requests can omit Origin. Browser requests must use an exact allowed app origin. Preflight URL includes ?app_id=UUID&environment=sandbox. Legacy /api/license/* remains a separate contract.
`;
