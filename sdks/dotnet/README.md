# .NET

Library target .NET 9+, NSec.Cryptography 26.4.0 for vetted Ed25519. Tests run on .NET 10 Windows. Add the project reference, then instantiate `Client(appId, "sandbox", apiUrl, storage)`.

`Redeem`, `Activate`, `Validate`, `ValidateOnline`, `Deactivate`, `GetAccess` and `Can` return Tasks. Implement `IStorage` using your OS vault or private server store; `MemoryStorage` is a test adapter. Preserve the installation ID and activation credential. Use one client sequentially; don't mutate its storage while a request is in flight.

Network-only failures can use an already verified signed token until its deadline. `ValidateOnline` always needs the server. Unknown public keys refresh once; initialize online after restart or use a trusted authenticated key-cache transport. Feature expiries, environment, device and time rollback are checked.

Run the assertion suite: `dotnet run --project sdks/dotnet/KeyGate.Tests` from the repository root.

Unity is a separate target: this .NET/NSec package is not advertised as Unity/IL2CPP compatible. Use the documented REST flow through your game backend and platform secure storage until a Unity project has been compiled and play-mode tested. Protect valuable game services on the backend.
