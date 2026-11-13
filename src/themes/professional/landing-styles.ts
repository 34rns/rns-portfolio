export const professionalLandingStyles = `
.rns-landing {
 --theme-bg:var(--brand-background); --theme-surface:var(--brand-surface); --theme-text:var(--brand-text); --theme-muted:var(--brand-muted);
 --theme-accent:var(--brand-accent-2); --theme-accent-text:var(--brand-background); --theme-line:var(--brand-border); --theme-radius:12px;
 color:var(--brand-text); background:var(--brand-background); font-family:var(--font-archivo),Arial,sans-serif; overflow:clip; isolation:isolate;
 --rns-ease:cubic-bezier(.23,1,.32,1);
}
.rns-landing *,.rns-landing *::before,.rns-landing *::after { box-sizing:border-box; }
.rns-landing h1,.rns-landing h2,.rns-landing h3,.rns-landing p,.rns-landing figure { margin:0; }
.rns-landing ul { margin:0; padding:0; list-style:none; }
.rns-landing h1,.rns-landing h2,.rns-landing h3 { font-weight:600; font-variation-settings:"wdth" 96; letter-spacing:-.03em; line-height:1.08; text-wrap:balance; overflow-wrap:anywhere; }
.rns-landing h1>span,.rns-landing h2>span { display:block; }
.rns-landing a { color:inherit; text-decoration:none; }
.rns-landing button { font:inherit; color:inherit; cursor:pointer; }
.rns-landing button:disabled { cursor:default; }
.rns-landing a:focus-visible,.rns-landing button:focus-visible { outline:3px solid var(--brand-accent-2); outline-offset:5px; }
.rns-landing [data-brand-tone="dark"] :is(a,button):focus-visible { outline-color:var(--brand-accent); }
.rns-landing [data-brand-tone] { color:var(--brand-text); }
.rns-landing ::selection { background:var(--brand-accent); color:#17191C; }
.rns-shell { width:min(calc(100% - clamp(40px,8vw,144px)),1440px); margin-inline:auto; }
.rns-landing section[id] { scroll-margin-top:32px; }
.rns-opening,.rns-contact { background:var(--brand-background); }
.rns-header { display:flex; align-items:center; justify-content:space-between; gap:28px; padding-block:20px; }
.rns-header-note { max-width:28ch; font-size:12px; line-height:1.5; color:var(--brand-muted); }
.rns-header nav { display:flex; align-items:center; justify-content:flex-end; gap:clamp(18px,2.4vw,36px); margin-left:auto; }
.rns-header a { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-width:44px; min-height:44px; font-size:13px; font-weight:500; position:relative; }
.rns-header a::after { content:""; position:absolute; bottom:6px; left:0; right:0; height:1px; background:var(--brand-accent); transform:scaleX(0); transform-origin:left; transition:transform 160ms var(--rns-ease); }
.rns-header a:hover::after { transform:scaleX(1); }
.rns-icon { display:block; width:20px; height:20px; flex-shrink:0; }
.rns-header .rns-icon { width:14px; height:14px; }
.rns-button { display:inline-flex; justify-content:center; align-items:center; gap:24px; min-height:52px; padding:14px 22px; border-radius:10px; background:var(--brand-accent); color:#17191C!important; font-size:14px; font-weight:600; transform:translate(var(--magnet-x,0px),var(--magnet-y,0px)); transition:transform 160ms var(--rns-ease),background 160ms; }
.rns-button:active { transform:translate(var(--magnet-x,0px),var(--magnet-y,0px)) scale(.98); }
.rns-text-link { display:inline-flex; gap:14px; align-items:center; min-height:44px; font-size:13px; border-bottom:1px solid currentColor; transition:border-color 160ms; }
.rns-text-link:hover { border-color:var(--brand-accent); }
.rns-work { padding-block:64px 100px; }
.rns-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:38px; }
.rns-section-heading h2 { font-size:clamp(34px,3.2vw,48px); }
.rns-project-count { font-size:12px; color:var(--brand-muted); padding-bottom:5px; white-space:nowrap; }
.rns-project-grid { display:grid; grid-template-columns:1fr; gap:72px; }
.rns-project { min-width:0; }
.rns-project-link { display:block; }
.rns-project-image { overflow:hidden; border-radius:12px; background:var(--brand-surface); --theme-surface:var(--brand-surface); --theme-text:var(--brand-text); --theme-muted:var(--brand-muted); --theme-accent:var(--brand-accent-2); --theme-radius:0px; }
.rns-project-image>div { transition:transform 500ms var(--rns-ease); }
.rns-project-copy { display:grid; grid-template-columns:1.1fr 1fr; column-gap:clamp(32px,6vw,96px); row-gap:12px; padding-top:28px; }
.rns-project-meta { grid-column:1/-1; display:flex; gap:20px; justify-content:space-between; font-size:12px; line-height:1.5; color:var(--brand-muted); }
.rns-project-title { grid-column:1; grid-row:2/4; display:flex; align-items:flex-start; justify-content:space-between; gap:20px; }
.rns-project-title h3 { font-size:clamp(32px,3.7vw,54px); line-height:1.12; }
.rns-project-arrow { display:grid; place-items:center; width:44px; height:44px; flex-shrink:0; transition:transform 160ms var(--rns-ease); }
.rns-project-arrow .rns-icon { width:28px; height:28px; }
.rns-project-copy>p { grid-column:2; font-size:16px; line-height:1.65; color:var(--brand-muted); max-width:54ch; }
.rns-project-tags { grid-column:2; display:flex; flex-wrap:wrap; gap:8px 18px; font-size:12px; line-height:1.6; color:var(--brand-muted); }
.rns-project-text { border-top:1px solid var(--brand-border); }
.rns-project-text .rns-project-copy { padding-top:28px; }
.rns-empty-work { padding:32px 0; font-size:20px; line-height:1.6; }
.rns-empty-work a { text-decoration:underline; text-underline-offset:4px; }
.rns-about { background:var(--brand-surface); padding-block:90px 80px; }
.rns-about-inner { display:grid; grid-template-columns:1fr 1fr; gap:clamp(32px,7vw,110px); }
.rns-about h2 { font-size:clamp(44px,5.2vw,76px); }
.rns-about-copy { max-width:54ch; }
.rns-about-copy p:first-child { font-family:var(--font-newsreader),Georgia,serif; font-size:clamp(28px,3vw,40px); line-height:1.2; letter-spacing:-.02em; }
.rns-about-copy p+p { font-size:16px; line-height:1.7; margin-top:22px; color:var(--brand-muted); }
.rns-about-copy .rns-text-link { margin-top:22px; }
.rns-capabilities { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; padding-top:64px!important; margin-inline:auto!important; }
.rns-capabilities>li { border-top:1px solid var(--brand-border); padding-top:24px; }
.rns-capabilities h3 { font-size:24px; }
.rns-capabilities p { font-size:15px; line-height:1.65; margin-top:14px; max-width:34ch; }
.rns-capabilities span { display:block; margin-top:18px; font-size:12px; line-height:1.7; color:var(--brand-muted); }
.rns-contact-inner { display:grid; grid-template-columns:1.3fr 1fr; gap:clamp(32px,7vw,110px); align-items:end; padding-block:100px; }
.rns-contact h2 { font-family:var(--font-newsreader),Georgia,serif; font-size:clamp(64px,7vw,96px); font-weight:450; letter-spacing:-.03em; line-height:1; }
.rns-contact-copy p { font-size:17px; line-height:1.7; max-width:36ch; color:var(--brand-muted); margin-bottom:26px; }
.rns-footer { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; padding-block:20px; font-size:12px; line-height:1.5; color:var(--brand-muted); }
.rns-footer a { display:inline-flex; align-items:center; gap:10px; min-height:44px; }
:root:has(.rns-landing) .intro,:root:has(.rns-landing) .cursor-dot { display:none!important; }
:root:has(.rns-landing) .skip-link { background:#17191C; color:#FFC900; }
:root:has(.rns-landing) .skip-link:focus-visible { outline-color:#FFC900; }
.rns-studio-cursor { position:fixed; z-index:70; top:0; left:0; pointer-events:none; opacity:0; transition:opacity 100ms; }
.rns-studio-cursor[data-visible="true"] { opacity:1; }
.rns-cursor-chip { position:relative; width:20px; height:20px; color:var(--brand-on-accent); transform-origin:top left; transition:transform 120ms var(--rns-ease); }
.rns-cursor-chip i { position:absolute; width:5px; height:5px; background:var(--brand-accent); box-shadow:0 0 0 1px #17191c70; transition:transform 120ms var(--rns-ease); }
.rns-cursor-chip i:nth-child(1) { top:10px; left:0; }
.rns-cursor-chip i:nth-child(2) { top:5px; left:5px; }
.rns-cursor-chip i:nth-child(3) { top:0; left:10px; }
.rns-cursor-chip span { display:none; align-items:center; justify-content:space-between; gap:12px; font-size:12px; font-weight:600; line-height:1; }
.rns-cursor-chip .rns-icon { width:18px; height:18px; }
.rns-studio-cursor[data-mode="action"] .rns-cursor-chip i:nth-child(1) { transform:translate(0,-5px); }
.rns-studio-cursor[data-mode="action"] .rns-cursor-chip i:nth-child(3) { transform:translate(0,5px); }
.rns-studio-cursor[data-mode="view"] .rns-cursor-chip { width:76px; height:36px; padding:8px 10px; background:var(--brand-accent); clip-path:polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px); }
.rns-studio-cursor[data-mode="view"] .rns-cursor-chip span { display:flex; }
.rns-studio-cursor[data-mode="view"] .rns-cursor-chip i { display:none; }
.rns-studio-cursor[data-pressed="true"] .rns-cursor-chip { transform:scale(.88); }
@media (hover:hover) and (pointer:fine) {
 .rns-project-link:hover .rns-project-image>div { transform:scale(1.02); }
 .rns-project-link:hover .rns-project-arrow { transform:translate(3px,-3px); }
 .rns-button:hover { background:#FFD42B; }
}
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) and (forced-colors:none) {
 .rns-landing[data-studio-cursor="on"] { cursor:url('/brand/rns-cursor.svg') 2 2,auto; }
 .rns-landing[data-studio-cursor="on"] :is(a,button) { cursor:url('/brand/rns-cursor.svg') 2 2,pointer; }
 .rns-landing[data-studio-cursor="on"] :is(h1,h2,h3,p,input,textarea,[contenteditable="true"]) { cursor:text; }
 .rns-landing[data-studio-cursor="on"] :is(a,button) :is(h1,h2,h3,p) { cursor:inherit; }
 .rns-landing[data-studio-cursor="on"] :is(button:disabled,[aria-disabled="true"]) { cursor:not-allowed; }
}
@media (max-width:1000px) { .rns-capabilities { grid-template-columns:1fr 1fr; gap:40px; } }
@media (max-width:700px) {
 .rns-shell { width:calc(100% - 40px); }
 .rns-header { padding-block:12px; }
 .rns-header-note { display:none; }
 .rns-header nav { gap:16px; }
 .rns-header a { font-size:12px; }
 .rns-work { padding-block:44px 64px; }
 .rns-section-heading { margin-bottom:28px; gap:16px; }
 .rns-section-heading h2 { font-size:32px; }
 .rns-project-count { font-size:11px; }
 .rns-project-grid { gap:44px; }
 .rns-project-copy { grid-template-columns:1fr; padding-top:20px; gap:14px; }
 .rns-project-meta,.rns-project-title,.rns-project-copy>p,.rns-project-tags { grid-column:1; grid-row:auto; }
 .rns-project-title h3 { font-size:32px; }
 .rns-project-title { align-items:center; }
 .rns-project-title .rns-icon { width:24px; height:24px; }
 .rns-project-copy>p { font-size:16px; }
 .rns-about { padding-block:60px; }
 .rns-about-inner { grid-template-columns:1fr; gap:30px; }
 .rns-about h2 { font-size:48px; }
 .rns-about-copy p:first-child { font-size:30px; }
 .rns-capabilities { grid-template-columns:1fr; gap:32px; padding-top:44px!important; }
 .rns-capabilities p { font-size:16px; max-width:40ch; }
 .rns-contact-inner { grid-template-columns:1fr; gap:28px; padding-block:64px; }
 .rns-contact h2 { font-size:62px; }
 .rns-contact-copy p { font-size:16px; }
 .rns-footer { font-size:11px; gap:8px; padding-block:16px; }
 .rns-footer>span:nth-child(2) { display:none; }
}
.rns-landing[data-motion-enabled="false"] :is(.rns-button,.rns-project-image>div,.rns-project-arrow) { transform:none!important; transition:none!important; }
@media (hover:none),(pointer:coarse),(prefers-reduced-motion:reduce),(forced-colors:active) { .rns-studio-cursor { display:none; } }
@media (prefers-reduced-motion:reduce) { .rns-landing :is(.rns-button,.rns-project-image>div,.rns-project-arrow) { transform:none!important; transition:none!important; } }
`;
