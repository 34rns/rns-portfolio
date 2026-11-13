export const professionalLandingStyles = `
.rns-landing {
  --theme-bg:var(--brand-background); --theme-surface:var(--brand-surface);
  --theme-text:var(--brand-text); --theme-muted:var(--brand-muted);
  --theme-accent:var(--brand-accent-2); --theme-accent-text:var(--brand-background);
  --theme-line:var(--brand-border); --theme-radius:12px;
  background:var(--brand-background); color:var(--brand-text);
  font-family:var(--font-archivo),Arial,sans-serif; overflow:clip; isolation:isolate;
}
.rns-landing *, .rns-landing *::before, .rns-landing *::after { box-sizing:border-box; }
.rns-landing h1,.rns-landing h2,.rns-landing h3,.rns-landing p,.rns-landing figure { margin:0; }
.rns-landing ul { margin:0; padding:0; list-style:none; }
.rns-landing h1,.rns-landing h2,.rns-landing h3 {
  font-weight:650; font-variation-settings:"wdth" 92; letter-spacing:-.055em;
  text-wrap:balance; overflow-wrap:break-word;
}
.rns-landing a { color:inherit; text-decoration:none; }
.rns-landing a:focus-visible,.rns-landing button:focus-visible { outline:3px solid var(--brand-accent-2); outline-offset:5px; }
.rns-landing [data-brand-tone="dark"] a:focus-visible,.rns-landing [data-brand-tone="dark"] button:focus-visible { outline-color:var(--brand-accent); }
.rns-landing [data-brand-tone] { color:var(--brand-text); }
.rns-landing ::selection { background:var(--brand-accent); color:#17191C; }
.rns-shell { width:min(calc(100% - clamp(40px,9vw,160px)),1440px); margin-inline:auto; }
.rns-landing section[id] { scroll-margin-top:32px; }
.rns-opening { background:#000; }
.rns-header { display:flex; align-items:center; justify-content:space-between; gap:28px; padding-block:24px; }
.rns-header-note { max-width:25ch; font-size:12px; line-height:1.5; color:var(--brand-muted); }
.rns-header nav { display:flex; align-items:center; justify-content:flex-end; gap:clamp(18px,2.8vw,42px); margin-left:auto; }
.rns-header a { display:inline-flex; gap:6px; align-items:center; min-height:44px; font-size:14px; font-weight:500; position:relative; }
.rns-header a::after { content:""; position:absolute; bottom:7px; left:0; right:0; height:2px; background:var(--brand-accent); transform:scaleX(0); transform-origin:left; transition:transform 220ms ease; }
.rns-header a:hover::after { transform:scaleX(1); }
.rns-hero { display:grid; grid-template-columns:1fr 1.12fr; gap:clamp(28px,3vw,60px); align-items:center; padding-block:36px 40px; }
.rns-hero-copy { min-width:0; position:relative; z-index:2; }
.rns-hero-role { font-size:13px; line-height:1.5; color:var(--brand-muted); margin-bottom:30px!important; }
.rns-hero h1 { font-size:clamp(56px,6.1vw,106px); font-weight:720; font-variation-settings:"wdth" 88; letter-spacing:-.065em; line-height:1.02; }
.rns-hero h1 { white-space:nowrap; }
.rns-hero-description { max-width:39ch; font-size:17px; line-height:1.7; color:var(--brand-muted); margin-top:28px!important; }
.rns-hero-actions { display:flex; flex-wrap:wrap; align-items:center; gap:28px; margin-top:32px; }
.rns-button {
  display:inline-flex; align-items:center; justify-content:center; gap:24px; min-height:54px;
  padding:14px 24px; border:1px solid #17191C; border-radius:100px;
  background:var(--brand-accent); color:#17191C!important; font-size:14px; font-weight:600;
  transform:translate(var(--magnet-x,0px),var(--magnet-y,0px));
  transition:transform 260ms cubic-bezier(.16,1,.3,1),box-shadow 180ms ease;
}
.rns-button span { font-size:21px; font-weight:400; line-height:1; }
.rns-button:hover { box-shadow:0 4px 0 var(--brand-text); }
.rns-text-link { display:inline-flex; gap:12px; align-items:center; min-height:44px; font-size:14px; border-bottom:1px solid currentColor; transition:border-color 180ms; }
.rns-text-link:hover { border-color:var(--brand-accent); }
.rns-stage-wrap { min-width:0; }
.rns-stage { position:relative; aspect-ratio:1.14; --stage-x:0px; --stage-y:0px; }
.rns-stage-orbit { position:absolute; inset:0; width:100%; height:100%; stroke:var(--brand-border); stroke-width:1; pointer-events:none; }
.rns-stage-signal { stroke:var(--brand-accent); stroke-width:2; stroke-dasharray:14 450; animation:rns-signal 9s linear infinite paused; }
.rns-stage-orbit circle { fill:var(--brand-accent); stroke:none; }
.rns-logo-stage { position:absolute; left:11%; top:36%; width:80%; aspect-ratio:1400/556; }
.rns-logo-stage img { display:block; width:100%; height:auto; }
.rns-stage-tile { position:absolute; width:31%; z-index:2; transform:translate(calc(var(--stage-x)*var(--depth)),calc(var(--stage-y)*var(--depth))) rotate(var(--tilt)); transition:transform 650ms cubic-bezier(.16,1,.3,1); }
.rns-stage-tile-1 { left:8%; top:6%; --tilt:-9deg; --depth:.7; --drift:8px; }
.rns-stage-tile-2 { right:6%; top:8%; --tilt:8deg; --depth:-.8; --drift:-7px; }
.rns-stage-tile-3 { left:3%; bottom:8%; --tilt:-5deg; --depth:-.5; --drift:-6px; }
.rns-stage-tile-4 { right:6%; bottom:4%; --tilt:7deg; --depth:1.1; --drift:9px; }
.rns-stage-link { display:block; background:var(--brand-background); border:1px solid var(--brand-border); border-radius:7px; overflow:hidden; box-shadow:0 12px 30px #0006; animation:rns-drift 8s ease-in-out infinite alternate paused; transition:scale 260ms cubic-bezier(.16,1,.3,1),border-color 180ms; }
.rns-stage-tile:nth-of-type(3) .rns-stage-link { animation-delay:-3s; }
.rns-stage-tile:nth-of-type(4) .rns-stage-link { animation-delay:-5s; }
.rns-stage-tile:nth-of-type(5) .rns-stage-link { animation-delay:-1s; }
.rns-stage[data-running="true"] .rns-stage-link,.rns-stage[data-running="true"] .rns-stage-signal { animation-play-state:running; }
.rns-stage:focus-within .rns-stage-link,.rns-stage:focus-within .rns-stage-signal { animation-play-state:paused; }
.rns-stage-link:hover,.rns-stage-link:focus-visible { scale:1.07; border-color:var(--brand-accent); }
.rns-stage:focus-within .rns-stage-tile { transform:rotate(var(--tilt)); }
.rns-stage-image { position:relative; aspect-ratio:16/10; overflow:hidden; background:var(--brand-surface); }
.rns-stage-link>span { display:flex; justify-content:space-between; gap:6px; padding:10px 11px; font-size:11px; line-height:1.5; }
.rns-stage-caption { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:8px; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-stage-caption button { display:flex; align-items:center; justify-content:center; gap:9px; min-height:44px; width:124px; flex-shrink:0; font:inherit; color:var(--brand-text); border:1px solid var(--brand-border); border-radius:100px; background:transparent; cursor:pointer; }
.rns-stage-caption button:hover:not(:disabled) { border-color:var(--brand-accent); }
.rns-stage-caption button:disabled { color:var(--brand-muted); cursor:default; }
.rns-motion-indicator { display:flex; align-items:center; gap:2px; height:12px; }
.rns-motion-indicator i { display:block; width:2px; height:8px; background:var(--brand-accent); }
.rns-motion-indicator i:nth-child(2) { height:12px; }
.rns-opening-foot { display:flex; align-items:center; gap:36px; padding-block:24px; border-top:1px solid var(--brand-border); color:var(--brand-muted); font-size:11px; }
.rns-opening-foot a { margin-left:auto; min-height:44px; display:flex; gap:20px; align-items:center; color:var(--brand-text); }
.rns-about { display:grid; grid-template-columns:1fr 1fr; gap:clamp(40px,7vw,110px); padding-block:110px 100px; }
.rns-section-label { display:block; font-size:12px; line-height:1.5; margin-bottom:28px; color:var(--brand-muted); }
.rns-about h2 { font-size:clamp(38px,4.1vw,62px); line-height:1.08; }
.rns-about-copy { max-width:48ch; }
.rns-about-copy p:first-child { font-family:var(--font-newsreader),Georgia,serif; font-size:clamp(30px,3.1vw,46px); line-height:1.2; letter-spacing:-.025em; }
.rns-about-copy p+p { margin-top:30px; font-size:17px; line-height:1.75; color:var(--brand-muted); }
.rns-about-copy .rns-text-link { margin-top:24px; }
.rns-work { padding-block:60px 100px; border-top:1px solid var(--brand-border); }
.rns-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:30px; margin-bottom:52px; }
.rns-section-heading h2 { font-size:clamp(46px,5.1vw,76px); line-height:1.02; }
.rns-section-heading p { margin-top:14px; max-width:28ch; font-size:17px; line-height:1.6; color:var(--brand-muted); }
.rns-project-count { flex-shrink:0; font-size:12px; color:var(--brand-muted); padding-bottom:5px; }
.rns-project-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px 40px; }
.rns-project { min-width:0; }
.rns-project-link { display:block; }
.rns-project-image { overflow:hidden; border-radius:12px; background:var(--brand-surface); --theme-surface:var(--brand-surface); --theme-text:var(--brand-text); --theme-muted:var(--brand-muted); --theme-accent:var(--brand-accent-2); --theme-radius:0px; }
.rns-project-image>div { transition:transform 650ms cubic-bezier(.16,1,.3,1); }
.rns-project-link:hover .rns-project-image>div { transform:scale(1.035); }
.rns-project-link:focus-visible .rns-project-image>div { transform:scale(1.015); }
.rns-project-copy { padding-top:24px; }
.rns-project-meta { display:flex; gap:20px; justify-content:space-between; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-project-title { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-top:12px; }
.rns-project-title h3 { font-size:clamp(28px,2.7vw,40px); line-height:1.13; }
.rns-project-arrow { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border:1px solid var(--brand-border); border-radius:50%; font-family:Arial,sans-serif; font-size:24px; transition:background 180ms,color 180ms,transform 280ms; }
.rns-project-link:hover .rns-project-arrow { background:var(--brand-accent); color:#17191C; border-color:#17191C; transform:rotate(8deg); }
.rns-project-copy>p { font-size:16px; line-height:1.65; color:var(--brand-muted); margin-top:12px; max-width:46ch; }
.rns-project-tags { display:flex; flex-wrap:wrap; gap:8px 16px; margin-top:22px!important; font-size:11px; line-height:1.6; color:var(--brand-muted); }
.rns-project-lead { grid-column:1/-1; }
.rns-project-lead .rns-project-link { display:grid; grid-template-columns:1.4fr 1fr; border-radius:16px; overflow:hidden; background:var(--brand-text); }
.rns-project-lead .rns-project-image { border-radius:0; }
.rns-project-lead .rns-project-image>div { height:100%; min-height:390px; }
.rns-project-lead .rns-project-copy { display:flex; flex-direction:column; justify-content:center; padding:clamp(28px,3.4vw,52px); }
.rns-project-lead .rns-project-title { margin-top:24px; }
.rns-project-lead .rns-project-title h3 { font-size:clamp(36px,3.5vw,52px); }
.rns-project-lead .rns-project-copy>p { font-size:18px; }
.rns-project-lead .rns-project-arrow { display:none; }
.rns-project-lead .rns-project-tags { margin-top:28px!important; }
.rns-project-tail { grid-column:1/-1; }
.rns-project-tail .rns-project-link { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
.rns-project-tail .rns-project-image { grid-column:2; grid-row:1; }
.rns-project-tail .rns-project-copy { grid-column:1; grid-row:1; padding:24px 0; }
.rns-project-tail .rns-project-title h3 { font-size:clamp(36px,3.5vw,52px); }
.rns-empty-work { padding:48px 0; font-size:22px; line-height:1.6; }
.rns-empty-work a { text-decoration:underline; }
.rns-skills { padding-block:60px 120px; }
.rns-skills .rns-section-heading { margin-bottom:64px; }
.rns-capabilities>li { display:grid; grid-template-columns:1fr 1fr; gap:clamp(40px,7vw,110px); border-top:1px solid var(--brand-border); padding-block:34px; }
.rns-capabilities h3 { font-size:clamp(28px,2.7vw,40px); line-height:1.15; }
.rns-capabilities p { font-size:17px; line-height:1.75; max-width:46ch; }
.rns-capabilities span { display:block; margin-top:20px; font-size:11px; line-height:1.7; color:var(--brand-muted); }
.rns-contact { position:relative; background:var(--brand-background); overflow:hidden; }
.rns-contact::before,.rns-contact::after { content:""; position:absolute; width:660px; height:340px; right:-200px; top:-190px; border:1px solid var(--brand-accent); border-radius:50%; transform:rotate(-28deg); pointer-events:none; }
.rns-contact::after { top:-150px; right:-250px; transform:rotate(-16deg); }
.rns-contact-inner { position:relative; display:grid; grid-template-columns:1.5fr 1fr; gap:clamp(40px,5vw,72px); align-items:end; padding-block:120px; }
.rns-contact h2 { font-size:clamp(54px,6.5vw,100px); line-height:1.02; }
.rns-contact-copy { padding-bottom:6px; }
.rns-contact-copy p { max-width:32ch; color:var(--brand-muted); font-size:17px; line-height:1.7; margin-bottom:28px; }
.rns-footer { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; padding-block:24px; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-footer a { display:inline-flex; align-items:center; gap:10px; min-height:44px; }
:root:has(.rns-landing) .intro,:root:has(.rns-landing) .cursor-dot { display:none!important; }
:root:has(.rns-landing) .skip-link { background:#17191C; color:#FFC900; }
:root:has(.rns-landing) .skip-link:focus-visible { outline-color:#FFC900; }
@keyframes rns-drift { from { transform:translateY(0); } to { transform:translateY(var(--drift)); } }
@keyframes rns-signal { to { stroke-dashoffset:-464; } }
@keyframes rns-reveal { from { transform:translateY(24px); } to { transform:translateY(0); } }
.rns-hero-copy { animation:rns-reveal 800ms cubic-bezier(.16,1,.3,1) both; }
@keyframes rns-reading-progress { from { transform:scaleX(0); } to { transform:scaleX(1); } }
@supports (animation-timeline:view()) {
  .rns-landing [data-reveal] { animation:rns-reveal linear both; animation-timeline:view(); animation-range:entry 0% entry 100%; }
  .rns-landing::before { content:""; position:fixed; z-index:60; left:0; top:0; width:100%; height:3px; background:#FFC900; transform-origin:left; animation:rns-reading-progress linear both; animation-timeline:scroll(root); pointer-events:none; }
}
:root:has(.rns-landing)::view-transition-old(root) { animation-duration:160ms; }
:root:has(.rns-landing)::view-transition-new(root) { animation-duration:240ms; }
@media (max-width:1100px) {
  .rns-hero h1 { font-size:clamp(46px,6vw,66px); }
  .rns-project-lead .rns-project-link { grid-template-columns:1.1fr 1fr; }
  .rns-project-lead .rns-project-image>div { min-height:350px; }
  .rns-stage-link>span { padding:8px; font-size:10px; }
}
@media (max-width:900px) {
  .rns-hero { grid-template-columns:1fr; padding-top:28px; gap:40px; }
  .rns-hero h1 { font-size:clamp(54px,10vw,82px); }
  .rns-hero-description { max-width:48ch; }
  .rns-stage-wrap { width:min(100%,620px); margin-inline:auto; }
  .rns-stage { aspect-ratio:1.3; }
  .rns-header-note { max-width:20ch; }
  .rns-about { gap:40px; padding-block:80px; }
}
@media (max-width:700px) {
  .rns-shell { width:calc(100% - 40px); }
  .rns-header { padding-block:14px; }
  .rns-header-note { display:none; }
  .rns-header nav { gap:22px; }
  .rns-header a { font-size:12px; }
  .rns-hero { padding-block:26px 28px; gap:32px; }
  .rns-hero-role { font-size:11px; margin-bottom:22px!important; }
  .rns-hero h1 { font-size:clamp(48px,12.3vw,76px); }
  .rns-hero-description { margin-top:22px!important; font-size:16px; line-height:1.65; }
  .rns-hero-actions { margin-top:26px; gap:22px; }
  .rns-button { gap:18px; padding-inline:20px; font-size:12px; }
  .rns-text-link { font-size:12px; }
  .rns-stage { aspect-ratio:1.1; }
  .rns-stage-link>span { font-size:9px; padding:7px; }
  .rns-stage-caption { margin-top:14px; font-size:10px; gap:12px; }
  .rns-stage-caption>span { max-width:20ch; }
  .rns-stage-caption button { width:116px; }
  .rns-opening-foot { padding-block:14px; gap:20px; font-size:10px; }
  .rns-opening-foot>span:nth-child(2) { display:none; }
  .rns-opening-foot a { gap:12px; }
  .rns-about { grid-template-columns:1fr; gap:32px; padding-block:64px; }
  .rns-section-label { font-size:11px; margin-bottom:22px; }
  .rns-about h2 { font-size:42px; }
  .rns-about-copy p:first-child { font-size:32px; }
  .rns-about-copy p+p { font-size:16px; margin-top:24px; }
  .rns-work { padding-block:48px 64px; }
  .rns-section-heading { gap:20px; margin-bottom:36px; align-items:flex-end; }
  .rns-section-heading h2 { font-size:46px; }
  .rns-section-heading p { font-size:16px; margin-top:18px; }
  .rns-project-count { font-size:10px; }
  .rns-project-grid { grid-template-columns:1fr; gap:40px; }
  .rns-project-lead .rns-project-link { display:block; border-radius:12px; }
  .rns-project-lead .rns-project-image>div { height:auto; min-height:0; }
  .rns-project-lead .rns-project-copy { padding:28px; }
  .rns-project-lead .rns-project-title { margin-top:18px; }
  .rns-project-lead .rns-project-title h3 { font-size:38px; }
  .rns-project-lead .rns-project-copy>p { font-size:16px; }
  .rns-project-tail .rns-project-link { display:block; }
  .rns-project-tail .rns-project-copy { padding-top:20px; }
  .rns-project-tail .rns-project-title h3 { font-size:32px; }
  .rns-project-image { border-radius:10px; }
  .rns-project-copy { padding-top:20px; }
  .rns-project-title h3 { font-size:32px; }
  .rns-project-arrow { width:36px; height:36px; font-size:21px; }
  .rns-skills { padding-block:40px 64px; }
  .rns-skills .rns-section-heading { display:block; margin-bottom:36px; }
  .rns-capabilities>li { grid-template-columns:1fr; gap:16px; padding-block:28px; }
  .rns-capabilities h3 { font-size:30px; }
  .rns-capabilities p { font-size:16px; }
  .rns-capabilities span { font-size:10px; }
  .rns-contact-inner { grid-template-columns:1fr; gap:36px; padding-block:72px; }
  .rns-contact h2 { font-size:54px; }
  .rns-contact-copy p { font-size:16px; }
  .rns-contact::before,.rns-contact::after { top:-220px; right:-400px; }
  .rns-footer { font-size:10px; padding-block:16px; gap:6px 16px; }
  .rns-footer>span:nth-child(2) { display:none; }
}
@media (prefers-reduced-motion:reduce) {
  .rns-hero-copy,.rns-stage-link,.rns-stage-signal { animation:none!important; }
  .rns-landing [data-reveal] { animation:none!important; transform:none; }
  .rns-landing::before { display:none; }
  .rns-button,.rns-project-image>div,.rns-project-arrow { transform:none!important; transition:none!important; }
  .rns-stage-tile { transform:rotate(var(--tilt))!important; transition:none!important; }
  .rns-stage-link { scale:1!important; transition:none!important; }
  :root:has(.rns-landing)::view-transition-old(root),:root:has(.rns-landing)::view-transition-new(root) { animation:none!important; }
}
`;
