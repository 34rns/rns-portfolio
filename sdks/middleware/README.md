# Protect a valuable route

The adapters require a bearer license token and `x-keygate-device` header, call live validation and verify the returned signature before admitting a request. There is no offline fallback for valuable backend operations.

```ts
export const GET = requireLicense({appId:APP_ID,environment:"live",apiUrl:LICENSE_API,featureKey:"export_pdf"}, async () => Response.json({protected:"content"}));
```

Express, Hono, and a standard Next.js Request/Response wrapper share the same verification function. Do not rely on client UI visibility to protect downloads or APIs. Route wrappers need integration tests in your actual framework; source compatibility alone is not verification.
