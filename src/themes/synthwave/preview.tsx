import { synthwaveTokens as t } from "./tokens";

/**
 * Miniature of the theme for the admin picker. It cannot rely on the theme's
 * font variables (the picker renders outside the themed page), so it uses the
 * bundled monospace stack and lets the composition carry the identity.
 */
export function SynthwavePreview() {
  return (
    <div
      className="relative flex h-24 w-full flex-col justify-between overflow-hidden border p-3"
      style={{
        background: `radial-gradient(120% 90% at 50% 10%, #2A1050, ${t.background} 60%, #0D0518)`,
        color: t.text,
        borderColor: "rgba(255,46,136,0.45)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-10 origin-bottom"
        style={{
          transform: "perspective(90px) rotateX(58deg)",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(45,226,230,.55) 0 1px, transparent 1px 14px), repeating-linear-gradient(0deg, rgba(255,46,136,.4) 0 1px, transparent 1px 10px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-6 h-12 w-12 -translate-x-1/2 rounded-full"
        style={{
          background: "linear-gradient(180deg, #FFE9A3, #FF8A3D 55%, #FF2E88)",
          maskImage:
            "repeating-linear-gradient(180deg, #000 0 3px, transparent 3px 5px)",
          WebkitMaskImage:
            "repeating-linear-gradient(180deg, #000 0 3px, transparent 3px 5px)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="text-[2rem] uppercase leading-none"
          style={{
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.02em",
            textShadow: "2px 0 0 #FF2E88, -2px 0 0 #2DE2E6",
          }}
        >
          Synth
        </span>
        <span
          className="text-[0.42rem] uppercase leading-[1.6]"
          style={{ fontFamily: "ui-monospace, monospace", color: "#2DE2E6" }}
        >
          1986
          <br />
          FM 03
        </span>
      </div>
      <div className="relative flex items-end justify-between">
        <span
          className="h-1.5 w-10"
          style={{ background: t.accent, boxShadow: "0 0 10px #FF2E88" }}
        />
        <span
          className="text-[0.4rem] uppercase tracking-[0.16em]"
          style={{ color: "#B9A3D6" }}
        >
          Press start
        </span>
      </div>
    </div>
  );
}
