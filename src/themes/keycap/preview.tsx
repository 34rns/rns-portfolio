import { keycapTokens as t } from "./tokens";

/**
 * Miniature of the theme for the admin picker. The picker renders outside the
 * themed page, so this cannot use the theme's font variables; it uses the
 * bundled stacks and lets the keycap composition carry the identity.
 */
export function KeycapPreview() {
  return (
    <div
      className="relative flex h-24 w-full flex-col justify-between overflow-hidden border p-3"
      style={{
        background: `linear-gradient(160deg, #FFFDF6, ${t.background} 55%, ${t.surface})`,
        color: t.text,
        borderColor: "rgba(25,23,18,0.28)",
        borderRadius: t.radius,
        fontFamily: "ui-monospace, monospace",
        boxShadow: "inset 0 1px 0 #FFFDF6",
      }}
    >
      <div className="flex items-start justify-between text-[0.4rem] uppercase tracking-[0.18em]">
        <span style={{ color: t.muted }}>Shobdo / 13</span>
        <span style={{ color: t.accent }}>বাং · EN</span>
      </div>

      <div className="relative flex items-end gap-1.5">
        {["শ", "অ", "A"].map((letter, index) => (
          <span
            key={letter}
            className="flex h-7 w-7 items-center justify-center text-[0.85rem]"
            style={{
              background: index === 1 ? t.accent : "#FFFDF6",
              color: index === 1 ? t.accentText : t.text,
              border: "1px solid rgba(25,23,18,0.25)",
              borderBottomWidth: 3,
              borderRadius: 4,
              boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset",
            }}
          >
            {letter}
          </span>
        ))}

        <span
          className="ml-auto text-[1.4rem] leading-none"
          style={{ fontFamily: "Georgia, serif", color: t.accent }}
        >
          শব্দ
        </span>
      </div>

      <div className="flex items-center justify-between text-[0.38rem] uppercase tracking-[0.16em]">
        <span style={{ color: t.muted }}>Letterpress / IME</span>
        <span
          className="block h-1.5 w-8"
          style={{ background: t.accent }}
        />
      </div>
    </div>
  );
}
