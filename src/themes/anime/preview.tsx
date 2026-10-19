import { animeTokens as t } from "./tokens";

export function AnimePreview() {
  return (
    <div
      className="relative flex h-24 w-full flex-col justify-between overflow-hidden border-2 p-3"
      style={{
        background: t.background,
        color: t.text,
        borderColor: t.text,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(${t.text} 1px, transparent 1.1px)`,
          backgroundSize: "6px 6px",
        }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="text-[1.7rem] font-black uppercase leading-none tracking-[-0.06em]"
          style={{ fontFamily: t.display }}
        >
          A<span style={{ color: "transparent", WebkitTextStroke: `1px ${t.text}` }}>a</span>
        </span>
        <span
          className="h-6 w-6 rounded-full border-2"
          style={{ borderColor: t.accent }}
        />
      </div>
      <div className="relative space-y-1.5">
        <span className="block h-2 w-12" style={{ background: t.accent }} />
        <div className="flex gap-1.5">
          <span className="block h-1.5 w-12 border" style={{ borderColor: t.text }} />
          <span className="block h-1.5 w-8 border" style={{ borderColor: t.text }} />
        </div>
      </div>
    </div>
  );
}
