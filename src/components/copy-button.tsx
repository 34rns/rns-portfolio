"use client";

import { useState } from "react";

/**
 * Clipboard writes need a secure context, which a plain-http LAN preview is
 * not. The fallback selects the text so one keystroke finishes the job.
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={className ?? "mono border border-[#D8D8D2] px-2 py-1 text-xs hover:bg-[#E7E7E0]"}
      aria-live="polite"
    >
      {failed ? "Select the text and press Ctrl+C" : copied ? copiedLabel : label}
    </button>
  );
}
