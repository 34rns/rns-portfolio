"use client";

import { useEffect, useState } from "react";
import { repoSlug } from "@/lib/projects/links";

/**
 * Shows the latest release tag next to a download link.
 *
 * The pages that use this stay statically generated: this runs only in the
 * browser, after the HTML is already served. If the GitHub API is slow, rate
 * limited or unreachable it renders nothing and the static download link keeps
 * working, which is the fallback.
 */
export function ReleaseVersion({
  repoUrl,
  className,
}: {
  repoUrl: string | null;
  className?: string;
}) {
  const slug = repoSlug(repoUrl);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    fetch(`https://api.github.com/repos/${slug}/releases/latest`, {
      signal: controller.signal,
      headers: { accept: "application/vnd.github+json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        const tag =
          data && typeof data === "object" && "tag_name" in data
            ? (data as { tag_name?: unknown }).tag_name
            : null;
        if (typeof tag === "string" && tag) setVersion(tag);
      })
      .catch(() => {
        /* rate limited, offline or offline-first: keep the static link only */
      })
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slug]);

  if (!version) return null;

  return (
    <span className={className} aria-label={`Latest release ${version}`}>
      {version.startsWith("v") ? version : `v${version}`}
    </span>
  );
}
