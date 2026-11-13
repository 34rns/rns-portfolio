export const professionalLandingStyles = `
.rns-landing {
  --theme-bg:var(--brand-background); --theme-surface:var(--brand-surface);
  --theme-text:var(--brand-text); --theme-muted:var(--brand-muted);
  --theme-accent:var(--brand-accent-2); --theme-accent-text:var(--brand-background);
  --theme-line:var(--brand-border); --theme-radius:12px;
  color:var(--brand-text); background:var(--brand-background);
  font-family:var(--font-archivo),Arial,sans-serif; overflow:clip; isolation:isolate;
}
.rns-landing *, .rns-landing *::before, .rns-landing *::after { box-sizing:border-box; }
.rns-landing h1,.rns-landing h2,.rns-landing h3,.rns-landing p,.rns-landing figure { margin:0; }
.rns-landing ul { margin:0; padding:0; list-style:none; }
.rns-landing h1,.rns-landing h2,.rns-landing h3 { font-weight:600; font-variation-settings:"wdth" 96; letter-spacing:-.055em; line-height:1.08; text-wrap:balance; overflow-wrap:anywhere; }
.rns-landing h1>span,.rns-landing h2>span { display:block; }
.rns-landing a { color:inherit; text-decoration:none; }
.rns-landing button { font:inherit; color:inherit; cursor:pointer; }
.rns-landing button:disabled { cursor:default; }
.rns-landing a:focus-visible,.rns-landing button:focus-visible { outline:3px solid var(--brand-accent-2); outline-offset:5px; }
.rns-landing [data-brand-tone="dark"] a:focus-visible,.rns-landing [data-brand-tone="dark"] button:focus-visible { outline-color:var(--brand-accent); }
.rns-landing [data-brand-tone] { color:var(--brand-text); }
.rns-landing ::selection { background:var(--brand-accent); color:#17191C; }
.rns-shell { width:min(calc(100% - clamp(40px,8vw,144px)),1440px); margin-inline:auto; }
.rns-landing section[id] { scroll-margin-top:32px; }
.rns-opening { background:var(--brand-background); }
.rns-header { display:flex; align-items:center; justify-content:space-between; gap:28px; padding-block:22px; }
.rns-header-note { max-width:28ch; font-size:12px; line-height:1.5; color:var(--brand-muted); }
.rns-header nav { display:flex; align-items:center; justify-content:flex-end; gap:clamp(20px,2.8vw,44px); margin-left:auto; }
.rns-header a { display:inline-flex; align-items:center; gap:6px; min-height:44px; font-size:13px; font-weight:500; position:relative; }
.rns-header a::after { content:""; position:absolute; bottom:7px; left:0; right:0; height:2px; background:var(--brand-accent); transform:scaleX(0); transform-origin:left; transition:transform 220ms ease; }
.rns-header a:hover::after { transform:scaleX(1); }
.rns-hero-intro { display:grid; grid-template-columns:1.25fr 1fr; align-items:center; column-gap:clamp(40px,6vw,100px); padding-block:28px 42px; }
.rns-hero-copy { display:contents; }
.rns-hero-role { grid-column:1; grid-row:1; margin-bottom:24px!important; font-size:12px; line-height:1.6; color:var(--brand-muted); }
.rns-hero h1 { grid-column:1; grid-row:2; min-width:0; font-size:clamp(62px,6.2vw,96px); line-height:1; font-weight:620; letter-spacing:-.06em; }
.rns-hero-description { grid-column:2; grid-row:3; font-size:16px; line-height:1.7; max-width:42ch; color:var(--brand-muted); margin-top:22px!important; }
.rns-hero-actions { grid-column:1; grid-row:3; display:flex; flex-wrap:wrap; align-items:center; gap:30px; margin-top:26px; }
.rns-logo-stage { grid-column:2; grid-row:1 / span 2; justify-self:end; width:min(100%,460px); aspect-ratio:1400/556; }
.rns-logo-stage img { display:block; width:100%; height:auto; }
.rns-button { display:inline-flex; justify-content:center; align-items:center; gap:24px; min-height:54px; padding:14px 24px; border:1px solid #17191C; border-radius:12px; background:var(--brand-accent); color:#17191C!important; font-size:14px; font-weight:600; transform:translate(var(--magnet-x,0px),var(--magnet-y,0px)); transition:transform 260ms cubic-bezier(.16,1,.3,1),box-shadow 180ms; }
.rns-button span { font-size:21px; line-height:1; font-weight:400; }
.rns-button:hover { box-shadow:0 0 0 3px color-mix(in srgb,var(--brand-accent) 24%,transparent); }
.rns-text-link { display:inline-flex; gap:14px; align-items:center; min-height:44px; font-size:13px; border-bottom:1px solid currentColor; transition:border-color 180ms; }
.rns-text-link:hover { border-color:var(--brand-accent); }
.rns-showcase { padding-bottom:52px; }
.rns-showcase-top { display:flex; justify-content:space-between; align-items:center; gap:20px; border-top:1px solid var(--brand-border); padding-top:18px; font-size:12px; color:var(--brand-muted); }
.rns-showcase-controls { display:flex; align-items:center; gap:14px; }
.rns-showcase-controls button { min-height:44px; padding:8px 14px; border:1px solid var(--brand-border); border-radius:9px; background:transparent; color:var(--brand-text); font-size:12px; }
.rns-showcase-controls button:hover:not(:disabled) { border-color:var(--brand-accent); background:var(--brand-surface); }
.rns-showcase-controls button:disabled { color:var(--brand-muted); }
.rns-showcase-position { font-size:11px; min-width:46px; font-variant-numeric:tabular-nums; }
.rns-showcase-controls .rns-arrow-control { width:44px; padding:0; font-size:21px; line-height:1; }
.rns-scene-shell { overflow:hidden; padding-block:12px; }
.rns-scene { position:relative; height:clamp(400px,48vw,680px); width:min(100%,1440px); margin:auto; perspective:1400px; --scene-rx:0deg; --scene-ry:0deg; }
.rns-scene::before { content:""; position:absolute; inset:4% 5% 0; background:radial-gradient(ellipse at 50% 78%,color-mix(in srgb,var(--brand-accent) 12%,transparent),transparent 65%); pointer-events:none; }
.rns-scene-ribbon { position:absolute; inset:0; width:100%; height:100%; stroke:var(--brand-border); stroke-width:1; opacity:.28; pointer-events:none; }
.rns-scene-signal { stroke:var(--brand-accent); stroke-width:2; stroke-dasharray:80 1650; animation:rns-signal 12s linear infinite paused; }
.rns-scene[data-running="true"] .rns-scene-signal { animation-play-state:running; }
.rns-scene:focus-within .rns-scene-signal { animation-play-state:paused; }
.rns-showcase:has(:focus-visible) .rns-scene-signal { animation-play-state:paused; }
.rns-scene-front { position:absolute; z-index:3; left:50%; top:50%; width:min(72%,1000px); transform:translate(-50%,-50%) rotateX(var(--scene-rx)) rotateY(var(--scene-ry)); transition:transform 500ms cubic-bezier(.16,1,.3,1); }
.rns-scene-front { animation:rns-scene-arrive 450ms cubic-bezier(.16,1,.3,1); }
.rns-scene-link { display:block; overflow:hidden; border:1px solid var(--brand-border); border-radius:12px; background:var(--brand-surface); box-shadow:0 35px 65px #0009; }
.rns-scene-link:hover { border-color:var(--brand-accent); }
.rns-scene-chrome { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:10px 14px; background:var(--brand-surface); font-size:10px; line-height:1.5; color:var(--brand-muted); }
.rns-scene-chrome>span:first-child { display:flex; gap:5px; }
.rns-scene-chrome i { display:block; width:5px; height:5px; border:1px solid var(--brand-muted); border-radius:50%; }
.rns-scene-image { position:relative; width:100%; aspect-ratio:16/10; overflow:hidden; background:var(--brand-surface); }
.rns-scene-cover { object-fit:cover; }
.rns-scene-fallback { display:flex; flex-direction:column; justify-content:space-between; padding:clamp(20px,3vw,48px); height:100%; color:#17191C; background:linear-gradient(135deg,#FFFFFF,#F3F4F5); text-align:left; }
.rns-scene-fallback>span { font-size:12px; line-height:1.7; }
.rns-scene-fallback strong { font-size:clamp(28px,3.7vw,56px); font-weight:500; line-height:1.12; letter-spacing:-.05em; overflow-wrap:anywhere; }
.rns-scene-peek { position:absolute; z-index:1; top:50%; width:22%; padding:0; border:1px solid var(--brand-border); border-radius:10px; overflow:hidden; background:var(--brand-background); color:var(--brand-text); opacity:.65; box-shadow:0 25px 45px #0008; transition:transform 450ms cubic-bezier(.16,1,.3,1),border-color 180ms,opacity 180ms; }
.rns-scene-peek-left { left:4%; transform:translateY(-50%) rotateY(30deg) rotateZ(-6deg); }
.rns-scene-peek-right { right:4%; transform:translateY(-50%) rotateY(-30deg) rotateZ(6deg); }
.rns-scene-peek>span { display:block; padding:10px 12px; font-size:12px; text-align:left; }
.rns-scene-peek .rns-scene-fallback strong { font-size:clamp(20px,2.2vw,32px); }
.rns-scene-peek .rns-scene-fallback { padding:20px; }
.rns-scene-peek:hover { z-index:4; opacity:1; border-color:var(--brand-accent); transform:translateY(-50%) rotateY(0) rotateZ(0) scale(1.04); }
.rns-scene-peek:focus-visible { z-index:4; }
.rns-showcase-caption { display:flex; align-items:center; justify-content:space-between; gap:40px; padding-block:14px 28px; }
.rns-showcase-caption h2 { font-size:30px; letter-spacing:-.045em; }
.rns-showcase-caption p { font-size:14px; line-height:1.7; margin-top:8px; color:var(--brand-muted); max-width:65ch; }
.rns-showcase-caption a { flex-shrink:0; }
.rns-showcase-tabs { display:flex; gap:28px; overflow-x:auto; scrollbar-width:none; padding-block:18px 12px; }
.rns-showcase-tabs::-webkit-scrollbar { display:none; }
.rns-showcase-tabs button:focus-visible { outline-offset:-4px; }
.rns-showcase-tabs button { flex-shrink:0; white-space:nowrap; min-height:44px; padding:12px 0; background:transparent; color:var(--brand-muted); font-size:13px; border:0; border-bottom:2px solid transparent; border-radius:0; transition:color 180ms,border-color 180ms; }
.rns-showcase-tabs button:hover { color:var(--brand-text); border-color:var(--brand-text); }
.rns-showcase-tabs button[aria-selected="true"] { color:var(--brand-accent); border-color:var(--brand-accent); }
.rns-sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.rns-about { background:var(--brand-surface); }
.rns-about-inner { display:grid; grid-template-columns:1fr 1fr; gap:clamp(40px,7vw,110px); padding-block:105px; }
.rns-section-label { display:block; font-size:12px; line-height:1.5; margin-bottom:28px; color:var(--brand-muted); }
.rns-about h2 { font-size:clamp(46px,5.2vw,76px); line-height:1.02; }
.rns-about-copy { max-width:48ch; }
.rns-about-copy p:first-child { font-family:var(--font-newsreader),Georgia,serif; font-size:clamp(30px,3.4vw,48px); line-height:1.18; letter-spacing:-.025em; }
.rns-about-copy p+p { font-size:16px; line-height:1.75; margin-top:28px; }
.rns-about-copy .rns-text-link { margin-top:24px; }
.rns-about a:focus-visible { outline-color:#17191C; }
.rns-work { padding-block:105px 90px; }
.rns-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:32px; margin-bottom:52px; }
.rns-section-heading h2 { font-size:clamp(44px,4.6vw,70px); line-height:1.04; }
.rns-section-heading p { max-width:29ch; margin-top:14px; font-size:17px; line-height:1.6; color:var(--brand-muted); }
.rns-project-count { font-size:12px; color:var(--brand-muted); flex-shrink:0; padding-bottom:5px; }
.rns-project-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px 40px; }
.rns-project { min-width:0; }
.rns-project-link { display:block; }
.rns-project-image { overflow:hidden; border-radius:12px; background:var(--brand-surface); --theme-surface:var(--brand-surface); --theme-text:var(--brand-text); --theme-muted:var(--brand-muted); --theme-accent:var(--brand-accent-2); --theme-radius:0px; }
.rns-project-image>div { transition:transform 650ms cubic-bezier(.16,1,.3,1); }
.rns-project-link:hover .rns-project-image>div { transform:scale(1.03); }
.rns-project-link:focus-visible .rns-project-image>div { transform:scale(1.015); }
.rns-project-copy { padding-top:24px; }
.rns-project-meta { display:flex; gap:20px; justify-content:space-between; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-project-title { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; margin-top:14px; }
.rns-project-title h3 { font-size:clamp(28px,2.7vw,40px); line-height:1.13; }
.rns-project-arrow { display:grid; place-items:center; width:40px; height:40px; border:1px solid var(--brand-border); border-radius:50%; flex-shrink:0; font-family:Arial,sans-serif; font-size:24px; transition:background 180ms,transform 280ms; }
.rns-project-link:hover .rns-project-arrow { background:var(--brand-accent); border-color:#17191C; color:#17191C; transform:rotate(8deg); }
.rns-project-copy>p { font-size:16px; line-height:1.65; color:var(--brand-muted); margin-top:14px; max-width:46ch; }
.rns-project-tags { display:flex; flex-wrap:wrap; gap:8px 16px; font-size:11px; line-height:1.6; color:var(--brand-muted); margin-top:22px!important; }
.rns-project-wide { grid-column:1/-1; }
.rns-project-wide .rns-project-link { display:grid; grid-template-columns:1.5fr 1fr; align-items:center; gap:clamp(32px,5vw,76px); background:var(--brand-surface); border-radius:16px; overflow:hidden; }
.rns-project-wide .rns-project-image { border-radius:0; }
.rns-project-wide .rns-project-copy { padding:32px 40px 32px 0; }
.rns-project-wide .rns-project-title h3 { font-size:clamp(40px,3.8vw,58px); }
.rns-project-wide:nth-child(even) .rns-project-image { grid-column:2; grid-row:1; }
.rns-project-wide:nth-child(even) .rns-project-copy { grid-column:1; grid-row:1; padding:32px 0 32px 40px; }
.rns-project-wide:nth-child(even) .rns-project-link { grid-template-columns:1fr 1.5fr; }
.rns-empty-work { padding:48px 0; font-size:22px; line-height:1.6; }
.rns-empty-work a { text-decoration:underline; }
.rns-skills { padding-block:48px 110px; }
.rns-capabilities { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; }
.rns-capabilities>li { border-top:1px solid var(--brand-border); padding-block:28px; }
.rns-capabilities h3 { font-size:32px; }
.rns-capabilities p { font-size:15px; line-height:1.75; margin-top:22px; }
.rns-capabilities span { display:block; margin-top:24px; font-size:11px; line-height:1.7; color:var(--brand-muted); }
.rns-contact { position:relative; overflow:hidden; background:var(--brand-background); }
.rns-contact::before { display:none; }
.rns-contact-inner { position:relative; display:grid; grid-template-columns:1.5fr 1fr; gap:clamp(40px,5vw,72px); align-items:end; padding-block:115px; }
.rns-contact h2 { font-family:var(--font-newsreader),Georgia,serif; font-size:clamp(62px,7vw,112px); font-weight:450; letter-spacing:-.04em; line-height:1; }
.rns-contact-copy { padding-bottom:8px; }
.rns-contact-copy p { font-size:17px; line-height:1.7; max-width:32ch; color:var(--brand-muted); margin-bottom:28px; }
.rns-footer { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; padding-block:24px; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-footer a { display:inline-flex; align-items:center; gap:10px; min-height:44px; }
:root:has(.rns-landing) .intro,:root:has(.rns-landing) .cursor-dot { display:none!important; }
:root:has(.rns-landing) .skip-link { background:#17191C; color:#FFC900; }
:root:has(.rns-landing) .skip-link:focus-visible { outline-color:#FFC900; }
@keyframes rns-signal { to { stroke-dashoffset:-1730; } }
@keyframes rns-scene-arrive { from { transform:translate(calc(-50% + 24px),calc(-50% + 8px)) rotateY(-4deg); } to { transform:translate(-50%,-50%); } }
@keyframes rns-reveal { from { transform:translateY(24px); } to { transform:translateY(0); } }
.rns-hero h1 { animation:rns-reveal 800ms cubic-bezier(.16,1,.3,1) both; }
@keyframes rns-reading-progress { from { transform:scaleX(0); } to { transform:scaleX(1); } }
@supports (animation-timeline:view()) {
 .rns-landing [data-reveal] { animation:rns-reveal linear both; animation-timeline:view(); animation-range:entry 0% entry 100%; }
 .rns-landing::before { content:""; position:fixed; z-index:60; left:0; top:0; width:100%; height:3px; background:#FFC900; transform-origin:left; animation:rns-reading-progress linear both; animation-timeline:scroll(root); pointer-events:none; }
 .rns-project-image { animation:rns-project-depth linear both; animation-timeline:view(); animation-range:entry 0% entry 100%; }
}
@keyframes rns-project-depth { from { transform:perspective(1000px) rotateX(3deg); } to { transform:perspective(1000px) rotateX(0); } }
:root:has(.rns-landing)::view-transition-old(root) { animation-duration:160ms; }
:root:has(.rns-landing)::view-transition-new(root) { animation-duration:240ms; }
@media (max-width:1000px) {
 .rns-hero h1 { font-size:clamp(54px,7.2vw,72px); }
 .rns-hero-intro { gap:40px; padding-block:40px 54px; }
 .rns-scene { height:clamp(350px,53vw,530px); }
 .rns-scene-front { width:76%; }
 .rns-about-inner { gap:40px; padding-block:80px; }
 .rns-capabilities { grid-template-columns:1fr 1fr; }
 .rns-project-wide .rns-project-copy { padding-right:28px; }
 .rns-project-wide:nth-child(even) .rns-project-copy { padding-left:28px; }
}
@media (max-width:700px) {
 .rns-shell { width:calc(100% - 40px); }
 .rns-header { padding-block:14px; }
 .rns-header-note { display:none; }
 .rns-header nav { gap:22px; }
 .rns-header a { font-size:12px; }
 .rns-hero-intro { grid-template-columns:1fr; gap:0; padding-block:20px 32px; }
 .rns-logo-stage { width:140px; grid-column:1; grid-row:1; justify-self:start; margin-bottom:22px; }
 .rns-hero-role { grid-row:2; font-size:11px; margin-bottom:18px!important; }
 .rns-hero h1 { grid-row:3; font-size:clamp(48px,12.2vw,76px); }
 .rns-hero-description { grid-column:1; grid-row:4; font-size:16px; margin-top:22px!important; }
 .rns-hero-actions { grid-row:5; gap:22px; margin-top:24px; }
 .rns-button { padding-inline:20px; gap:18px; font-size:12px; }
 .rns-text-link { font-size:12px; }
 .rns-showcase { padding-bottom:36px; }
 .rns-showcase-top { flex-wrap:wrap; gap:12px; font-size:11px; }
 .rns-showcase-controls { gap:8px; }
 .rns-showcase-controls button { font-size:10px; padding-inline:12px; }
 .rns-showcase-position { min-width:40px; font-size:10px; }
 .rns-scene { height:clamp(275px,74vw,430px); perspective:900px; }
 .rns-scene-front { width:calc(100% - 40px); max-width:560px; }
 .rns-scene-chrome { padding:8px 10px; font-size:9px; }
 .rns-scene-chrome>span:first-child { display:none; }
 .rns-scene-peek { display:none; }
 .rns-scene-peek-left { left:-5%; }
 .rns-scene-peek-right { right:-5%; }
 .rns-scene-peek>span { font-size:10px; padding:7px; }
 .rns-scene-fallback { padding:18px; }
 .rns-scene-fallback strong { font-size:30px; }
 .rns-scene-fallback>span { font-size:10px; }
 .rns-scene-peek .rns-scene-fallback strong { font-size:18px; }
 .rns-scene-peek .rns-scene-fallback { padding:12px; }
 .rns-showcase-caption { display:block; padding-block:4px 22px; }
 .rns-showcase-caption h2 { font-size:28px; }
 .rns-showcase-caption p { font-size:14px; }
 .rns-showcase-caption a { margin-top:12px; }
 .rns-showcase-tabs { gap:24px; padding-top:14px; }
 .rns-showcase-tabs button { font-size:12px; padding-inline:0; }
 .rns-section-label { font-size:11px; margin-bottom:24px; }
 .rns-about-inner { grid-template-columns:1fr; gap:32px; padding-block:64px; }
 .rns-about h2 { font-size:48px; }
 .rns-about-copy p:first-child { font-size:34px; }
 .rns-about-copy p+p { margin-top:24px; }
 .rns-work { padding-block:64px; }
 .rns-section-heading { gap:20px; margin-bottom:36px; }
 .rns-section-heading h2 { font-size:42px; }
 .rns-work .rns-section-heading { display:block; }
 .rns-work .rns-project-count { display:block; margin-top:18px; }
 .rns-section-heading p { font-size:16px; }
 .rns-project-count { font-size:10px; }
 .rns-project-grid { grid-template-columns:1fr; gap:40px; }
 .rns-project-wide .rns-project-link { display:block; border-radius:12px; }
 .rns-project-wide .rns-project-copy,.rns-project-wide:nth-child(even) .rns-project-copy { padding:28px; }
 .rns-project-title h3,.rns-project-wide .rns-project-title h3 { font-size:32px; }
 .rns-project-copy { padding-top:20px; }
 .rns-project-arrow { width:36px; height:36px; font-size:21px; }
 .rns-skills { padding-block:30px 64px; }
 .rns-skills .rns-section-heading { display:block; }
 .rns-capabilities { grid-template-columns:1fr; gap:8px; }
 .rns-capabilities h3 { font-size:30px; }
 .rns-capabilities p { margin-top:18px; font-size:16px; }
 .rns-contact-inner { grid-template-columns:1fr; gap:36px; padding-block:72px; }
 .rns-contact h2 { font-size:60px; }
 .rns-contact-copy p { font-size:16px; }
 .rns-contact::before { right:-450px; top:-520px; }
 .rns-footer { font-size:10px; padding-block:16px; gap:6px 16px; }
 .rns-footer>span:nth-child(2) { display:none; }
}
.rns-landing[data-motion-enabled="false"] .rns-scene-signal,.rns-landing[data-motion-enabled="false"] .rns-scene-front,.rns-landing[data-motion-enabled="false"] [data-reveal],.rns-landing[data-motion-enabled="false"] .rns-hero h1,.rns-landing[data-motion-enabled="false"] .rns-project-image { animation:none!important; }
.rns-landing[data-motion-enabled="false"] .rns-button { transform:none!important; }
.rns-landing[data-motion-enabled="false"]::before { display:none; }
:root:has(.rns-landing[data-motion-enabled="false"])::view-transition-old(root),:root:has(.rns-landing[data-motion-enabled="false"])::view-transition-new(root) { animation:none!important; }
@media (prefers-reduced-motion:reduce) {
 .rns-hero h1,.rns-scene-signal,.rns-scene-front,.rns-project-image { animation:none!important; }
 .rns-landing [data-reveal] { animation:none!important; transform:none; }
 .rns-landing::before { display:none; }
 .rns-button,.rns-project-image>div,.rns-project-arrow { transform:none!important; transition:none!important; }
 .rns-scene-front { transform:translate(-50%,-50%)!important; transition:none!important; }
 .rns-scene-peek { transition:none!important; }
 .rns-scene-peek:hover { transform:translateY(-50%); }
 :root:has(.rns-landing)::view-transition-old(root),:root:has(.rns-landing)::view-transition-new(root) { animation:none!important; }
}
`;
