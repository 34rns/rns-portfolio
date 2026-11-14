# Add licensing to an app

In the admin, open **Apps & plans → your app → Add to app**. Choose New or Existing app, your platform and feature keys, then copy the Codex prompt into that app's chat. Keep backend keys separate from the prompt and client code.

The public machine-readable contract is served at `/integration.md`, `/openapi.json`, and `/.well-known/keygate.json`. The implementation source is `src/lib/licensing/integration-doc.ts`.

Test in Sandbox first. Premium app and Free/Pro flows use the same five operations: redeem, activate, validate, deactivate and can(feature). Runtime verification is required; prompt generation is only preparation. Owner deployment remains a separate release action.

Existing portfolio keys work through the new redeem/activate/validate/deactivate API when the app links to their published portfolio project, uses device binding, retains a Pro plan and selects Live. They share the original expiry, revocation and device slots; no grants are copied. Use the original key to activate another device. Advanced grant actions and PKCE return tickets apply to new app licenses; manage old keys under **Legacy keys**.

Credential recovery invalidates earlier online token proofs and outstanding return tickets. Clients need the recovered activation credential to obtain a current token. Offline copies remain bounded by their already signed deadline; protect valuable downloads and APIs online.
