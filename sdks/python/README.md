# Python / FastAPI

Install locally: `pip install ./sdks/python`. Python 3.10+; Ed25519 uses the vetted `cryptography` library. Optional middleware: `pip install './sdks/python[fastapi]'`.

```python
from keygate import KeyGateClient, FileStorage
client = KeyGateClient('YOUR-APP-UUID', 'sandbox', 'https://YOUR-DOMAIN/v1', FileStorage('/private/app/license.json'))
client.redeem('YOUR-CODE')  # save returned activation credential securely
if client.can('export_pdf'):
    print('PDF export available')
client.validate()  # network-only failures may use the existing signed offline deadline
client.validate_online()  # valuable backend operations must fail closed without online proof
```

`activate(key)` adds an installation to the same license without consuming another code. `deactivate()` releases its slot. API credentials belong only in backend environment configuration; these client calls use device mode. Account-bound redemption is performed by your authenticated backend with `identity.write` and its verified subject.

The file adapter is atomic and uses POSIX mode 0600. For native applications use OS-vault storage; on Windows mode bits alone do not protect a file from other local users. Implement `read()`/`write(state)` with your platform vault. Keep one persistent installation ID. Public key cache lasts for the client instance: initialize online after restart, or supply a trusted transport backed by an authenticated public-key cache. Missing key/network fails locked.

FastAPI: `Depends(require_license(app_id, environment, api_url, 'export_pdf'))`. Requests send `Authorization: Bearer TOKEN` and `X-KeyGate-Device: INSTALLATION-ID`. The middleware validates online for every valuable operation.

Tests: `PYTHONPATH=sdks/python python -m pytest sdks/python/tests -q`. Shared fixtures contain synthetic signed tokens and public keys only.
