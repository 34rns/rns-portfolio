import { folderdockTokens as t } from "./tokens";

export function FolderDockPreview() {
  return (
    <div
      className="flex h-24 w-full overflow-hidden border"
      style={{
        background: t.background,
        color: t.text,
        borderColor: t.line,
        borderRadius: t.radius,
        fontFamily: "ui-monospace, monospace",
      }}
    >
      <div className="w-7 border-r p-1.5" style={{ borderColor: t.line }}>
        <span className="block h-2 w-2 rounded-sm" style={{ background: t.accent }} />
        <span className="mt-2 block h-1 w-3" style={{ background: t.line }} />
        <span className="mt-1 block h-1 w-3" style={{ background: t.line }} />
        <span className="mt-1 block h-1 w-2" style={{ background: t.line }} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        <div className="flex items-center justify-between text-[0.38rem] uppercase tracking-[0.13em]">
          <span>FolderDock</span>
          <span style={{ color: t.accent }}>Local</span>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="block border"
              style={{
                background: item === 1 ? t.surface : "#2D2D2D",
                borderColor: item === 1 ? t.accent : t.line,
                borderRadius: 3,
              }}
            />
          ))}
        </div>
        <span className="block h-1 w-16" style={{ background: t.line }} />
      </div>
    </div>
  );
}
