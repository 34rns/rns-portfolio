export const logoHeroStyles = `
.rns-hero .rns-hero-intro { grid-template-columns:1.08fr 1fr; align-items:center; gap:clamp(40px,6vw,96px); padding-block:54px 72px; }
.rns-hero .rns-hero-copy { display:block; min-width:0; }
.rns-hero .rns-hero-role { font-size:15px; margin-bottom:22px!important; color:var(--brand-muted); }
.rns-hero h1 { font-size:clamp(54px,5.3vw,84px); line-height:1.04; letter-spacing:-.055em; }
.rns-hero .rns-hero-description { max-width:43ch; margin-top:26px!important; font-size:17px; line-height:1.7; }
.rns-hero .rns-hero-actions { margin-top:30px; gap:26px; }
.rns-hero .rns-logo-stage { position:relative; grid-column:2; grid-row:1; justify-self:stretch; width:100%; aspect-ratio:5/4; margin:0; border:1px solid color-mix(in srgb,var(--brand-text) 12%,transparent); border-radius:28px; background:radial-gradient(ellipse at 65% 25%,color-mix(in srgb,var(--brand-surface) 86%,white),var(--brand-surface) 48%,var(--brand-background)); box-shadow:inset 0 1px 0 #ffffff09; }
.rns-logo-interactive { position:absolute; inset:0; isolation:isolate; }
.rns-logo-visual { position:absolute; inset:20px 14px 72px; transform-origin:center; }
.rns-logo-poster { position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; }
.rns-logo-poster picture { display:block; width:84%; }
.rns-logo-canvas { position:absolute; inset:0; pointer-events:none; }
.rns-logo-controls { position:absolute; bottom:18px; left:22px; right:22px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.rns-logo-controls button { min-height:44px; padding:9px 14px; border-radius:9px; font-size:12px; border:1px solid color-mix(in srgb,var(--brand-text) 24%,transparent); background:transparent; color:var(--brand-text); transition:background 180ms,border-color 180ms; }
.rns-logo-controls .rns-logo-spin { display:flex; align-items:center; gap:16px; border-color:transparent; padding-left:0; color:var(--brand-muted); }
.rns-logo-spin span { display:inline-block; color:var(--brand-accent); font-size:20px; transition:transform 500ms cubic-bezier(.16,1,.3,1); }
.rns-logo-spin:hover span { transform:rotate(180deg); }
.rns-logo-controls button:hover { border-color:var(--brand-text); background:#ffffff08; }
.rns-logo-controls .rns-logo-spin:hover { border-color:transparent; color:var(--brand-text); }
@media(max-width:1000px) {
 .rns-hero .rns-hero-intro { gap:32px; padding-block:36px 54px; }
 .rns-hero h1 { font-size:clamp(44px,5.4vw,60px); }
 .rns-hero .rns-hero-description { font-size:16px; }
 .rns-hero .rns-logo-stage { aspect-ratio:1; }
}
@media(max-width:700px) {
 .rns-hero .rns-hero-intro { grid-template-columns:1fr; gap:32px; padding-block:24px 40px; }
 .rns-hero .rns-hero-role { font-size:14px; margin-bottom:16px!important; }
 .rns-hero h1 { font-size:clamp(36px,10.2vw,58px); line-height:1.08; }
 .rns-hero .rns-hero-description { margin-top:20px!important; font-size:16px; }
 .rns-hero .rns-hero-actions { margin-top:24px; gap:22px; }
 .rns-hero .rns-logo-stage { grid-column:1; grid-row:auto; aspect-ratio:1.65; border-radius:20px; }
 .rns-logo-visual { inset:12px 8px 52px; }
 .rns-logo-controls { bottom:8px; left:18px; right:18px; }
 .rns-logo-controls button { font-size:12px; }
}
@media(prefers-reduced-motion:reduce) { .rns-logo-visual { transform:none!important; opacity:1!important; } .rns-logo-spin span { transition:none; } }
`;
