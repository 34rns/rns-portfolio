# Go

Go 1.23+, standard library only. `New(appID, "sandbox", "https://YOUR-DOMAIN/v1", storage, installationID)` returns a client with `Redeem`, `Activate`, `Validate`, `ValidateOnline`, `Deactivate`, `GetAccess` and `Can`.

Provide a `Storage` adapter with `Read() (*State,error)` / `Write(State) error` backed by private server storage or your OS vault. `MemoryStorage` is for tests and processes that already persist installation identity elsewhere. Keep activation credentials private. Account-bound redemption belongs in the authenticated backend.

Ed25519 signature, issuer, audience, environment, installation, clock rollback and feature/offline expiries are checked. Network failures alone may use a still-valid cached token. `ValidateOnline` always needs online proof; use it before valuable API/download operations. Public keys are cached for the client instance; initialize online on restart or provide a trusted authenticated key-cache transport.

Test: `cd sdks/go && go test ./...`. Shared fixtures are synthetic public test data.
