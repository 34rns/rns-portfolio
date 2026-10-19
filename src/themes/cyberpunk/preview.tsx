import { cyberpunkTokens as t } from "./tokens";

/**
 * Miniature for the admin picker. The picker renders outside the themed page,
 * so this cannot use the theme's font variables; the composition carries the
 * identity instead.
 */
export function CyberpunkPreview() {
  return (
    <div
      className="relative flex h-24 w-full flex-col justify-between overflow-hidden border p-3"
      style={{
        background: `radial-gradient(130% 100% at 80% 0%, #10222A, ${t.background} 62%)`,
        color: t.text,
        borderColor: "rgba(230,255,61,0.42)",
        fontFamily: "ui-monospace, monospace",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-9"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(232,244,248,.13) 0 1px, transparent 1px 16px)",
          maskImage: "linear-gradient(180deg, transparent, #000)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute right-6 top-5 h-14 w-14 rounded-full border"
        style={{ borderColor: "rgba(52,225,245,0.55)" }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2"
          style={{ background: "#34E1F5" }}
        />
      </div>

      <div className="relative flex items-start justify-between text-[0.4rem] uppercase tracking-[0.18em]">
        <span style={{ color: "#34E1F5" }}>NODE 09 / FEED</span>
        <span style={{ color: t.accent }}>REC</span>
      </div>

      <div className="relative flex items-end justify-between">
        <div>
          <span
            className="block text-[1.6rem] font-semibold uppercase leading-none tracking-[-0.03em]"
            style={{ textShadow: "3px 0 0 rgba(255,59,92,.6)" }}
          >
            Cyber
          </span>
          <span className="mt-1 block text-[0.38rem] uppercase tracking-[0.2em] opacity-60">
            Night intercept
          </span>
        </div>
        <span
          className="h-1.5 w-9"
          style={{ background: t.accent, boxShadow: "0 0 12px rgba(230,255,61,.55)" }}
        />
      </div>
    </div>
  );
}
