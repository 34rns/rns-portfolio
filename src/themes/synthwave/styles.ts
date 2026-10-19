/**
 * Scoped to `.synth-*` classes and the theme wrapper. One string so the CSS
 * only ships with Synthwave project pages, the same pattern as Anime 3D.
 *
 * Only four global selectors are intentional: the shared intro and cursor are
 * suppressed, the document behind the page is painted to match, and the skip
 * link is re-coloured so it does not flash the Professional blue.
 */
export const synthCss = `
.synth-root {
  --synth-void: #0D0518;
  --synth-deep: #1A0B2E;
  --synth-magenta: #FF2E88;
  --synth-cyan: #2DE2E6;
  --synth-orange: #FF8A3D;
  --synth-paper: #F4E9FF;
  --synth-dim: rgba(244, 233, 255, 0.6);
  --synth-cyan-dim: rgba(45, 226, 230, 0.32);
  --synth-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --synth-grid-y: 0px;
  --synth-progress: 0;
  --synth-sun-shift: 0px;
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background: var(--synth-void);
  color: var(--theme-text);
  font-family: var(--font-plex-mono), ui-monospace, monospace;
}

.intro,
.cursor-dot { display: none !important; }

body {
  background: #0D0518;
  color-scheme: dark;
}

.skip-link {
  background: #FF2E88;
  color: #0D0518;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
}

.synth-root ::selection {
  background: var(--synth-magenta);
  color: var(--synth-void);
}

.synth-root :focus-visible {
  outline: 2px solid var(--synth-cyan);
  outline-offset: 3px;
}

/* ------------------------------------------------------------------ scene */

.synth-scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(110% 70% at 50% 18%, rgba(123, 47, 247, 0.34), transparent 62%),
    radial-gradient(90% 55% at 50% 62%, rgba(255, 46, 136, 0.14), transparent 70%),
    linear-gradient(180deg, #12071F 0%, #1A0B2E 46%, #0D0518 100%);
}

.synth-scene::after {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 26vh;
  background: linear-gradient(180deg, rgba(13, 5, 24, 0.92), transparent);
}

.synth-stars {
  position: absolute;
  inset: 0;
  opacity: 0.8;
}

.synth-star {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: #FFF2FF;
  box-shadow: 0 0 6px rgba(244, 233, 255, 0.55);
  animation: synth-twinkle 4.6s ease-in-out infinite;
}

@keyframes synth-twinkle {
  0%, 100% { opacity: 0.25; }
  45% { opacity: 0.9; }
  55% { opacity: 0.55; }
}

.synth-sun {
  position: absolute;
  left: 20%;
  bottom: 26vh;
  width: min(36vw, 380px);
  aspect-ratio: 1;
  transform: translateX(-50%) translateY(var(--synth-sun-shift, 0px));
  border-radius: 50%;
  background: linear-gradient(180deg, #FFF0B8 0%, #FFC470 24%, #FF8A3D 56%, #FF2E88 100%);
  box-shadow:
    0 0 80px rgba(255, 46, 136, 0.28),
    0 0 220px rgba(255, 138, 61, 0.16);
  opacity: calc(var(--synth-depth, 1) * 0.96);
}

.synth-sun::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(
    180deg,
    transparent 0 7px,
    #0D0518 7px 13px
  );
  -webkit-mask-image: linear-gradient(180deg, transparent 0 51%, #000 51%);
  mask-image: linear-gradient(180deg, transparent 0 51%, #000 51%);
  animation: synth-sun-drift 9s linear infinite;
}

@keyframes synth-sun-drift {
  from { transform: translateY(0); }
  to { transform: translateY(13px); }
}

.synth-floor {
  position: absolute;
  left: -30%;
  right: -30%;
  top: 62vh;
  bottom: 0;
  overflow: hidden;
  perspective: 360px;
}

.synth-horizon {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--synth-cyan) 22%, var(--synth-cyan) 78%, transparent);
  box-shadow:
    0 0 18px rgba(45, 226, 230, 0.65),
    0 0 60px rgba(255, 46, 136, 0.28);
  /* The bright horizon belongs to the hero; it should never cut a paragraph. */
  opacity: calc(var(--synth-depth, 1) * 0.95);
  z-index: 2;
}

.synth-grid {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 190vh;
  transform-origin: top center;
  transform: perspective(360px) rotateX(64deg) translate3d(0, var(--synth-grid-y, 0px), 0);
  background-image:
    repeating-linear-gradient(90deg, rgba(45, 226, 230, 0.5) 0 1px, transparent 1px 76px),
    repeating-linear-gradient(0deg, rgba(255, 46, 136, 0.42) 0 1px, transparent 1px 72px);
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0, #000 16%, #000 72%, transparent 100%);
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0, #000 16%, #000 72%, transparent 100%);
  opacity: calc(0.16 + var(--synth-depth, 1) * 0.58);
  will-change: transform;
}

.synth-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.035) 0 1px,
    transparent 1px 3px
  );
  opacity: 0.55;
  animation: synth-flicker 6.5s steps(2, end) infinite;
}

@keyframes synth-flicker {
  0%, 96%, 100% { opacity: 0.55; }
  97% { opacity: 0.44; }
  98% { opacity: 0.62; }
}

.synth-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 88% at 50% 44%, transparent 50%, rgba(5, 2, 10, 0.62) 100%);
  box-shadow: inset 0 0 190px 30px rgba(5, 2, 10, 0.72);
}

.synth-progress {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: rgba(244, 233, 255, 0.08);
  z-index: 4;
}

.synth-progress span {
  display: block;
  width: 100%;
  height: 100%;
  transform: scaleX(var(--synth-progress, 0));
  transform-origin: left center;
  background: linear-gradient(90deg, var(--synth-cyan), var(--synth-magenta) 55%, var(--synth-orange));
  box-shadow: 0 0 14px rgba(255, 46, 136, 0.6);
}

/* ------------------------------------------------------------------- page */

.synth-page {
  position: relative;
  z-index: 2;
}

.synth-frame {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (min-width: 768px) {
  .synth-frame { padding: 0 40px; }
}

.synth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0 0.9rem;
  border-bottom: 1px solid rgba(45, 226, 230, 0.22);
}

.synth-logo {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  color: #FFF6FF;
  text-decoration: none;
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: 2rem;
  line-height: 0.8;
  letter-spacing: 0.02em;
  text-shadow: 2px 0 0 rgba(255, 46, 136, 0.65), -2px 0 0 rgba(45, 226, 230, 0.55);
}

.synth-logo-sub {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.4rem;
  letter-spacing: 0.08em;
  color: var(--synth-cyan);
  text-shadow: none;
}

.synth-header-meta {
  display: none;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.44rem;
  letter-spacing: 0.08em;
  color: var(--synth-dim);
  text-transform: uppercase;
}

.synth-header-actions {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.synth-header-link {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.5rem;
  letter-spacing: 0.06em;
  color: var(--synth-cyan);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.16s linear, text-shadow 0.16s linear;
}

.synth-header-link:hover,
.synth-header-link:focus-visible {
  color: var(--synth-magenta);
  text-shadow: 0 0 12px rgba(255, 46, 136, 0.6);
}

@media (min-width: 700px) {
  .synth-header-meta { display: block; }
}

/* ------------------------------------------------------------------- hero */

.synth-hero {
  position: relative;
  display: grid;
  gap: 1.6rem;
  padding: clamp(2.2rem, 7vh, 4.6rem) 0 0;
}

.synth-hero::before {
  content: "";
  position: absolute;
  z-index: -1;
  left: -22vw;
  right: -10vw;
  top: -12vh;
  height: 78vh;
  background: radial-gradient(70% 70% at 26% 38%, rgba(13, 5, 24, 0.94), rgba(13, 5, 24, 0) 72%);
  pointer-events: none;
}

.synth-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.5rem;
  line-height: 1.7;
  letter-spacing: 0.08em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-kicker::before {
  content: "";
  width: 7px;
  height: 7px;
  background: var(--synth-magenta);
  box-shadow: 12px 0 0 var(--synth-cyan);
  flex: none;
}

.synth-title {
  margin: 1.1rem 0 0;
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: clamp(3.3rem, 10.2vw, 8.6rem);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  text-wrap: balance;
  overflow-wrap: anywhere;
  color: #FFF8FF;
  text-shadow:
    0.032em 0 0 rgba(255, 46, 136, 0.6),
    -0.032em 0 0 rgba(45, 226, 230, 0.52);
}

.synth-tagline {
  max-width: 46ch;
  margin-top: 1.2rem;
  font-size: clamp(1rem, 1.25vw, 1.16rem);
  line-height: 1.7;
  color: #E9DAF9;
}

.synth-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1.4rem;
  padding: 0;
  list-style: none;
}

.synth-tag {
  border: 1px solid var(--synth-cyan-dim);
  background: rgba(13, 5, 24, 0.62);
  padding: 0.34rem 0.55rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.44rem;
  line-height: 1.6;
  letter-spacing: 0.04em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

/* ----------------------------------------------------------------- ledger */

.synth-ledger {
  position: relative;
  align-self: end;
  border: 1px solid var(--synth-cyan-dim);
  background: linear-gradient(180deg, rgba(36, 16, 65, 0.9), rgba(13, 5, 24, 0.94));
  padding: 1rem 1.1rem 1.15rem;
  box-shadow: 0 26px 80px rgba(0, 0, 0, 0.4);
}

.synth-ledger::before {
  content: "";
  position: absolute;
  inset: -1px -1px auto;
  height: 2px;
  background: linear-gradient(90deg, var(--synth-magenta), var(--synth-cyan));
}

.synth-ledger-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.48rem;
  letter-spacing: 0.06em;
  color: var(--synth-magenta);
  text-transform: uppercase;
}

.synth-ledger-head span:last-child {
  color: var(--synth-dim);
}

.synth-ledger dl {
  display: grid;
  gap: 0.5rem;
  margin: 0.95rem 0 0;
}

.synth-ledger dl div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.42rem;
  border-bottom: 1px dashed rgba(244, 233, 255, 0.14);
}

.synth-ledger dl div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.synth-ledger dt {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.46rem;
  line-height: 1.7;
  letter-spacing: 0.08em;
  color: var(--synth-dim);
  text-transform: uppercase;
}

.synth-ledger dd {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #FFF3FF;
  text-align: right;
}

/* ---------------------------------------------------------------- cabinet */

.synth-cabinet {
  position: relative;
  margin-top: 0.4rem;
  border: 2px solid rgba(255, 46, 136, 0.6);
  background: var(--synth-void);
  padding: 10px;
  box-shadow:
    0 0 0 1px rgba(45, 226, 230, 0.18),
    0 30px 90px rgba(0, 0, 0, 0.55),
    0 0 70px rgba(255, 46, 136, 0.13);
}

.synth-cabinet::before {
  content: "";
  position: absolute;
  inset: -2px auto auto -2px;
  width: 22px;
  height: 22px;
  border-top: 2px solid var(--synth-cyan);
  border-left: 2px solid var(--synth-cyan);
  pointer-events: none;
}

.synth-cabinet::after {
  content: "";
  position: absolute;
  inset: auto -2px -2px auto;
  width: 22px;
  height: 22px;
  border-bottom: 2px solid var(--synth-cyan);
  border-right: 2px solid var(--synth-cyan);
  pointer-events: none;
}

.synth-cabinet-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.45rem 0.25rem 0.7rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.44rem;
  line-height: 1.8;
  letter-spacing: 0.05em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-cabinet-bar-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.synth-led {
  display: inline-block;
  width: 6px;
  height: 6px;
  flex: none;
  background: var(--synth-magenta);
  box-shadow: 0 0 9px var(--synth-magenta);
  animation: synth-blink 2.6s steps(1, end) infinite;
}

@keyframes synth-blink {
  0%, 82%, 100% { opacity: 1; }
  83%, 90% { opacity: 0.2; }
}

.synth-screen {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(80% 55% at 50% 100%, rgba(255, 46, 136, 0.16), transparent 72%),
    repeating-linear-gradient(90deg, rgba(45, 226, 230, 0.06) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(0deg, rgba(45, 226, 230, 0.06) 0 1px, transparent 1px 64px),
    radial-gradient(100% 110% at 50% 0%, #2A1050 0%, #160A29 58%, #0D0518 100%);
}

/* Let the screen gradient show through the shared stage's fallback surface. */
.synth-screen .synth-stage { background: transparent; }

/* The poster's own caption block gets a scrim so it stays legible on a cover. */
.synth-screen [data-model-poster] > div:last-child {
  padding-top: 2.5rem;
  background: linear-gradient(
    0deg,
    rgba(13, 5, 24, 0.94) 0%,
    rgba(13, 5, 24, 0.72) 55%,
    transparent 100%
  );
}

.synth-screen [data-model-poster] .mono { opacity: 0.85; }

.synth-stage {
  width: 100%;
  height: clamp(280px, 43vw, 610px);
}

.synth-stage .display {
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: 1.9rem;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;
}

.synth-stage .mono {
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.09em;
}

.synth-stage button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  border: 1px solid var(--synth-cyan);
  background: rgba(13, 5, 24, 0.82);
  color: var(--synth-cyan);
  padding: 0.6rem 0.9rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.48rem;
  line-height: 1.7;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.16s linear, color 0.16s linear;
}

.synth-stage button:hover,
.synth-stage button:focus-visible {
  background: var(--synth-cyan);
  color: var(--synth-void);
}

.synth-screen-scan,
.synth-screen-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.synth-screen-scan {
  z-index: 2;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.045) 0 1px,
    transparent 1px 3px
  );
  mix-blend-mode: screen;
}

.synth-screen-glare {
  z-index: 3;
  background:
    radial-gradient(60% 42% at 28% 8%, rgba(255, 255, 255, 0.07), transparent 72%),
    linear-gradient(180deg, rgba(255, 46, 136, 0.1), rgba(45, 226, 230, 0.07) 72%, transparent);
  mix-blend-mode: screen;
}

/* The canvas owns horizontal drags; a vertical swipe should still scroll. */
.synth-screen canvas { touch-action: pan-y !important; }

.synth-cabinet-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem 1rem;
  padding: 0.7rem 0.25rem 0.15rem;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--synth-dim);
}

.synth-cabinet-tag { color: var(--synth-orange); }

.synth-cabinet-static {
  display: none;
  color: var(--synth-dim);
}

/* --------------------------------------------------------------- entrance */

.synth-rise {
  opacity: 1;
}

.synth-root[data-booted] .synth-rise {
  animation: synth-rise 0.52s var(--synth-ease) both;
  animation-delay: var(--d, 0ms);
}

@keyframes synth-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}

.synth-root[data-booted] .synth-cabinet {
  animation: synth-power 0.62s var(--synth-ease) 0.14s both;
}

@keyframes synth-power {
  from { opacity: 0.2; transform: scaleY(0.94); }
  to { opacity: 1; transform: none; }
}

/* --------------------------------------------------------------- sections */

.synth-section {
  margin-top: clamp(3.2rem, 8vh, 5.8rem);
}

.synth-section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(45, 226, 230, 0.22);
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.5rem;
  line-height: 1.8;
  letter-spacing: 0.07em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-section-head span:last-child {
  margin-left: auto;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: var(--synth-dim);
}

.synth-prose {
  max-width: 68ch;
  margin-top: 1.7rem;
  font-size: 1.03rem;
  line-height: 1.78;
  color: #EADCF8;
}

.synth-prose > * + * { margin-top: 1.1em; }

.synth-prose h2 {
  margin-top: 2.2em;
  padding-bottom: 0.28rem;
  border-bottom: 1px solid rgba(255, 46, 136, 0.35);
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-weight: 400;
  font-size: clamp(1.9rem, 3vw, 2.65rem);
  line-height: 1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: #FFF5FF;
}

.synth-prose h2::before {
  content: "\\2588";
  margin-right: 0.5rem;
  color: var(--synth-magenta);
  font-size: 0.58em;
}

.synth-prose h2:first-child { margin-top: 0; }

.synth-prose h3 {
  margin-top: 2em;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.62rem;
  line-height: 1.9;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--synth-cyan);
}

.synth-prose ul,
.synth-prose ol {
  display: grid;
  gap: 0.5rem;
  padding-left: 0;
  list-style: none;
}

.synth-prose ol { counter-reset: synth-log; }

.synth-prose li {
  position: relative;
  padding-left: 1.6rem;
}

.synth-prose ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.66em;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--synth-magenta);
  box-shadow: 0 0 10px rgba(255, 46, 136, 0.5);
}

.synth-prose ol li::before {
  counter-increment: synth-log;
  content: counter(synth-log, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 0.2em;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.44rem;
  color: var(--synth-magenta);
}

.synth-prose a {
  color: var(--synth-cyan);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.synth-prose a:hover { color: var(--synth-magenta); }

.synth-prose blockquote {
  border-left: 3px solid var(--synth-magenta);
  padding-left: 1.1rem;
  color: var(--synth-dim);
}

.synth-prose code {
  border: 1px solid rgba(45, 226, 230, 0.2);
  background: rgba(45, 226, 230, 0.08);
  padding: 0.08em 0.3em;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.86em;
  color: #CFFBFF;
}

.synth-prose pre {
  overflow-x: auto;
  border: 1px solid rgba(45, 226, 230, 0.22);
  background: #080310;
  padding: 1.1rem 1.2rem;
}

.synth-prose pre code {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 0.82rem;
}

.synth-prose img {
  width: 100%;
  height: auto;
  border: 1px solid var(--synth-cyan-dim);
}

.synth-prose hr {
  border: 0;
  border-top: 1px dashed rgba(244, 233, 255, 0.2);
}

/* ------------------------------------------------------------------ tapes */

.synth-tape-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.6rem;
}

.synth-tape { margin: 0; }

.synth-tape-body {
  position: relative;
  padding: 12px 12px 0;
  border: 1px solid rgba(244, 233, 255, 0.2);
  background: linear-gradient(180deg, #2A1050, #120720);
  box-shadow:
    0 16px 44px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(255, 46, 136, 0.08);
  transition:
    transform 0.22s var(--synth-ease),
    border-color 0.22s linear,
    box-shadow 0.22s linear;
}

.synth-tape-body::before {
  content: "";
  position: absolute;
  inset: 7px 7px auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(244, 233, 255, 0.28), transparent);
}

.synth-tape-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.15rem 0.1rem 0.7rem;
}

.synth-tape-reels {
  display: flex;
  gap: 0.5rem;
}

.synth-tape-reel {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(244, 233, 255, 0.45);
  border-radius: 50%;
  background:
    radial-gradient(circle, #0D0518 0 5px, rgba(13, 5, 24, 0.9) 5px 7px, transparent 7.5px),
    repeating-conic-gradient(
      from 0deg,
      rgba(244, 233, 255, 0.6) 0 10deg,
      rgba(244, 233, 255, 0.08) 10deg 60deg
    ),
    #1A0B2E;
  box-shadow: 0 0 12px rgba(45, 226, 230, 0.18);
}

.synth-tape-no {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.4rem;
  line-height: 1.7;
  letter-spacing: 0.05em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-tape-window {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid rgba(244, 233, 255, 0.12);
  background: var(--synth-void);
}

.synth-tape-img {
  object-fit: cover;
  filter: saturate(0.82) contrast(1.06);
  transition: transform 0.3s var(--synth-ease), filter 0.3s linear;
}

.synth-tape-scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05) 0 1px,
    transparent 1px 3px
  );
  mix-blend-mode: screen;
  pointer-events: none;
}

.synth-tape-play {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 0.32rem 0.45rem;
  border: 1px solid var(--synth-magenta);
  background: rgba(13, 5, 24, 0.9);
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.38rem;
  line-height: 1.6;
  letter-spacing: 0.05em;
  color: var(--synth-magenta);
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.18s linear, transform 0.18s var(--synth-ease);
}

.synth-tape-label {
  position: relative;
  display: grid;
  gap: 0.18rem;
  margin: 0 -2px;
  padding: 0.62rem 0.85rem 0.72rem 1.05rem;
  border: 1px solid rgba(13, 5, 24, 0.28);
  background:
    repeating-linear-gradient(
      180deg,
      rgba(26, 11, 46, 0.05) 0 1px,
      transparent 1px 22px
    ),
    #E4D6F4;
  color: #1A0B2E;
}

.synth-tape-label::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: var(--synth-magenta);
}

.synth-tape-name {
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: 1.6rem;
  line-height: 1;
  color: #1A0B2E;
}

.synth-tape-meta {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.36rem;
  line-height: 1.8;
  letter-spacing: 0.03em;
  color: rgba(26, 11, 46, 0.72);
  text-transform: uppercase;
}

.synth-tape-caption {
  margin-top: 0.5rem;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--synth-dim);
}

.synth-tape:hover .synth-tape-body,
.synth-tape:focus-within .synth-tape-body {
  transform: translateY(-6px);
  border-color: var(--synth-cyan);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 28px rgba(45, 226, 230, 0.16);
}

.synth-tape:hover .synth-tape-img {
  transform: scale(1.035);
  filter: saturate(1) contrast(1.04);
}

.synth-tape:hover .synth-tape-play {
  opacity: 1;
  transform: none;
  animation: synth-play 1.4s steps(1, end) infinite;
}

@keyframes synth-play {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (min-width: 800px) {
  .synth-tape-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2.2rem; }
  .synth-tape:nth-child(even) { margin-top: 2.6rem; }
  /* A lone capture should read as a plate, not half an empty row. */
  .synth-tape:only-child {
    grid-column: 1 / -1;
    width: min(100%, 720px);
    margin-inline: auto;
  }
}

/* ------------------------------------------------------------- cartridges */

.synth-cart-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.synth-cart {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-height: 148px;
  padding: 1rem 1rem 1.6rem;
  border: 1px solid rgba(45, 226, 230, 0.25);
  background: linear-gradient(180deg, #2A1050, #170A2B);
  box-shadow:
    inset 0 0 0 1px rgba(255, 46, 136, 0.08),
    0 14px 34px rgba(0, 0, 0, 0.4);
  color: inherit;
  text-decoration: none;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
  transition: transform 0.2s var(--synth-ease), box-shadow 0.2s linear;
}

.synth-cart::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--synth-magenta);
}

.synth-cart::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 8px;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 214, 140, 0.55) 0 7px,
    transparent 7px 12px
  );
  opacity: 0.5;
}

.synth-cart-no {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.42rem;
  line-height: 1.7;
  letter-spacing: 0.06em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-cart-name {
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: 1.85rem;
  line-height: 0.95;
  text-transform: uppercase;
  color: #FFF4FF;
  transition: color 0.18s linear, text-shadow 0.18s linear;
}

.synth-cart-year {
  margin-top: auto;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: var(--synth-dim);
}

.synth-cart:hover,
.synth-cart:focus-visible {
  transform: translateY(-5px);
  box-shadow:
    0 20px 44px rgba(0, 0, 0, 0.55),
    0 0 26px rgba(255, 46, 136, 0.2);
}

.synth-cart:hover .synth-cart-name,
.synth-cart:focus-visible .synth-cart-name {
  color: var(--synth-magenta);
  text-shadow: 2px 0 0 rgba(45, 226, 230, 0.6);
}

@media (min-width: 760px) {
  .synth-cart-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.2rem; }
}

/* ------------------------------------------------------------------- coin */

.synth-coin {
  position: relative;
  margin-top: clamp(3.2rem, 7vh, 5rem);
  overflow: hidden;
  border: 1px solid rgba(255, 46, 136, 0.42);
  background:
    linear-gradient(180deg, rgba(36, 16, 65, 0.95), rgba(13, 5, 24, 0.97) 46%);
  padding: clamp(1.2rem, 3vw, 2rem);
}

.synth-coin::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(45, 226, 230, 0.055) 0 1px,
    transparent 1px 44px
  );
  pointer-events: none;
}

.synth-coin-head {
  position: relative;
  max-width: 52ch;
}

.synth-pixel {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.46rem;
  line-height: 1.8;
  letter-spacing: 0.08em;
  color: var(--synth-magenta);
  text-transform: uppercase;
}

.synth-coin-head h2 {
  margin: 0.75rem 0 0;
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-weight: 400;
  font-size: clamp(2.1rem, 4.4vw, 3.4rem);
  line-height: 0.9;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: #FFF4FF;
}

.synth-coin-head > p:last-child {
  margin-top: 0.75rem;
  font-size: 0.84rem;
  line-height: 1.75;
  color: var(--synth-dim);
}

.synth-coin-slot {
  position: relative;
  margin-top: 1.5rem;
  padding-top: 1.2rem;
  border-top: 1px dashed rgba(244, 233, 255, 0.18);
}

.synth-coin-slot section {
  border: 0 !important;
  padding: 0;
}

.synth-coin-slot h2 {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.48rem;
  line-height: 1.9;
  letter-spacing: 0.08em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-coin-slot .display {
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 400;
  line-height: 1;
  color: #FFF4FF;
}

.synth-coin-slot p {
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--synth-dim);
}

.synth-coin-slot button,
.synth-coin-slot a:not(.underline):not(.nav-link) {
  display: inline-block;
  border: 0;
  background: var(--theme-accent);
  color: var(--theme-accent-text);
  padding: 1rem 1.2rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.5rem;
  line-height: 1.7;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  box-shadow:
    inset 0 -4px 0 rgba(0, 0, 0, 0.32),
    0 0 26px rgba(255, 46, 136, 0.32);
  cursor: pointer;
  transition: transform 0.12s linear, box-shadow 0.12s linear, filter 0.12s linear;
}

.synth-coin-slot button:hover,
.synth-coin-slot a:not(.underline):not(.nav-link):hover,
.synth-coin-slot button:focus-visible,
.synth-coin-slot a:not(.underline):not(.nav-link):focus-visible {
  transform: translateY(1px);
  filter: brightness(1.06);
  box-shadow:
    inset 0 -2px 0 rgba(0, 0, 0, 0.32),
    0 0 34px rgba(255, 46, 136, 0.42);
}

.synth-coin-slot button:disabled {
  opacity: 0.6;
  transform: none;
  cursor: wait;
}

.synth-coin-slot .nav-link {
  color: var(--synth-cyan);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.synth-coin-slot [role="alert"] { color: var(--synth-orange); }

/* ------------------------------------------------------------------- next */

.synth-next {
  margin-top: clamp(3.6rem, 8vh, 6rem);
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 46, 136, 0.32);
}

.synth-next a {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  color: inherit;
  text-decoration: none;
}

.synth-next-label {
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.46rem;
  line-height: 1.8;
  letter-spacing: 0.08em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-next-title {
  display: block;
  margin-top: 0.45rem;
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: clamp(2.4rem, 7vw, 5.6rem);
  line-height: 0.85;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  color: #FFF4FF;
  transition: color 0.2s linear, text-shadow 0.2s linear;
}

.synth-next-arrow {
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
  color: var(--synth-magenta);
  flex: none;
}

.synth-next a:hover .synth-next-title,
.synth-next a:focus-visible .synth-next-title {
  color: var(--synth-magenta);
  text-shadow: 3px 0 0 rgba(45, 226, 230, 0.6);
}

/* ----------------------------------------------------------------- footer */

.synth-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-top: 4rem;
  padding: 1.1rem 0 3rem;
  border-top: 1px solid rgba(45, 226, 230, 0.22);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--synth-dim);
}

.synth-footer-dots {
  display: inline-flex;
  gap: 0.35rem;
  margin-right: 0.4rem;
}

.synth-footer-dot {
  width: 5px;
  height: 5px;
  background: var(--synth-cyan);
  box-shadow: 0 0 6px rgba(45, 226, 230, 0.7);
}

.synth-footer-dot:nth-child(2) { background: var(--synth-magenta); }
.synth-footer-dot:nth-child(3) { background: var(--synth-orange); }

.synth-footer-link {
  color: var(--synth-cyan);
  text-decoration: none;
}

.synth-footer-link:hover { color: var(--synth-magenta); }

/* ------------------------------------------------------------------- boot */

.synth-boot:focus { outline: none; }

.synth-boot {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  padding: 20px;
  overflow-y: auto;
  background:
    radial-gradient(90% 70% at 50% 42%, rgba(123, 47, 247, 0.2), transparent 65%),
    #080310;
}

.synth-boot::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04) 0 1px,
    transparent 1px 3px
  );
}

.synth-boot.is-closing {
  animation: synth-power-off 0.42s cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes synth-power-off {
  0% { opacity: 1; transform: scale(1, 1); }
  55% { opacity: 1; transform: scale(1.005, 0.008); filter: brightness(2.4); }
  100% { opacity: 0; transform: scale(1.03, 0.002); filter: brightness(3); }
}

.synth-boot-screen {
  width: min(720px, 100%);
  border: 1px solid rgba(45, 226, 230, 0.38);
  background: linear-gradient(180deg, rgba(26, 11, 46, 0.72), rgba(8, 3, 16, 0.94));
  padding: clamp(1.1rem, 3vw, 2rem);
  box-shadow:
    0 0 0 1px rgba(255, 46, 136, 0.12),
    0 30px 100px rgba(0, 0, 0, 0.6),
    0 0 80px rgba(45, 226, 230, 0.08);
  animation: synth-hum 5s ease-in-out infinite;
}

@keyframes synth-hum {
  0%, 100% { opacity: 1; }
  47% { opacity: 0.985; }
  52% { opacity: 1; }
}

.synth-boot-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem 1rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid rgba(45, 226, 230, 0.2);
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.4rem;
  line-height: 1.8;
  letter-spacing: 0.07em;
  color: var(--synth-cyan);
  text-transform: uppercase;
}

.synth-boot-brand {
  margin: 1.2rem 0 0;
  font-family: var(--font-vt323), ui-monospace, monospace;
  font-size: clamp(2.6rem, 8vw, 4.4rem);
  line-height: 0.85;
  letter-spacing: 0.02em;
  color: #FFF6FF;
  text-shadow: 3px 0 0 rgba(255, 46, 136, 0.7), -3px 0 0 rgba(45, 226, 230, 0.6);
}

.synth-boot-brand span {
  color: var(--synth-magenta);
  text-shadow: none;
}

.synth-boot-log {
  margin-top: 1.3rem;
  display: grid;
  gap: 0.3rem;
  min-height: 7.4em;
  font-size: clamp(0.62rem, 1.2vw, 0.86rem);
  line-height: 1.4;
  color: #CFEFFF;
}

.synth-boot-line {
  width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  animation: synth-type 0.62s steps(var(--chars, 24)) var(--line-delay, 0s) forwards;
}

.synth-boot-line b {
  font-weight: 500;
  color: var(--synth-magenta);
}

@keyframes synth-type {
  to { width: calc(var(--chars, 24) * 1ch); }
}

.synth-boot-caret {
  display: inline-block;
  width: 0.62em;
  height: 1em;
  margin-top: 0.4rem;
  background: var(--synth-magenta);
  animation: synth-caret 1s steps(1, end) infinite;
}

@keyframes synth-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.synth-boot-start {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  margin-top: 1.4rem;
  opacity: 0;
  animation: synth-boot-in 0.3s var(--synth-ease) 2.15s forwards;
}

@keyframes synth-boot-in {
  to { opacity: 1; }
}

.synth-boot-button {
  border: 1px solid var(--synth-magenta);
  background: var(--synth-magenta);
  color: var(--synth-void);
  padding: 0.95rem 1.15rem;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.52rem;
  line-height: 1.7;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.3), 0 0 28px rgba(255, 46, 136, 0.4);
  transition: transform 0.12s linear, box-shadow 0.12s linear;
}

.synth-boot-button:hover,
.synth-boot-button:focus-visible {
  transform: translateY(1px);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 0 34px rgba(255, 46, 136, 0.55);
}

.synth-boot-skip {
  border: 0;
  background: none;
  padding: 0.35rem 0;
  font-family: var(--font-press-start), ui-monospace, monospace;
  font-size: 0.4rem;
  line-height: 1.8;
  letter-spacing: 0.06em;
  color: var(--synth-dim);
  text-transform: uppercase;
  cursor: pointer;
}

.synth-boot-skip:hover,
.synth-boot-skip:focus-visible { color: var(--synth-cyan); }

.synth-boot-foot {
  margin-top: 1.2rem;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(185, 163, 214, 0.7);
}

/* ----------------------------------------------------------------- cursor */

.synth-cursor {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 400;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s linear;
}

.synth-cursor[data-active="true"] { opacity: 1; }

.synth-cursor-cross {
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
  transition: transform 0.14s var(--synth-ease);
}

.synth-cursor-cross::before,
.synth-cursor-cross::after {
  content: "";
  position: absolute;
  background: var(--synth-cyan);
  box-shadow: 2px 2px 0 rgba(255, 46, 136, 0.6);
}

.synth-cursor-cross::before {
  left: 8px;
  top: 0;
  width: 2px;
  height: 18px;
}

.synth-cursor-cross::after {
  left: 0;
  top: 8px;
  width: 18px;
  height: 2px;
}

.synth-cursor[data-hover="true"] .synth-cursor-cross {
  transform: translate(-50%, -50%) scale(1.45);
}

.synth-cursor-spark {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 4px;
  background: var(--synth-magenta);
  opacity: 0;
  will-change: transform;
}

.synth-cursor-spark:nth-child(odd) {
  background: var(--synth-cyan);
  width: 3px;
  height: 3px;
}

.synth-root.synth-cursor-on,
.synth-root.synth-cursor-on * { cursor: none !important; }

@media (hover: none), (pointer: coarse) {
  .synth-cursor { display: none !important; }
}

/* -------------------------------------------------------------- responsive */

@media (min-width: 900px) {
  .synth-hero {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: end;
    column-gap: 2.5rem;
  }

  .synth-cabinet {
    grid-column: 1 / -1;
    width: 76%;
    margin-left: auto;
  }
}

@media (max-width: 899px) {
  .synth-sun {
    left: 50%;
    width: min(54vw, 240px);
    bottom: 27vh;
  }
}

@media (max-width: 639px) {
  .synth-header { padding-top: 0.9rem; }
  .synth-header-actions { gap: 0.7rem; }
  .synth-logo { font-size: 1.7rem; }
  .synth-hero { padding-top: 1.8rem; }
  .synth-title { font-size: clamp(2.9rem, 15vw, 4.4rem); }
  .synth-hero::before { left: -10vw; right: -10vw; }
  .synth-cabinet { padding: 8px; }
  .synth-cabinet-bar { font-size: 0.36rem; }
  .synth-cabinet-foot { font-size: 0.52rem; }
  .synth-stage { height: 300px; }
  .synth-tape-label { padding-right: 0.7rem; }
  .synth-next a { align-items: flex-start; flex-direction: column; gap: 0.2rem; }
  .synth-next-arrow { display: none; }
  .synth-footer { margin-top: 3rem; }
}

@media (max-width: 360px) {
  .synth-title { font-size: 2.6rem; }
  .synth-tag { font-size: 0.38rem; }
}

/* -------------------------------------------------------- scroll reveals */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .synth-reveal {
      animation: synth-view linear both;
      animation-timeline: view();
      animation-range: entry 4% entry 36%;
    }

    @keyframes synth-view {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: none; }
    }
  }
}

/* --------------------------------------------------------- reduced motion */

@media (prefers-reduced-motion: reduce) {
  .synth-boot { display: none !important; }
  .synth-cursor { display: none !important; }
  .synth-cabinet-hint { display: none; }
  .synth-cabinet-static { display: inline; }
  .synth-star,
  .synth-sun::after,
  .synth-scanlines,
  .synth-led,
  .synth-boot-screen,
  .synth-progress span { animation: none !important; }

  .synth-root[data-booted] .synth-rise,
  .synth-root[data-booted] .synth-cabinet,
  .synth-reveal {
    animation: none !important;
    opacity: 1;
    transform: none;
  }

  .synth-tape:hover .synth-tape-body,
  .synth-tape:focus-within .synth-tape-body,
  .synth-tape:hover .synth-tape-img,
  .synth-cart:hover,
  .synth-cart:focus-visible {
    transform: none;
  }

  .synth-tape:hover .synth-tape-play {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;
