/**
 * A model URL comes back from the upload endpoints, so this is a shape check
 * rather than a trust boundary: the bytes were already sniffed by
 * `validateUpload`, and only an admin can reach the route.
 */
export function isModelUrl(url: string): boolean {
  if (url.startsWith("/api/uploads/")) {
    return /\.(glb|gltf)$/i.test(url.split("?")[0]);
  }
  return /^https?:\/\/\S+?\.(glb|gltf)(\?\S*)?$/i.test(url);
}

export function cleanModelName(name: unknown, fallback: string): string {
  const trimmed = typeof name === "string" ? name.trim() : "";
  return (trimmed || fallback).slice(0, 120);
}
