import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col justify-between px-5 py-8 md:px-10"
      style={{ background: "var(--theme-bg)", color: "var(--theme-text)" }}
    >
      <Link href="/" className="display text-[1.35rem] font-semibold">
        RNS
      </Link>
      <div>
        <p className="mono text-[var(--theme-muted)]">404</p>
        <h1 className="display mt-4 max-w-[16ch] text-[clamp(2.8rem,9vw,7rem)] font-medium">
          This page isn&apos;t here.
        </h1>
        <p className="mt-6 max-w-[42ch] text-[1.08rem] leading-[1.7] text-[var(--theme-muted)]">
          The link may be old, or the project may still be a draft.
        </p>
        <Link href="/" className="nav-link mt-8 inline-block border-b border-current pb-1">
          Back to the index
        </Link>
      </div>
      <span aria-hidden="true" />
    </main>
  );
}
