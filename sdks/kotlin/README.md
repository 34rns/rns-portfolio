# Kotlin / Android

JVM contract client uses Bouncy Castle 1.87 (vetted Ed25519) and JSON. JVM tests compile with Kotlin 2.4.21 / JDK 21. Methods: `redeem`, `activate`, `validate`, `validateOnline`, `deactivate`, `getAccess`, `can`.

All HTTP methods are synchronous: call them on an IO executor/coroutine dispatcher, never Android's main thread. `VaultStorage` adapts encrypted string read/write. Android storage must encrypt the serialized state with an Android Keystore AES/GCM key and store only its ciphertext/IV in app-private preferences; use the example adapter. Preserve the random installation ID. Uninstall/reinstall needs activation recovery because the old key is gone.

Network-only failures can use an already verified signed token until its offline deadline. Feature deadlines, device/environment, signature and clock rollback are checked. Valuable backend operations must use live server enforcement. Public keys are cached per client; initialize online after restart or use a trusted authenticated public-key cache.

Android compilation/instrumentation is a separate target check; JVM evidence does not verify Android Keystore, D8 or device behavior. Use Android API 26+ and verify the actual app before publication.
