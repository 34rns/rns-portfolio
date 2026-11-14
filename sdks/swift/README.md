# Swift / iOS

Prepared source for Swift 6, iOS 15+ and macOS 12+. **Not compiled or verified on macOS/iOS yet.** Do not ship it until `swift test` and your app's simulator/device checks pass. CryptoKit verifies Ed25519; there is no custom cryptography or server key in the client.

Use the local Swift package and implement `Storage` with Keychain. The example stores the serialized token, activation credential and random installation ID with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`. Keep one app-scoped service/account. Serialize mutating client calls; an actor can reenter while HTTP awaits.

Methods: `redeem`, `activate`, `validate`, `validateOnline`, `getAccess`, `deactivate`, `can`. On an explicit server rejection the token is cleared. Only a network error permits existing verified offline access; it never extends the deadline. Unknown public keys require a bounded online refresh after process restart. Test locked/redeem/expiry, wrong app/environment, clock rollback, device recovery and Keychain failure on the actual app.
