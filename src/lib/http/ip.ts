/**
 * The caller's address as Vercel reports it. Only the first hop is trusted:
 * `x-forwarded-for` is a client-writable header on any other host, and it is
 * used for rate limiting rather than for authorisation.
 */
export function clientIp(headers: Headers | Record<string, string | undefined>): string {
  const read = (name: string): string | null => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name);
    }
    const record = headers as Record<string, string | undefined>;
    const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === name);
    return key ? (record[key] ?? null) : null;
  };

  const forwarded = read("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || read("x-real-ip")?.trim() || "unknown";
}
