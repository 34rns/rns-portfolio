# PHP

PHP 8.2+, built-in Sodium for Ed25519 and cURL for HTTPS. `require 'sdks/php/src/Client.php'` or use Composer's local path package. No external runtime library.

`new Rns\KeyGate\Client($appId, 'sandbox', $apiUrl, $storage)` exposes `redeem`, `activate`, `validate`, `validateOnline`, `deactivate`, `getAccess` and `can`. Implement the `Storage` interface with private persistent server storage. `MemoryStorage` is a test adapter; web sessions/databases should persist the client state across requests. Keep credentials out of the web root and logs.

Use `validateOnline()` before valuable PHP endpoints. Only a network failure permits still-signed offline access. Unknown keys need a bounded authenticated JWKS refresh. Public key cache lasts for the instance: initialize online on restart or provide a trusted key-cache transport. No access is granted if signature, audience, environment, device, expiry or clock checks fail.

Run `php sdks/php/tests/contract.php` with Sodium enabled. The suite verifies shared server-signed fixtures, environment isolation, feature expiry, rollback and offline/online boundaries.
