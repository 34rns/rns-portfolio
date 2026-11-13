export const professionalLandingStyles = `
.rns-landing {
  --theme-bg:var(--brand-background); --theme-surface:var(--brand-surface);
  --theme-text:var(--brand-text); --theme-muted:var(--brand-muted);
  --theme-accent:var(--brand-accent-2); --theme-accent-text:var(--brand-background);
  --theme-line:var(--brand-border); --theme-radius:12px;
  background:var(--brand-background); color:var(--brand-text);
  font-family:var(--font-newsreader),Georgia,serif;
  overflow:clip; isolation:isolate;
}
.rns-landing *, .rns-landing *::before, .rns-landing *::after { box-sizing:border-box; }
.rns-landing [data-brand-tone="dark"] { color:var(--brand-text); }
.rns-landing h1,.rns-landing h2,.rns-landing h3,.rns-landing p,.rns-landing figure { margin:0; }
.rns-landing ul { margin:0; padding:0; list-style:none; }
.rns-landing h1,.rns-landing h2,.rns-landing h3 {
  font-family:var(--font-archivo),Arial,sans-serif; font-variation-settings:"wdth" 100;
  font-weight:600; letter-spacing:-.055em; text-wrap:balance; overflow-wrap:break-word;
}
.rns-landing a { color:inherit; text-decoration:none; }
.rns-landing a:focus-visible { outline:3px solid var(--brand-accent-2); outline-offset:5px; }
.rns-landing [data-brand-tone="dark"] a:focus-visible { outline-color:var(--brand-accent); }
.rns-landing ::selection { background:var(--brand-accent); color:#17191C; }
.rns-shell { width:min(calc(100% - clamp(40px,9vw,144px)),1280px); margin-inline:auto; }
.rns-landing section[id] { scroll-margin-top:32px; }
.rns-header { display:flex; align-items:center; justify-content:space-between; gap:24px; padding-block:26px; }
.rns-header .rns-brand { flex-shrink:0; gap:14px; }
.rns-brand img { display:block; width:72px; height:29px; background:#000; border-radius:4px; }
.rns-header .rns-brand::after { display:none; }
.rns-wordmark { font-size:13px; }
.rns-landing [data-brand-tone] { color:var(--brand-text); }
.rns-header nav { display:flex; align-items:center; justify-content:flex-end; gap:clamp(16px,2.5vw,36px); margin-left:auto; }
.rns-header a {
  display:inline-flex; gap:6px; align-items:center; min-height:44px;
  font-family:var(--font-archivo),Arial,sans-serif; font-size:14px; font-weight:500;
  position:relative;
}
.rns-header a::after { content:""; position:absolute; bottom:7px; left:0; right:0; height:2px; background:var(--brand-text); transform:scaleX(0); transform-origin:left; transition:transform 220ms ease; }
.rns-header a:hover::after { transform:scaleX(1); }
.rns-hero { display:grid; grid-template-columns:1.05fr 1fr; gap:clamp(32px,6vw,80px); align-items:center; margin-top:30px; padding-bottom:100px; }
.rns-hero-copy { min-width:0; }
.rns-hero-role { font-family:var(--font-archivo),Arial,sans-serif; font-size:14px; line-height:1.5; margin-bottom:26px!important; }
.rns-hero h1 { font-size:clamp(50px,5.9vw,90px); line-height:1.03; }
.rns-hero-description { max-width:39ch; font-size:21px; line-height:1.55; color:var(--brand-muted); margin-top:28px!important; }
.rns-hero-actions { display:flex; flex-wrap:wrap; align-items:center; gap:28px; margin-top:32px; }
.rns-button {
  display:inline-flex; align-items:center; justify-content:center; gap:24px; min-height:54px;
  padding:14px 24px; border:1px solid #17191C; border-radius:100px;
  background:var(--brand-accent); color:#17191C!important;
  font-family:var(--font-archivo),Arial,sans-serif; font-size:14px; font-weight:600;
  transform:translate(var(--magnet-x,0px),var(--magnet-y,0px));
  transition:transform 260ms cubic-bezier(.16,1,.3,1),box-shadow 180ms ease;
}
.rns-button span { font-size:21px; font-weight:400; line-height:1; }
.rns-button:hover { box-shadow:0 4px 0 #17191C; }
.rns-text-link { display:inline-flex; gap:12px; align-items:center; min-height:44px; font-family:var(--font-archivo),Arial,sans-serif; font-size:14px; border-bottom:1px solid currentColor; transition:opacity 180ms; }
.rns-text-link:hover { opacity:.7; }
.rns-latest { display:flex; flex-wrap:wrap; gap:16px; margin-top:36px; font-family:var(--font-archivo),Arial,sans-serif; font-size:12px; line-height:1.8; }
.rns-latest>span { color:var(--brand-muted); }
.rns-latest a { text-decoration:underline; text-underline-offset:4px; }
.rns-logo-stage { position:relative; aspect-ratio:1.04; overflow:hidden; border-radius:28px; background:#000; display:grid; align-items:center; }
.rns-logo-mount { position:relative; width:92%; margin:auto; z-index:1; }
.rns-logo-mount img { display:block; width:100%; height:auto; }
.rns-logo-stage figcaption { position:absolute; bottom:30px; left:30px; right:30px; display:flex; justify-content:space-between; gap:20px; font-family:var(--font-archivo),Arial,sans-serif; font-size:11px; line-height:1.4; color:var(--brand-muted); }
.rns-logo-pixels { position:absolute; top:30px; right:30px; display:flex; gap:5px; align-items:flex-end; }
.rns-logo-pixels i { display:block; width:5px; height:5px; background:#FFC900; }
.rns-logo-pixels i:nth-child(2) { width:8px; height:8px; }
.rns-logo-pixels i:nth-child(3) { width:12px; height:12px; }
.rns-about { display:grid; grid-template-columns:1fr 1fr; gap:clamp(32px,6vw,80px); padding-block:54px 72px; border-top:1px solid var(--brand-border); }
.rns-section-label { display:block; font-family:var(--font-archivo),Arial,sans-serif; font-size:13px; line-height:1.5; margin-bottom:26px; color:var(--brand-muted); }
.rns-about h2 { font-size:clamp(34px,3.2vw,48px); line-height:1.12; }
.rns-about-copy { font-size:21px; line-height:1.65; max-width:48ch; }
.rns-about-copy p+p { margin-top:20px; color:var(--brand-muted); }
.rns-about-copy .rns-text-link { margin-top:24px; }
.rns-work { padding-block:60px 80px; }
.rns-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:30px; margin-bottom:40px; }
.rns-section-heading h2 { font-size:clamp(40px,4vw,58px); line-height:1.08; }
.rns-section-heading p { margin-top:14px; font-size:19px; line-height:1.5; color:var(--brand-muted); }
.rns-project-count { flex-shrink:0; font-family:var(--font-archivo),Arial,sans-serif; font-size:12px; color:var(--brand-muted); padding-bottom:5px; }
.rns-project-grid { display:grid; grid-template-columns:1fr 1fr; gap:52px 32px; }
.rns-project { min-width:0; }
.rns-project-link { display:block; }
.rns-project-image {
  overflow:hidden; border-radius:16px; background:var(--brand-surface);
  --theme-surface:var(--brand-surface); --theme-text:var(--brand-text);
  --theme-muted:var(--brand-muted); --theme-accent:var(--brand-accent-2);
  --theme-radius:0px;
}
.rns-project-image>div { transition:transform 650ms cubic-bezier(.16,1,.3,1); }
.rns-project-link:hover .rns-project-image>div { transform:scale(1.035); }
.rns-project-link:focus-visible .rns-project-image>div { transform:scale(1.015); }
.rns-project-copy { padding-top:24px; }
.rns-project-meta { display:flex; gap:20px; justify-content:space-between; font-family:var(--font-archivo),Arial,sans-serif; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-project-title { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-top:12px; }
.rns-project-title h3 { font-size:clamp(28px,2.7vw,40px); line-height:1.13; }
.rns-project-arrow { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border:1px solid var(--brand-border); border-radius:50%; font-family:Arial,sans-serif; font-size:24px; transition:background 180ms,color 180ms,transform 280ms; }
.rns-project-link:hover .rns-project-arrow { background:var(--brand-accent); color:#17191C; border-color:#17191C; transform:rotate(8deg); }
.rns-project-copy>p { font-size:18px; line-height:1.55; color:var(--brand-muted); margin-top:12px; max-width:46ch; }
.rns-project-tags { display:flex; flex-wrap:wrap; gap:8px 16px; margin-top:22px!important; font-family:var(--font-archivo),Arial,sans-serif; font-size:11px; line-height:1.6; color:var(--brand-muted); }
.rns-project-lead { grid-column:1/-1; }
.rns-project-lead .rns-project-link { display:grid; grid-template-columns:1.4fr 1fr; border-radius:24px; overflow:hidden; background:var(--brand-text); }
.rns-project-lead .rns-project-image { border-radius:0; }
.rns-project-lead .rns-project-image>div { height:100%; min-height:360px; }
.rns-project-lead .rns-project-copy { display:flex; flex-direction:column; justify-content:center; padding:clamp(28px,3.4vw,52px); }
.rns-project-lead .rns-project-title { margin-top:24px; }
.rns-project-lead .rns-project-title h3 { font-size:clamp(36px,3.5vw,52px); }
.rns-project-lead .rns-project-copy>p { font-size:20px; }
.rns-project-lead .rns-project-arrow { display:none; }
.rns-project-lead .rns-project-tags { margin-top:28px!important; }
.rns-project-tail { grid-column:1/-1; }
.rns-project-tail .rns-project-link { display:grid; grid-template-columns:1fr 1.4fr; gap:52px; align-items:center; }
.rns-project-tail .rns-project-image { grid-column:2; grid-row:1; }
.rns-project-tail .rns-project-copy { grid-column:1; grid-row:1; padding:24px 0; }
.rns-project-tail .rns-project-title h3 { font-size:clamp(36px,3.5vw,52px); }
.rns-empty-work { padding:48px 0; font-size:22px; }
.rns-empty-work a { text-decoration:underline; }
.rns-skills { padding-block:52px 120px; }
.rns-skills .rns-section-heading { margin-bottom:48px; }
.rns-capabilities>li { display:grid; grid-template-columns:1fr 1fr; gap:clamp(32px,6vw,80px); border-top:1px solid var(--brand-border); padding-block:30px; }
.rns-capabilities h3 { font-size:clamp(26px,2.4vw,34px); line-height:1.2; }
.rns-capabilities p { font-size:20px; line-height:1.6; max-width:46ch; }
.rns-capabilities span { display:block; margin-top:16px; font-family:var(--font-archivo),Arial,sans-serif; font-size:11px; line-height:1.7; color:var(--brand-muted); }
.rns-contact { position:relative; background:var(--brand-background); overflow:hidden; }
.rns-contact::before { content:""; position:absolute; width:75%; height:130%; top:-15%; left:55%; background:linear-gradient(110deg,transparent,color-mix(in srgb,var(--brand-accent) 6%,transparent),transparent); transform:rotate(24deg); pointer-events:none; }
.rns-contact-inner { display:grid; grid-template-columns:1.5fr 1fr; gap:clamp(40px,5vw,72px); align-items:end; padding-block:100px; }
.rns-contact h2 { font-size:clamp(46px,5.5vw,78px); line-height:1.06; max-width:15ch; }
.rns-contact-copy { padding-bottom:6px; }
.rns-contact-copy p { max-width:32ch; color:var(--brand-muted); font-size:21px; line-height:1.6; margin-bottom:28px; }
.rns-contact .rns-button:hover { box-shadow:0 4px 0 #FFFFFF; }
.rns-footer { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; padding-block:24px; font-family:var(--font-archivo),Arial,sans-serif; font-size:11px; line-height:1.5; color:var(--brand-muted); }
.rns-footer a { display:inline-flex; align-items:center; gap:10px; min-height:44px; }
:root:has(.rns-landing) .intro,:root:has(.rns-landing) .cursor-dot { display:none!important; }
:root:has(.rns-landing) .skip-link { background:#17191C; color:#FFC900; }
:root:has(.rns-landing) .skip-link:focus-visible { outline-color:#17191C; }
@keyframes rns-reveal { from { opacity:.65; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes rns-arrive { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
.rns-hero h1 { animation:rns-arrive 700ms cubic-bezier(.16,1,.3,1) both; }
.rns-hero-description,.rns-hero-actions,.rns-latest { animation:rns-arrive 650ms 120ms cubic-bezier(.16,1,.3,1) both; }
.rns-logo-stage { animation:rns-arrive 850ms cubic-bezier(.16,1,.3,1) both; }
@keyframes rns-reading-progress { from { transform:scaleX(0); } to { transform:scaleX(1); } }
@supports (animation-timeline:view()) {
  .rns-landing [data-reveal] { animation:rns-reveal linear both; animation-timeline:view(); animation-range:entry 0% entry 100%; }
  .rns-landing::before { content:""; position:fixed; z-index:60; left:0; top:0; width:100%; height:3px; background:#FFC900; transform-origin:left; animation:rns-reading-progress linear both; animation-timeline:scroll(root); pointer-events:none; }
}
:root:has(.rns-landing)::view-transition-old(root) { animation-duration:160ms; }
:root:has(.rns-landing)::view-transition-new(root) { animation-duration:240ms; }
@media (max-width:1000px) {
  .rns-hero { gap:32px; }
  .rns-hero h1 { font-size:clamp(44px,5.9vw,64px); }
  .rns-hero-description { font-size:19px; }
  .rns-logo-stage { aspect-ratio:.88; }
  .rns-logo-stage figcaption { left:22px; right:22px; bottom:22px; font-size:10px; gap:12px; }
  .rns-project-lead .rns-project-link { grid-template-columns:1.1fr 1fr; }
  .rns-project-lead .rns-project-image>div { min-height:330px; }
}
@media (max-width:700px) {
  .rns-shell { width:calc(100% - 40px); }
  .rns-header { padding-block:14px; }
  .rns-header { gap:12px; }
  .rns-wordmark { display:none; }
  .rns-brand img { width:58px; height:24px; }
  .rns-header nav { gap:16px; }
  .rns-header a { font-size:12px; }
  .rns-hero { grid-template-columns:1fr; gap:30px; margin-top:12px; padding-bottom:64px; }
  .rns-logo-stage { grid-row:1; aspect-ratio:1.55; border-radius:20px; }
  .rns-logo-stage figcaption { bottom:18px; left:22px; right:22px; font-size:9px; }
  .rns-logo-pixels { top:20px; right:22px; }
  .rns-logo-mount { width:89%; }
  .rns-hero-role { font-size:11px; margin-bottom:18px!important; }
  .rns-hero h1 { font-size:clamp(44px,11vw,66px); line-height:1.06; }
  .rns-hero-description { margin-top:20px!important; font-size:20px; }
  .rns-hero-actions { margin-top:24px; gap:22px; }
  .rns-button { gap:18px; padding-inline:20px; font-size:12px; }
  .rns-text-link { font-size:12px; }
  .rns-latest { margin-top:26px; font-size:11px; }
  .rns-about { grid-template-columns:1fr; gap:26px; padding-block:34px 44px; }
  .rns-section-label { font-size:11px; margin-bottom:18px; }
  .rns-about h2 { font-size:38px; }
  .rns-about-copy { font-size:20px; }
  .rns-work { padding-block:44px 48px; }
  .rns-section-heading { gap:20px; margin-bottom:28px; align-items:flex-start; }
  .rns-section-heading h2 { font-size:40px; }
  .rns-section-heading p { font-size:18px; margin-top:12px; }
  .rns-project-count { margin-top:12px; font-size:10px; }
  .rns-project-grid { grid-template-columns:1fr; gap:36px; }
  .rns-project-lead .rns-project-link { display:block; border-radius:18px; }
  .rns-project-lead .rns-project-image>div { height:auto; min-height:0; }
  .rns-project-lead .rns-project-copy { padding:28px; }
  .rns-project-lead .rns-project-title { margin-top:16px; }
  .rns-project-lead .rns-project-title h3 { font-size:38px; }
  .rns-project-lead .rns-project-copy>p { font-size:19px; }
  .rns-project-tail .rns-project-link { display:block; }
  .rns-project-tail .rns-project-copy { padding-top:20px; }
  .rns-project-tail .rns-project-title h3 { font-size:32px; }
  .rns-project-image { border-radius:12px; }
  .rns-project-copy { padding-top:20px; }
  .rns-project-title h3 { font-size:32px; }
  .rns-project-arrow { width:36px; height:36px; font-size:21px; }
  .rns-project-copy>p { font-size:19px; }
  .rns-skills { padding-block:40px 60px; }
  .rns-skills .rns-section-heading { display:block; margin-bottom:30px; }
  .rns-capabilities>li { grid-template-columns:1fr; gap:14px; padding-block:24px; }
  .rns-capabilities h3 { font-size:28px; }
  .rns-capabilities p { font-size:19px; }
  .rns-capabilities span { font-size:10px; }
  .rns-contact-inner { grid-template-columns:1fr; gap:34px; padding-block:60px; }
  .rns-contact h2 { font-size:48px; }
  .rns-contact-copy p { font-size:20px; max-width:32ch; }
  .rns-footer { font-size:10px; padding-block:16px; gap:6px 16px; }
  .rns-footer>span:nth-child(2) { display:none; }
}
@media (prefers-reduced-motion:reduce) {
  .rns-hero h1,.rns-hero-description,.rns-hero-actions,.rns-latest,.rns-logo-stage { animation:none!important; }
  .rns-landing [data-reveal] { animation:none!important; opacity:1; transform:none; }
  .rns-landing::before { display:none; }
  .rns-button,.rns-project-image>div,.rns-project-arrow { transform:none!important; transition:none!important; }
  :root:has(.rns-landing)::view-transition-old(root),:root:has(.rns-landing)::view-transition-new(root) { animation:none!important; }
}
`;
