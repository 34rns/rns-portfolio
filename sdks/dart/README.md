# Dart / Flutter

Dart 3.8+, `cryptography` for vetted Ed25519 and `http` for browser/native HTTP. Add a local path dependency to this folder. `KeyGateClient` exposes async `redeem`, `activate`, `validate`, `validateOnline`, `deactivate`, `getAccess` and `can`.

Use `VaultStorage` to connect your platform secure storage's string read/write methods. In Flutter, map them to an app-scoped key in `flutter_secure_storage`; never store activation credentials in plain shared preferences. `MemoryStorage` is for tests. Preserve one random installation ID, and serialize operations on the same client.

Only network failures permit access until an existing verified signed offline deadline. `validateOnline` requires the server. Public keys are cached per client; initialize online after restart or use a trusted public-key cache. Valuable backend operations need their own online validation.

Tests: `cd sdks/dart && dart pub get && dart test`. Dart VM contract tests run locally. Flutter device/secure-storage integration is a separate check before shipping a Flutter app; it is not claimed verified without that app/device.
