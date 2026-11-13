export const logoHeroStyles = `
.rns-hero-intro { display:grid; grid-template-columns:1.5fr 1fr; align-items:center; gap:clamp(40px,8vw,130px); padding-block:34px 54px; }
.rns-hero-copy { min-width:0; }
.rns-hero h1 { font-family:var(--font-newsreader),Georgia,serif; font-size:clamp(60px,6.5vw,96px); font-weight:450; letter-spacing:-.03em; line-height:1; }
.rns-hero-description { max-width:54ch; margin-top:22px!important; font-size:16px; line-height:1.7; color:var(--brand-muted); }
.rns-hero-role { color:var(--brand-text); }
.rns-hero-actions { display:flex; flex-wrap:wrap; align-items:center; gap:26px; margin-top:24px; }
.rns-logo-stage { position:relative; width:100%; max-width:430px; aspect-ratio:1.8; justify-self:end; border-radius:16px; background:var(--brand-surface); }
.rns-logo-interactive { position:absolute; inset:0; isolation:isolate; }
.rns-logo-visual { position:absolute; inset:12px 10px 50px; transform-origin:center; }
.rns-logo-poster { position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; }
.rns-logo-poster picture { display:block; width:90%; }
.rns-logo-stage img { display:block; width:100%; height:auto; }
.rns-logo-canvas { position:absolute; inset:0; pointer-events:none; }
.rns-logo-controls { position:absolute; bottom:6px; left:16px; right:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.rns-logo-controls button { min-height:44px; padding:8px; border:0; border-radius:6px; font-size:12px; background:transparent; color:var(--brand-muted); transition:color 140ms,background 140ms; }
.rns-logo-controls .rns-logo-spin { display:flex; align-items:center; gap:12px; padding-left:0; }
.rns-logo-spin span { display:inline-flex; color:var(--brand-accent); }
.rns-logo-controls .rns-icon { width:17px; height:17px; }
.rns-logo-controls button:hover { color:var(--brand-text); background:#ffffff08; }
.rns-logo-controls button:active { background:#ffffff12; }
@media(max-width:1000px) {
 .rns-hero-intro { gap:32px; grid-template-columns:1.3fr 1fr; padding-block:32px 44px; }
 .rns-hero h1 { font-size:clamp(52px,6.5vw,70px); }
 .rns-logo-stage { aspect-ratio:1.6; }
}
@media(max-width:700px) {
 .rns-hero-intro { grid-template-columns:1fr; gap:28px; padding-block:26px 36px; }
 .rns-hero h1 { font-size:clamp(42px,11.5vw,70px); line-height:1.02; }
 .rns-hero-description { margin-top:18px!important; }
 .rns-hero-actions { margin-top:22px; gap:22px; }
 .rns-logo-stage { max-width:280px; justify-self:start; aspect-ratio:1.85; }
 .rns-logo-visual { inset:6px 8px 44px; }
 .rns-logo-controls { bottom:1px; left:12px; right:12px; }
}
@media(prefers-reduced-motion:reduce) { .rns-logo-visual { transform:none!important; opacity:1!important; } }
`;
