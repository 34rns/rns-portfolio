export const logoHeroStyles = `
.rns-hero .rns-hero-intro { padding-block:28px 48px; grid-template-columns:1.25fr 1fr; }
.rns-hero .rns-hero-role { font-size:16px; margin-bottom:22px!important; color:#FFFFFF; }
.rns-hero h1 { font-size:clamp(56px,5.6vw,86px); line-height:1.02; }
.rns-hero .rns-logo-stage { position:relative; width:min(100%,560px); margin-bottom:46px; }
.rns-logo-interactive,.rns-logo-visual,.rns-logo-poster { position:absolute; inset:0; }
.rns-logo-interactive { isolation:isolate; }
.rns-logo-visual { transform-origin:center; }
.rns-logo-poster { pointer-events:none; }
.rns-logo-canvas { position:absolute; inset:-12px -24px; pointer-events:none; }
.rns-logo-controls { position:absolute; top:calc(100% + 12px); right:0; display:flex; align-items:center; gap:12px; white-space:nowrap; }
.rns-logo-controls button { min-height:44px; padding:8px 14px; border-radius:100px; font-size:12px; border:1px solid #707174; background:transparent; color:#FFFFFF; }
.rns-logo-controls .rns-logo-spin { border-color:#FFC900; color:#FFC900; }
.rns-logo-spin span { display:inline-block; margin-left:12px; font-size:19px; vertical-align:middle; transition:transform 500ms cubic-bezier(.16,1,.3,1); }
.rns-logo-spin:hover span { transform:rotate(180deg); }
.rns-logo-controls button:hover { background:#25272A; }
.rns-hero .rns-hero-description { max-width:43ch; font-size:16px; }
.rns-hero .rns-hero-actions { align-self:start; }
@media(max-width:1000px) { .rns-hero h1 { font-size:clamp(44px,6vw,60px); } }
@media(max-width:700px) {
 .rns-hero .rns-hero-intro { grid-template-columns:1fr; padding-block:20px 32px; }
 .rns-hero .rns-logo-stage { width:240px; margin-bottom:64px; justify-self:start; }
 .rns-logo-controls { right:auto; left:0; gap:10px; top:calc(100% + 8px); }
 .rns-logo-controls button { font-size:11px; min-height:44px; padding-inline:12px; }
 .rns-hero .rns-hero-role { font-size:14px; margin-bottom:16px!important; }
 .rns-hero h1 { font-size:clamp(42px,10.8vw,66px); line-height:1.03; }
 .rns-hero .rns-hero-description { margin-top:22px!important; font-size:16px; }
 .rns-hero .rns-hero-actions { margin-top:24px; gap:20px; }
}
@media(prefers-reduced-motion:reduce) { .rns-logo-visual { transform:none!important; opacity:1!important; } .rns-logo-spin span { transition:none; } }
`;
