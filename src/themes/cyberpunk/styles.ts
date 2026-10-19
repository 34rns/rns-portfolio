/**
 * Scoped to `.cyber-*` classes and the theme wrapper; one string so the CSS
 * only ships with Cyberpunk project pages. Four global selectors are
 * intentional: the shared intro and cursor are suppressed, the document is
 * painted to match, and the skip link is re-coloured.
 */
export const cyberCss = `
.cyber-root {
  --cyber-void: #05070A;
  --cyber-ink: #0B1116;
  --cyber-paper: #E8F4F8;
  --cyber-dim: rgba(232, 244, 248, 0.62);
  --cyber-faint: rgba(232, 244, 248, 0.14);
  --cyber-acid: var(--theme-accent, #E6FF3D);
  --cyber-cyan: #34E1F5;
  --cyber-rose: #FF3B5C;
  --cyber-ease: cubic-bezier(0.2, 0.9, 0.2, 1);
  --cyber-progress: 0;
  --cyber-depth: 1;
  --cyber-trace-y: 0px;
  --cyber-stagger: 0ms;
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background: var(--cyber-void);
  color: var(--theme-text);
  font-family: var(--font-plex-mono), ui-monospace, monospace;
}

.intro,
.cursor-dot { display: none !important; }

body {
  background: #05070A;
  color-scheme: dark;
}

.skip-link {
  background: #E6FF3D;
  color: #05070A;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
}

.cyber-root ::selection {
  background: var(--cyber-acid);
  color: var(--cyber-void);
}

.cyber-root :focus-visible {
  outline: 2px solid var(--cyber-cyan);
  outline-offset: 3px;
}

.cyber-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ------------------------------------------------------------------ scene */

.cyber-scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: var(--cyber-depth);
  transition: opacity 0.24s linear;
}

.cyber-scene-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 50% at 78% 4%, rgba(52, 225, 245, 0.13), transparent 70%),
    radial-gradient(52% 44% at 12% 92%, rgba(255, 59, 92, 0.09), transparent 72%),
    radial-gradient(90% 70% at 50% 110%, rgba(230, 255, 61, 0.05), transparent 70%);
}

.cyber-skyline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64%;
}

.cyber-block {
  position: absolute;
  bottom: 0;
  background-color: #060A0D;
  background-image:
    repeating-linear-gradient(90deg, transparent 0 7px, rgba(232, 244, 248, 0.045) 7px 8px),
    repeating-linear-gradient(0deg, transparent 0 9px, rgba(52, 225, 245, 0.05) 9px 10px);
  border-top: 1px solid rgba(52, 225, 245, 0.24);
  box-shadow: 0 -1px 18px rgba(52, 225, 245, 0.06);
}

.cyber-block-lit {
  position: absolute;
  top: 11%;
  left: 22%;
  width: 56%;
  height: 2px;
  background: var(--cyber-acid);
  opacity: 0;
  animation: cyber-window 9s steps(1, end) infinite;
}

@keyframes cyber-window {
  0%, 88% { opacity: 0; }
  89%, 96% { opacity: 0.55; }
  97%, 100% { opacity: 0; }
}

.cyber-cables {
  position: absolute;
  inset: 0;
}

.cyber-cables span {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(52, 225, 245, 0.3), transparent);
  animation: cyber-cable 34s linear infinite alternate;
}

.cyber-cables span:nth-child(1) {
  top: 14%;
  left: -10%;
  width: 54%;
  animation-duration: 41s;
}

.cyber-cables span:nth-child(2) {
  top: 27%;
  right: -6%;
  width: 42%;
  animation-duration: 33s;
  animation-direction: alternate-reverse;
}

.cyber-cables span:nth-child(3) {
  top: 39%;
  left: 18%;
  width: 30%;
  opacity: 0.6;
}

@keyframes cyber-cable {
  from { transform: translateX(0); opacity: 0.35; }
  to { transform: translateX(9%); opacity: 0.8; }
}

.cyber-trace {
  position: absolute;
  inset: -96px 0 0;
  background-image: repeating-linear-gradient(
    180deg,
    rgba(52, 225, 245, 0.06) 0 1px,
    transparent 1px 96px
  );
  transform: translate3d(0, var(--cyber-trace-y), 0);
  will-change: transform;
}

.cyber-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.22) 0 1px,
    transparent 1px 3px
  );
  opacity: 0.45;
}

.cyber-reticle {
  position: absolute;
  top: 16%;
  right: -14vw;
  width: min(46vw, 620px);
  aspect-ratio: 1;
  border: 1px solid rgba(52, 225, 245, 0.16);
  border-radius: 50%;
}

.cyber-reticle::before,
.cyber-reticle::after {
  content: "";
  position: absolute;
  inset: 14%;
  border: 1px dashed rgba(52, 225, 245, 0.12);
  border-radius: 50%;
}

.cyber-reticle::after {
  inset: -14%;
  border-style: solid;
  border-color: rgba(52, 225, 245, 0.07);
  animation: cyber-spin 120s linear infinite;
  background-image:
    linear-gradient(90deg, transparent calc(50% - 0.5px), rgba(52, 225, 245, 0.18) 50%, transparent calc(50% + 0.5px)),
    linear-gradient(0deg, transparent calc(50% - 0.5px), rgba(52, 225, 245, 0.18) 50%, transparent calc(50% + 0.5px));
}

@keyframes cyber-spin {
  to { transform: rotate(360deg); }
}

.cyber-scene-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 92% at 50% 36%, transparent 42%, rgba(5, 7, 10, 0.9) 100%);
}

.cyber-scene-code {
  position: absolute;
  right: 22px;
  bottom: 16px;
  margin: 0;
  font-size: 0.52rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(232, 244, 248, 0.34);
}

.cyber-scene-code span:first-child { color: rgba(230, 255, 61, 0.6); }

.cyber-progress {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: rgba(232, 244, 248, 0.08);
}

.cyber-progress span {
  position: absolute;
  inset: 0;
  transform: scaleY(var(--cyber-progress));
  transform-origin: top;
  background: var(--cyber-acid);
  box-shadow: 0 0 12px rgba(230, 255, 61, 0.5);
}

/* ------------------------------------------------------------------ shell */

.cyber-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (min-width: 768px) {
  .cyber-shell { padding: 0 40px; }
}

.cyber-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1.2rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--cyber-faint);
  background: rgba(5, 7, 10, 0.72);
  backdrop-filter: blur(10px);
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-mark {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--cyber-paper);
  text-decoration: none;
  font-variation-settings: "wdth" 118;
}

.cyber-mark span { color: var(--cyber-acid); }

.cyber-topbar-unit { display: none; }

.cyber-topbar-node {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(232, 244, 248, 0.72);
}

.cyber-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--cyber-acid);
  box-shadow: 0 0 10px rgba(230, 255, 61, 0.7);
  animation: cyber-pulse 2.6s ease-in-out infinite;
}

@keyframes cyber-pulse {
  0%, 100% { opacity: 1; }
  52% { opacity: 0.45; }
}

.cyber-topbar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.cyber-topbar-nav a {
  color: var(--cyber-dim);
  text-decoration: none;
  transition: color 0.14s linear;
}

.cyber-topbar-nav a:hover,
.cyber-topbar-nav a:focus-visible { color: var(--cyber-acid); }

@media (min-width: 760px) {
  .cyber-topbar { gap: 1.6rem; }
  .cyber-topbar-unit { display: inline; }
  .cyber-topbar-nav { gap: 1.5rem; }
}

/* ------------------------------------------------------------------- hero */

.cyber-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 3.4rem);
  align-items: start;
  padding: clamp(2.4rem, 7vh, 5rem) 0 clamp(2.4rem, 5vh, 3.4rem);
}

.cyber-hero-copy { min-width: 0; }

.cyber-kicker {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-title {
  position: relative;
  margin: 1rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-weight: 600;
  font-size: clamp(2.9rem, 8.4vw, 6.2rem);
  line-height: 0.86;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 118;
  text-wrap: balance;
  color: var(--cyber-paper);
}

.cyber-title-text {
  position: relative;
  z-index: 1;
  text-shadow: 0 0 44px rgba(232, 244, 248, 0.09);
}

.cyber-title-ghost {
  position: absolute;
  inset: 0;
  z-index: 2;
  color: rgba(255, 59, 92, 0.55);
  text-shadow: -3px 0 0 rgba(52, 225, 245, 0.45);
  clip-path: inset(0 0 100% 0);
  pointer-events: none;
  user-select: none;
  animation: cyber-slice 7.5s steps(1, end) infinite;
}

@keyframes cyber-slice {
  0%, 87% { clip-path: inset(0 0 100% 0); transform: none; }
  88% { clip-path: inset(28% 0 62% 0); transform: translateX(-4px); }
  89.5% { clip-path: inset(56% 0 32% 0); transform: translateX(3px); }
  91% { clip-path: inset(70% 0 18% 0); transform: translateX(-2px); }
  92.5%, 96% { clip-path: inset(0 0 100% 0); transform: none; }
  97% { clip-path: inset(12% 0 80% 0); transform: translateX(2px); }
  98.5%, 100% { clip-path: inset(0 0 100% 0); transform: none; }
}

.cyber-tagline {
  max-width: 46ch;
  margin: 1.15rem 0 0;
  font-size: clamp(0.98rem, 1.5vw, 1.12rem);
  line-height: 1.68;
  color: rgba(232, 244, 248, 0.86);
}

.cyber-tags {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding-top: 0.9rem;
  border-top: 1px dashed rgba(232, 244, 248, 0.18);
}

.cyber-tags-label {
  margin-top: 0.28rem;
  flex: none;
  font-size: 0.54rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cyber-acid);
}

.cyber-tags ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cyber-tags li {
  padding: 0.22rem 0.5rem;
  border: 1px solid var(--cyber-faint);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(232, 244, 248, 0.78);
}

.cyber-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 1.5rem 0 0;
  border: 1px solid var(--cyber-faint);
  border-right: 0;
  border-bottom: 0;
}

.cyber-facts div {
  padding: 0.7rem 0.75rem;
  border-right: 1px solid var(--cyber-faint);
  border-bottom: 1px solid var(--cyber-faint);
}

.cyber-facts dt {
  font-size: 0.52rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-facts dd {
  margin: 0.32rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--cyber-paper);
}

@media (min-width: 540px) {
  .cyber-facts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.cyber-uplinks {
  display: grid;
  gap: 0.4rem;
  margin-top: 1.1rem;
}

.cyber-uplink {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.68rem 0.8rem;
  border: 1px solid var(--cyber-faint);
  color: var(--cyber-paper);
  text-decoration: none;
  transition:
    border-color 0.14s linear,
    background 0.14s linear,
    transform 0.14s var(--cyber-ease);
}

.cyber-uplink-label {
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.cyber-uplink-hint {
  justify-self: end;
  font-size: 0.54rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-uplink-arrow {
  color: var(--cyber-acid);
  font-size: 0.8rem;
  line-height: 1;
}

.cyber-uplink:hover,
.cyber-uplink:focus-visible {
  border-color: var(--cyber-acid);
  background: rgba(230, 255, 61, 0.05);
  transform: translateX(2px);
}

/* ------------------------------------------------------------------ optic */

.cyber-optic {
  position: relative;
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(232, 244, 248, 0.2);
  background: rgba(7, 11, 14, 0.84);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
}

.cyber-optic::after {
  content: "";
  position: absolute;
  inset: -6px;
  border: 1px solid rgba(230, 255, 61, 0.1);
  pointer-events: none;
}

.cyber-optic-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem 1rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--cyber-faint);
  font-size: 0.52rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-optic-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.cyber-rec {
  width: 6px;
  height: 6px;
  background: var(--cyber-rose);
  box-shadow: 0 0 8px rgba(255, 59, 92, 0.7);
  animation: cyber-blink 1.8s steps(1, end) infinite;
}

@keyframes cyber-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.15; }
}

.cyber-optic-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #04070A;
  border-bottom: 1px solid var(--cyber-faint);
}

/* Sinks the lit render into the feed and hides the canvas edge. */
.cyber-optic-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(72% 72% at 50% 46%, transparent 42%, rgba(4, 7, 10, 0.55) 100%);
  box-shadow: inset 0 0 70px rgba(4, 7, 10, 0.8);
}

.cyber-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  --theme-surface: #04070A;
}

.cyber-stage [data-model-poster] {
  background:
    radial-gradient(80% 70% at 50% 40%, rgba(52, 225, 245, 0.08), transparent 70%),
    #04070A;
}

.cyber-stage [data-model-poster] .display {
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 118;
  color: var(--cyber-paper);
}

.cyber-stage [data-model-poster] .mono {
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyber-dim);
  opacity: 1;
}

.cyber-stage button {
  border: 1px solid var(--cyber-acid);
  background: transparent;
  color: var(--cyber-acid);
  padding: 0.55rem 0.9rem;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.14s linear, color 0.14s linear;
}

.cyber-stage button:hover,
.cyber-stage button:focus-visible {
  background: var(--cyber-acid);
  color: var(--cyber-void);
}

.cyber-stage canvas { touch-action: pan-y !important; }

.cyber-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 0 solid var(--cyber-acid);
  opacity: 0.75;
  pointer-events: none;
  z-index: 3;
}

.cyber-bracket--tl { top: 12px; left: 12px; border-top-width: 1px; border-left-width: 1px; }
.cyber-bracket--tr { top: 12px; right: 12px; border-top-width: 1px; border-right-width: 1px; }
.cyber-bracket--bl { bottom: 12px; left: 12px; border-bottom-width: 1px; border-left-width: 1px; }
.cyber-bracket--br { bottom: 12px; right: 12px; border-bottom-width: 1px; border-right-width: 1px; }

.cyber-optic-cross {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 3;
}

.cyber-optic-cross::before,
.cyber-optic-cross::after {
  content: "";
  position: absolute;
  background: rgba(52, 225, 245, 0.45);
}

.cyber-optic-cross::before {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
}

.cyber-optic-cross::after {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
}

.cyber-optic-caption {
  position: absolute;
  left: 14px;
  bottom: 13px;
  z-index: 4;
  max-width: calc(100% - 28px);
  padding: 0.16rem 0.4rem;
  border: 1px solid rgba(52, 225, 245, 0.26);
  background: rgba(5, 7, 10, 0.66);
  font-size: 0.5rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The shared poster fallback already labels itself; avoid a second caption. */
.cyber-optic-frame:has([data-model-poster]) .cyber-optic-caption {
  display: none;
}

.cyber-optic-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 24%;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(230, 255, 61, 0.055) 55%,
    rgba(52, 225, 245, 0.05) 100%
  );
  animation: cyber-scan 7s linear infinite;
}

@keyframes cyber-scan {
  from { transform: translateY(-110%); }
  to { transform: translateY(430%); }
}

.cyber-optic-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.1rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.5rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-optic-static { display: none; }

.cyber-optic-rig {
  margin-left: auto;
  color: var(--cyber-acid);
}

@media (min-width: 980px) {
  .cyber-hero { grid-template-columns: minmax(0, 1.06fr) minmax(0, 0.94fr); }
  .cyber-optic { margin-top: 0.35rem; }
}

@media (min-width: 620px) {
  .cyber-optic-static { display: inline; }
}

/* ---------------------------------------------------------------- requisition */

.cyber-access {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.2rem;
  padding: clamp(1.4rem, 3vw, 2rem);
  border: 1px solid rgba(230, 255, 61, 0.28);
  background:
    linear-gradient(180deg, rgba(230, 255, 61, 0.04), transparent 60%),
    rgba(7, 11, 14, 0.9);
}

.cyber-access-rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid var(--cyber-faint);
  font-size: 0.52rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-access-rail span:last-child { color: var(--cyber-rose); }

.cyber-eyebrow {
  margin: 0;
  font-size: 0.54rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-access-body h2 {
  margin: 0.6rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 118;
  color: var(--cyber-paper);
}

.cyber-access-body p:last-child {
  max-width: 46ch;
  margin: 0.7rem 0 0;
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--cyber-dim);
}

.cyber-access-panel section {
  border: 0 !important;
  padding: 0 !important;
}

.cyber-access-panel h2 {
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-access-panel .display {
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variation-settings: "wdth" 118;
  color: var(--cyber-paper);
}

.cyber-access-panel p {
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--cyber-dim);
}

.cyber-access-panel button,
.cyber-access-panel a:not(.underline):not(.nav-link) {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid var(--theme-accent);
  background: var(--theme-accent);
  color: var(--theme-accent-text);
  padding: 0.95rem 1.2rem;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.14s linear, color 0.14s linear, transform 0.1s linear;
}

.cyber-access-panel button:hover,
.cyber-access-panel a:not(.underline):not(.nav-link):hover,
.cyber-access-panel button:focus-visible,
.cyber-access-panel a:not(.underline):not(.nav-link):focus-visible {
  background: transparent;
  color: var(--theme-accent);
}

.cyber-access-panel button:active { transform: translateY(1px); }

.cyber-access-panel button:disabled {
  opacity: 0.55;
  cursor: wait;
}

.cyber-access-panel .nav-link {
  color: var(--cyber-cyan);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cyber-access-panel [role="alert"] { color: var(--cyber-rose); }

@media (min-width: 860px) {
  .cyber-access {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
    column-gap: 2.4rem;
  }

  .cyber-access-rail { grid-column: 1 / -1; }
}

/* --------------------------------------------------------------- sections */

.cyber-section {
  margin-top: clamp(3.2rem, 8vh, 6rem);
  scroll-margin-top: 5.6rem;
}

.cyber-access { scroll-margin-top: 5.6rem; }

.cyber-section-rail {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(52, 225, 245, 0.24);
  font-size: 0.54rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-section-rail span:last-child { color: var(--cyber-dim); }

.cyber-section-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  padding-top: 1.6rem;
}

.cyber-prose {
  min-width: 0;
  max-width: 66ch;
  font-size: 1rem;
  line-height: 1.78;
  color: rgba(232, 244, 248, 0.84);
}

.cyber-prose > * + * { margin-top: 1.15em; }

.cyber-prose h2 {
  margin: 2.3em 0 0.7em;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: clamp(1.45rem, 3vw, 1.95rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 114;
  color: var(--cyber-paper);
}

.cyber-prose h2:first-child { margin-top: 0; }

.cyber-prose h2::before {
  content: "//";
  margin-right: 0.5rem;
  color: var(--cyber-acid);
  letter-spacing: 0;
}

.cyber-prose h3 {
  margin: 1.8em 0 0.5em;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-prose p { margin: 0; }

.cyber-prose ul,
.cyber-prose ol {
  margin: 1.1em 0 0;
  padding: 0;
  list-style: none;
}

.cyber-prose li {
  position: relative;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.cyber-prose ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 8px;
  height: 1px;
  background: var(--cyber-acid);
}

.cyber-prose ol { counter-reset: cyber-li; }

.cyber-prose ol li { counter-increment: cyber-li; }

.cyber-prose ol li::before {
  content: counter(cyber-li, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 0.08em;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--cyber-cyan);
}

.cyber-prose a {
  color: var(--cyber-paper);
  text-decoration: underline;
  text-decoration-color: rgba(230, 255, 61, 0.55);
  text-underline-offset: 4px;
  transition: color 0.14s linear;
}

.cyber-prose a:hover {
  color: var(--cyber-acid);
  text-decoration-color: var(--cyber-acid);
}

.cyber-prose strong { color: var(--cyber-paper); font-weight: 500; }

.cyber-prose blockquote {
  margin: 1.6em 0 0;
  padding: 0.9rem 1rem;
  border-left: 1px solid var(--cyber-acid);
  background: rgba(230, 255, 61, 0.04);
  color: rgba(232, 244, 248, 0.9);
}

.cyber-prose blockquote p { margin: 0; }

.cyber-prose code {
  padding: 0.12em 0.35em;
  border: 1px solid var(--cyber-faint);
  background: rgba(232, 244, 248, 0.04);
  font-size: 0.86em;
  color: var(--cyber-cyan);
}

.cyber-prose pre {
  overflow-x: auto;
  margin: 1.4em 0 0;
  padding: 1rem 1.1rem;
  border: 1px solid var(--cyber-faint);
  background: #070B0E;
}

.cyber-prose pre code {
  padding: 0;
  border: 0;
  background: none;
  color: rgba(232, 244, 248, 0.86);
}

.cyber-prose img { width: 100%; height: auto; border: 1px solid var(--cyber-faint); }

.cyber-prose hr {
  margin: 2em 0;
  border: 0;
  border-top: 1px dashed rgba(232, 244, 248, 0.2);
}

/* ------------------------------------------------------------------- meta */

.cyber-meta {
  align-self: start;
  padding: 1.1rem;
  border: 1px solid var(--cyber-faint);
  background: rgba(7, 11, 14, 0.72);
}

.cyber-meta dl {
  margin: 0.9rem 0 0;
}

.cyber-meta dl div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.42rem 0;
  border-bottom: 1px solid rgba(232, 244, 248, 0.08);
}

.cyber-meta dl div:last-child { border-bottom: 0; }

.cyber-meta dt {
  font-size: 0.52rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-meta dd {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cyber-paper);
  text-align: right;
}

.cyber-meta-links {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
}

.cyber-meta-links .cyber-uplink {
  grid-template-columns: 1fr auto;
  padding: 0.55rem 0.65rem;
}

.cyber-meta-links .cyber-uplink-hint { display: none; }

@media (min-width: 900px) {
  .cyber-section-body {
    grid-template-columns: minmax(0, 1fr) 250px;
    gap: 3rem;
  }

  .cyber-meta { position: sticky; top: 5.4rem; }
}

/* --------------------------------------------------------------- captures */

.cyber-captures {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.1rem;
  padding-top: 1.6rem;
}

@media (min-width: 820px) {
  .cyber-captures { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.4rem; }
}

.cyber-shot { margin: 0; }

.cyber-shot-window {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border: 1px solid var(--cyber-faint);
  background: #070B0E;
  transition: border-color 0.16s linear;
}

.cyber-shot-img {
  object-fit: cover;
  filter: saturate(0.9) contrast(1.02);
  transition: transform 0.35s var(--cyber-ease), filter 0.2s linear;
}

.cyber-shot-no {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 0.12rem 0.35rem;
  border: 1px solid rgba(52, 225, 245, 0.3);
  background: rgba(5, 7, 10, 0.68);
  font-size: 0.5rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-shot-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 34%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(180deg, transparent, rgba(52, 225, 245, 0.16), transparent);
  transition: opacity 0.2s linear;
}

.cyber-shot figcaption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid transparent;
  font-size: 0.54rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-shot figcaption span:first-child { color: var(--cyber-paper); }

.cyber-shot:hover .cyber-shot-img,
.cyber-shot:focus-within .cyber-shot-img {
  transform: scale(1.025);
  filter: saturate(1.05) contrast(1.04);
}

.cyber-shot:hover .cyber-shot-window,
.cyber-shot:focus-within .cyber-shot-window {
  border-color: rgba(230, 255, 61, 0.55);
}

.cyber-shot:hover .cyber-shot-scan {
  opacity: 1;
  animation: cyber-shot-scan 1.9s linear infinite;
}

@keyframes cyber-shot-scan {
  from { transform: translateY(-120%); }
  to { transform: translateY(320%); }
}

/* ---------------------------------------------------------------- signals */

.cyber-signals {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--cyber-faint);
}

.cyber-signal {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem 1rem;
  padding: 1rem 0.6rem 1rem 0.4rem;
  border-bottom: 1px solid var(--cyber-faint);
  color: var(--cyber-paper);
  text-decoration: none;
  transition: background 0.14s linear, padding-left 0.2s var(--cyber-ease);
}

.cyber-signal-no {
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  color: var(--cyber-dim);
}

.cyber-signal-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: clamp(1.1rem, 2.6vw, 1.55rem);
  font-weight: 500;
  letter-spacing: -0.015em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 112;
  transition: color 0.14s linear;
}

.cyber-signal-year {
  display: none;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  color: var(--cyber-dim);
}

.cyber-signal-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}

.cyber-signal-bars i {
  display: block;
  width: 3px;
  background: var(--cyber-cyan);
  opacity: 0.7;
}

.cyber-signal-bars i:nth-child(4),
.cyber-signal-bars i:nth-child(5) { background: var(--cyber-acid); }

.cyber-signal-arrow {
  display: none;
  font-size: 0.9rem;
  color: var(--cyber-acid);
  transition: transform 0.16s var(--cyber-ease);
}

.cyber-signal:hover,
.cyber-signal:focus-visible {
  background: rgba(230, 255, 61, 0.05);
  padding-left: 0.75rem;
}

.cyber-signal:hover .cyber-signal-title,
.cyber-signal:focus-visible .cyber-signal-title { color: var(--cyber-acid); }

.cyber-signal:hover .cyber-signal-arrow,
.cyber-signal:focus-visible .cyber-signal-arrow { transform: translate(2px, -2px); }

@media (min-width: 700px) {
  .cyber-signal { grid-template-columns: auto minmax(0, 1fr) auto auto auto; }
  .cyber-signal-year { display: inline; }
  .cyber-signal-arrow { display: inline; }
}

/* ------------------------------------------------------------------- next */

.cyber-next {
  margin-top: clamp(3.2rem, 8vh, 5.6rem);
  border-top: 1px solid rgba(230, 255, 61, 0.32);
  border-bottom: 1px solid var(--cyber-faint);
}

.cyber-next a {
  display: block;
  padding: clamp(1.2rem, 3vw, 1.8rem) 0;
  color: inherit;
  text-decoration: none;
}

.cyber-next-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.52rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-next-year { color: var(--cyber-dim); }

.cyber-next-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.cyber-next-title {
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: clamp(2.2rem, 6.4vw, 4.8rem);
  font-weight: 600;
  line-height: 0.92;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 118;
  color: var(--cyber-paper);
  transition: color 0.16s linear;
}

.cyber-next-arrow {
  flex: none;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  color: var(--cyber-acid);
  transition: transform 0.16s var(--cyber-ease);
}

.cyber-next a:hover .cyber-next-title,
.cyber-next a:focus-visible .cyber-next-title { color: var(--cyber-acid); }

.cyber-next a:hover .cyber-next-arrow,
.cyber-next a:focus-visible .cyber-next-arrow { transform: translateX(6px); }

/* ----------------------------------------------------------------- footer */

.cyber-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem 1.6rem;
  margin-top: clamp(2.6rem, 6vh, 4rem);
  padding: 1.1rem 0 2.6rem;
  border-top: 1px solid var(--cyber-faint);
  font-size: 0.52rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyber-dim);
}

.cyber-footer-code { color: var(--cyber-paper); }

.cyber-footer-node { color: var(--cyber-cyan); }

.cyber-footer-link {
  color: var(--cyber-acid);
  text-decoration: none;
}

.cyber-footer-link:hover { text-decoration: underline; text-underline-offset: 4px; }

@media (max-width: 760px) {
  /* The two-row HUD is too tall to pin on a phone. */
  .cyber-topbar { position: static; backdrop-filter: none; }
  .cyber-section,
  .cyber-access { scroll-margin-top: 1rem; }
}

@media (max-width: 640px) {
  .cyber-footer-mid { display: none; }
}

/* ------------------------------------------------------------------- boot */

.cyber-boot {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  padding: 20px;
  overflow-y: auto;
  background:
    radial-gradient(70% 56% at 50% 30%, rgba(52, 225, 245, 0.09), transparent 70%),
    #04070A;
}

.cyber-boot:focus { outline: none; }

.cyber-boot::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.035) 0 1px,
    transparent 1px 3px
  );
}

.cyber-boot.is-closing {
  animation: cyber-handshake-out 0.32s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes cyber-handshake-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.cyber-boot-card {
  position: relative;
  width: min(620px, 100%);
  border: 1px solid rgba(52, 225, 245, 0.34);
  background: rgba(7, 11, 14, 0.94);
  padding: clamp(1.1rem, 3vw, 1.8rem);
  box-shadow:
    0 0 0 1px rgba(230, 255, 61, 0.1),
    0 40px 120px rgba(0, 0, 0, 0.7);
}

.cyber-boot-card::before,
.cyber-boot-card::after {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid var(--cyber-acid);
}

.cyber-boot-card::before {
  top: -1px;
  left: -1px;
  border-right: 0;
  border-bottom: 0;
}

.cyber-boot-card::after {
  right: -1px;
  bottom: -1px;
  border-left: 0;
  border-top: 0;
}

.cyber-boot-top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--cyber-faint);
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cyber-cyan);
}

.cyber-boot-brand {
  margin: 1rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, sans-serif;
  font-size: clamp(2rem, 6.4vw, 3.2rem);
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  font-variation-settings: "wdth" 118;
  color: var(--cyber-paper);
  text-shadow: 3px 0 0 rgba(255, 59, 92, 0.55);
}

.cyber-boot-brand span { color: var(--cyber-acid); text-shadow: none; }

.cyber-boot-meter {
  position: relative;
  height: 2px;
  margin-top: 1.1rem;
  background: rgba(232, 244, 248, 0.1);
  overflow: hidden;
}

.cyber-boot-meter span {
  position: absolute;
  inset: 0;
  background: var(--cyber-acid);
  transform-origin: left;
  animation: cyber-meter 1.05s cubic-bezier(0.6, 0, 0.4, 1) forwards;
}

@keyframes cyber-meter {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.cyber-boot-log {
  display: grid;
  gap: 0.34rem;
  min-height: 6.2em;
  margin-top: 1.2rem;
  font-size: clamp(0.6rem, 1.2vw, 0.76rem);
  line-height: 1.5;
  color: rgba(232, 244, 248, 0.78);
}

.cyber-boot-line {
  margin: 0;
  opacity: 0;
  animation: cyber-log-in 0.22s linear var(--line-delay, 0s) forwards;
}

.cyber-boot-line::before {
  content: "> ";
  color: var(--cyber-acid);
}

@keyframes cyber-log-in {
  from { opacity: 0; transform: translateX(-4px); }
  to { opacity: 1; transform: none; }
}

.cyber-boot-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.3rem;
  opacity: 0;
  animation: cyber-log-in 0.24s linear 1.08s forwards;
}

.cyber-boot-accept {
  border: 1px solid var(--cyber-acid);
  background: var(--cyber-acid);
  color: var(--cyber-void);
  padding: 0.85rem 1.1rem;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.14s linear, color 0.14s linear;
}

.cyber-boot-accept:hover,
.cyber-boot-accept:focus-visible {
  background: transparent;
  color: var(--cyber-acid);
}

.cyber-boot-skip {
  border: 0;
  background: none;
  color: var(--cyber-dim);
  padding: 0.4rem 0.2rem;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.cyber-boot-skip:hover { color: var(--cyber-paper); }

.cyber-boot-foot {
  margin: 1.1rem 0 0;
  font-size: 0.48rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(232, 244, 248, 0.4);
}

/* ----------------------------------------------------------------- cursor */

.cyber-cursor-on,
.cyber-cursor-on * { cursor: none !important; }

.cyber-cursor {
  position: fixed;
  inset: 0;
  z-index: 250;
  pointer-events: none;
  display: none;
}

.cyber-cursor[data-active="true"] { display: block; }

.cyber-cursor-reticle {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  will-change: transform;
}

.cyber-cursor-ring {
  position: absolute;
  top: -13px;
  left: -13px;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(230, 255, 61, 0.55);
  background:
    linear-gradient(90deg, var(--cyber-acid), var(--cyber-acid)) left top / 7px 1px no-repeat,
    linear-gradient(90deg, var(--cyber-acid), var(--cyber-acid)) right top / 7px 1px no-repeat,
    linear-gradient(90deg, var(--cyber-acid), var(--cyber-acid)) left bottom / 7px 1px no-repeat,
    linear-gradient(90deg, var(--cyber-acid), var(--cyber-acid)) right bottom / 7px 1px no-repeat,
    linear-gradient(180deg, var(--cyber-acid), var(--cyber-acid)) left top / 1px 7px no-repeat,
    linear-gradient(180deg, var(--cyber-acid), var(--cyber-acid)) right top / 1px 7px no-repeat,
    linear-gradient(180deg, var(--cyber-acid), var(--cyber-acid)) left bottom / 1px 7px no-repeat,
    linear-gradient(180deg, var(--cyber-acid), var(--cyber-acid)) right bottom / 1px 7px no-repeat;
  box-shadow: 0 0 18px rgba(230, 255, 61, 0.18);
  transition: transform 0.12s var(--cyber-ease), border-color 0.12s linear;
}

.cyber-cursor[data-hover="true"] .cyber-cursor-ring {
  transform: rotate(45deg) scale(0.86);
  border-color: rgba(52, 225, 245, 0.7);
}

.cyber-cursor-lock {
  position: absolute;
  top: 18px;
  left: 20px;
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.46rem;
  letter-spacing: 0.16em;
  color: var(--cyber-acid);
  opacity: 0;
  transition: opacity 0.12s linear;
}

.cyber-cursor[data-hover="true"] .cyber-cursor-lock { opacity: 1; }

.cyber-cursor-coord {
  position: absolute;
  top: 20px;
  left: -22px;
  display: flex;
  gap: 0.15rem;
  padding: 0.1rem 0.28rem;
  background: rgba(5, 7, 10, 0.82);
  border: 1px solid rgba(232, 244, 248, 0.16);
  font-family: var(--font-plex-mono), ui-monospace, monospace;
  font-size: 0.44rem;
  letter-spacing: 0.1em;
  color: rgba(232, 244, 248, 0.66);
  white-space: nowrap;
}

.cyber-cursor-coord span { color: var(--cyber-cyan); }

/* --------------------------------------------------------------- entrance */

.cyber-rise { opacity: 1; }

.cyber-root[data-booted] .cyber-rise {
  animation: cyber-rise 0.46s var(--cyber-ease) both;
  animation-delay: var(--cyber-stagger, 0ms);
}

@keyframes cyber-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

.cyber-root[data-booted] .cyber-optic {
  animation: cyber-optic-on 0.5s var(--cyber-ease) 0.08s both;
}

@keyframes cyber-optic-on {
  from { opacity: 0.15; transform: scaleY(0.96); }
  to { opacity: 1; transform: none; }
}

/* -------------------------------------------------------- scroll reveals */

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .cyber-reveal {
      animation: cyber-view linear both;
      animation-timeline: view();
      animation-range: entry 4% entry 34%;
    }

    @keyframes cyber-view {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: none; }
    }
  }
}

/* --------------------------------------------------------- reduced motion */

@media (prefers-reduced-motion: reduce) {
  .cyber-boot { display: none !important; }
  .cyber-cursor { display: none !important; }
  .cyber-optic-static { display: inline; }
  .cyber-block-lit,
  .cyber-cables span,
  .cyber-reticle::after,
  .cyber-rec,
  .cyber-dot,
  .cyber-title-ghost,
  .cyber-optic-scan,
  .cyber-progress span,
  .cyber-boot-meter span { animation: none !important; }

  .cyber-title-ghost { display: none; }

  .cyber-root[data-booted] .cyber-rise,
  .cyber-root[data-booted] .cyber-optic,
  .cyber-reveal {
    animation: none !important;
    opacity: 1;
    transform: none;
  }

  .cyber-shot:hover .cyber-shot-img,
  .cyber-shot:hover .cyber-shot-scan,
  .cyber-signal:hover,
  .cyber-uplink:hover {
    transform: none;
  }

  .cyber-shot:hover .cyber-shot-scan { opacity: 0; }

  .cyber-scene { transition: none; }
}
`;
