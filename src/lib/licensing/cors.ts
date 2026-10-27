/**
 * CORS for the license API.
 *
 * Only origins listed in `ALLOWED_ORIGINS` are answered. A request with no
 * `Origin` header is a desktop or native app, which is not subject to CORS at
 * all: those are allowed through, and no `access-control-allow-origin` is sent
 * because there is no browser origin to echo. Never a wildcard.
 */
export function allowedOrigins(value = process.env.ALLOWED_ORIGINS): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(
  origin: string | null | undefined,
  list: string[] = allowedOrigins(),
): boolean {
  if (!origin) return true;
  return list.includes(origin);
}

export function corsHeaders(
  origin: string | null | undefined,
  list: string[] = allowedOrigins(),
): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin, list)) return {};

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}
