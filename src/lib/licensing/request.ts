const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type LicenseRequestInput = {
  key: string | null;
  token: string | null;
  projectSlug: string;
  deviceId: string | null;
  deviceName: string | null;
};

export type ParseResult =
  | { ok: true; input: LicenseRequestInput }
  | { ok: false; error: string };

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Both endpoints share one parser. Limits are generous for keys but bounded,
 * so an oversized body never reaches the crypto or the database.
 */
export function parseLicenseRequest(
  body: Record<string, unknown>,
  { requireDevice }: { requireDevice: boolean },
): ParseResult {
  const projectSlug = str(body.projectSlug);
  if (!projectSlug || projectSlug.length > 120 || !SLUG.test(projectSlug)) {
    return { ok: false, error: "A valid projectSlug is required." };
  }

  const key = str(body.key);
  if (key && key.length > 64) return { ok: false, error: "A valid key is required." };

  const token = str(body.token);
  if (token && token.length > 2048) return { ok: false, error: "A valid token is required." };

  if (!key && !token) return { ok: false, error: "Send a key or a token." };

  const deviceId = str(body.deviceId);
  if (requireDevice && !deviceId) return { ok: false, error: "A deviceId is required." };
  if (deviceId && deviceId.length > 200) return { ok: false, error: "That deviceId is too long." };

  const deviceName = str(body.deviceName);
  if (deviceName && deviceName.length > 120) {
    return { ok: false, error: "That deviceName is too long." };
  }

  return { ok: true, input: { key, token, projectSlug, deviceId, deviceName } };
}
