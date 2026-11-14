export function assertTestDatabase(url: string, productionHost: string): void {
  let target: URL;
  try { target = new URL(url); } catch { throw new Error("Set an explicit isolated test database URL."); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
  if (!local || target.hostname === productionHost || !/^postgres(ql)?:$/.test(target.protocol) || !/\/(?:[a-z0-9_]+)_(test|demo)$/.test(target.pathname)) {
    throw new Error("Licensing test/seed operations require a local database ending in _test or _demo.");
  }
}
