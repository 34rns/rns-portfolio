/**
 * A project whose `liveUrl` points at a GitHub "latest" release asset is a
 * free download, not a hosted site — the themes label the link accordingly.
 */
const RELEASE_DOWNLOAD = /github\.com\/[^/]+\/[^/]+\/releases\/latest\/download\//i;

export function isReleaseDownloadLink(url: string | null | undefined): boolean {
  return Boolean(url && RELEASE_DOWNLOAD.test(url));
}

/** `https://github.com/owner/repo` -> `owner/repo`, or null when it is not one. */
export function repoSlug(repoUrl: string | null | undefined): string | null {
  if (!repoUrl) return null;
  try {
    const url = new URL(repoUrl);
    if (url.hostname.toLowerCase() !== "github.com") return null;
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    return owner && repo ? `${owner}/${repo}` : null;
  } catch {
    return null;
  }
}
