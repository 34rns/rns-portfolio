# Security and support

Report a vulnerability privately to the repository owner. Include affected version, app/environment, sanitized request ID, expected/actual behavior and reproduction with synthetic data. Never include customer emails, real codes/tokens, backend API keys, activation credentials, signing keys or `.env` files in public issues.

Premium access is proven at the operation/backend boundary. A browser lock alone cannot protect downloadable code or valuable APIs. Public Ed25519 keys can be shared; signing/encryption keys and activation credentials cannot. Offline revocation takes effect on the next online check or signed offline deadline.

Every staff action checks current role/app/environment access; owner secrets and backup actions also require fresh authentication. Helpers use their own account and Sandbox by default. API keys are scoped and hashed; revoke lost keys and rotate activation credentials after verified customer recovery.

Exports are masked unless a freshly authenticated owner requests secrets. Backups contain encrypted records but remain private. Restore needs the original encryption keys, runs only against an explicitly isolated empty database and must not overwrite later production redemptions.
