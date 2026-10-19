import { professionalTokens as t } from "./tokens";

export function ProfessionalPreview() {
  return (
    <div
      className="flex h-24 w-full flex-col justify-between overflow-hidden p-3"
      style={{ background: t.background, color: t.text, borderRadius: t.radius }}
    >
      <span
        className="display text-2xl font-medium"
        style={{ fontFamily: t.display }}
      >
        Aa
      </span>
      <div className="space-y-1.5">
        <span className="block h-px w-full" style={{ background: t.line }} />
        <div className="flex items-center gap-1.5">
          <span
            className="block h-2.5 w-8"
            style={{ background: t.accent, borderRadius: t.radius }}
          />
          <span className="block h-1.5 w-10" style={{ background: t.muted }} />
          <span className="block h-1.5 w-6" style={{ background: t.line }} />
        </div>
      </div>
    </div>
  );
}
