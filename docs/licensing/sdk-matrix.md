# Platform availability

| Target | Current evidence | Before publishing your app |
| --- | --- | --- |
| JavaScript/TypeScript | Vitest signed contract; real browser widget and redemption; Express/Hono/Next adapter checks | Test your Free/Pro backend boundary and browser storage/XSS protection. |
| Python/FastAPI | Actual Python contract and FastAPI HTTP tests | Use an OS vault for desktop credentials; test your backend identity source. |
| Go | Actual standard-library signed contract tests | Connect secure persistent storage and your app's protected operations. |
| PHP | Actual PHP signed fixture tests with sodium | Sodium must be installed; protect server environment credentials. |
| .NET | Actual .NET 10 console contract; library targets .NET 9+ with NSec 26.4 | Test native crypto and OS-vault storage on the shipped OS. Unity is not verified. |
| Kotlin JVM | Actual Kotlin/JDK signed contract | Android compilation, Keystore, reinstall and device tests remain separate. |
| Dart VM | Actual Dart signed contract | Flutter compilation and secure-storage/device integration remain separate. |
| Swift/iOS | Prepared CryptoKit/Keychain source and fixture test; unverified on this Windows host | Run `swift test` on macOS, then simulator and real Keychain/device checks. |
| REST | Documented versioned API/OpenAPI; server contract verified | Implement signature verification with vetted platform crypto; never decode-only. |

SDK source is in `sdks/`; platform storage examples are in `examples/`. Only synthetic signed fixtures are shared. Never place an API backend key, activation credential or real license in source, prompts or screenshots.

All clients expose redeem, activate, validate, deactivate and can. Call activate for a second device. A server denial locks immediately; offline access never lasts beyond the already signed deadline. After process restart, public-key discovery may require connectivity. Do not promise offline cold start without a trusted persisted key cache.

The final review added stepped-clock-rollback regressions to Go and .NET, both executed successfully. Swift's matching watermark change and regression are prepared but remain unverified until its macOS tests run.
